import { readdir, readFile } from "node:fs/promises";
import matter from "gray-matter";
import { graph, instagramHost, redis } from "./services.mjs";

const site = "https://jamaicabasketball.online";
const limits = { instagram: 2000, facebook: 4000 };
const photo = "/logo.jpg";
const slugFormat = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const idFormat = /^\d+$/;
const dateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Jamaica", year: "numeric", month: "2-digit", day: "2-digit",
});

function publicationDate(value) {
  if (value instanceof Date && Number.isFinite(value.valueOf())) {
    const iso = value.toISOString();
    return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : dateFormat.format(value);
  }
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T.*(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.valueOf()) || new Date(value.slice(0, 10)).toISOString().slice(0, 10) !== value.slice(0, 10)) return null;
  return value.length === 10 ? value : dateFormat.format(date);
}

export async function approvedPosts(directory = "content/posts") {
  const posts = [];
  const slugs = new Set();
  for (const file of (await readdir(directory)).filter((name) => name.endsWith(".mdx")).sort()) {
    const { data } = matter(await readFile(`${directory}/${file}`, "utf8"));
    if (data.draft !== false || data.syndicate !== true) continue;
    const { slug, instagramCaption, facebookCaption } = data;
    const date = publicationDate(data.date);
    if (typeof slug !== "string" || !slugFormat.test(slug) || slugs.has(slug) || !date) {
      throw new Error(`Invalid or duplicate syndication slug or date in ${file}`);
    }
    const captions = { instagram: instagramCaption, facebook: facebookCaption };
    for (const [channel, caption] of Object.entries(captions)) {
      if (typeof caption !== "string" || !caption.trim() || caption.length > limits[channel]) {
        throw new Error(`Invalid ${channel} caption in ${file}`);
      }
    }
    slugs.add(slug);
    posts.push({ slug, date, captions });
  }
  return posts;
}

async function checkLive(url, slug) {
  const response = await fetch(url, { redirect: "error", cache: "no-store", signal: AbortSignal.timeout(12000) });
  if (response.status === 404) return false;
  if (!response.ok) throw new Error("The published site did not respond successfully");
  return (await response.text()).includes(`data-newsroom-syndication="${slug}"`);
}

async function target(channel) {
  if (channel === "instagram") {
    const { IG_ACCOUNT_ID: id, IG_ACCESS_TOKEN: token } = process.env;
    if (!idFormat.test(id || "") || !token) throw new Error("Instagram publication is not configured");
    const host = instagramHost();
    const unified = host === "graph.facebook.com";
    const account = unified
      ? (await graph("me/assigned_instagram_accounts", token, { fields: "id,username" })).data?.find((entry) => String(entry.id) === id)
      : await graph("me", token, { fields: "user_id,username" }, "GET", host);
    if (String(unified ? account?.id : account?.user_id) !== id ||
        account?.username?.toLowerCase() !== "jamaicabasketball") throw new Error("Instagram account verification failed");
    return { id, token, host };
  }
  const { FB_PAGE_ID: id, FB_PAGE_ACCESS_TOKEN: pageToken, IG_ACCESS_TOKEN: systemToken } = process.env;
  if (!idFormat.test(id || "")) throw new Error("Facebook publication is not configured");
  let token = pageToken;
  if (!token && process.env.IG_API_MODE === "unified" && systemToken) {
    const { data } = await graph("me/accounts", systemToken, { fields: "id,access_token" });
    token = data?.find((page) => String(page.id) === id)?.access_token;
  }
  if (!token) throw new Error("Facebook publication is not configured");
  const me = await graph("me", token, { fields: "id" });
  if (me.id !== id) throw new Error("Facebook Page verification failed");
  return { id, token };
}

export async function verifyTargets() {
  const accounts = await Promise.all(Object.keys(limits).map(async (channel) => {
    const { id } = await target(channel);
    return { channel, id };
  }));
  return accounts;
}

async function send(channel, account, caption, url) {
  const { id, token, host } = account;
  if (channel === "facebook") return graph(`${id}/feed`, token, { message: caption.trim(), link: url }, "POST");
  const container = await graph(`${id}/media`, token, {
    image_url: `${site}${photo}`, caption: `${caption.trim()}\n\n${url}`,
  }, "POST", host);
  if (!idFormat.test(container.id || "")) throw new Error("Instagram did not return a container ID");
  for (let attempt = 0; attempt < 12; attempt++) {
    const status = await graph(container.id, token, { fields: "status_code" }, "GET", host);
    if (status.status_code === "FINISHED") {
      return graph(`${id}/media_publish`, token, { creation_id: container.id }, "POST", host);
    }
    if (status.status_code !== "IN_PROGRESS") throw new Error("Instagram container did not finish");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error("Instagram container timed out");
}

export async function syndicate(posts, live, now = new Date()) {
  const today = dateFormat.format(now);
  const cutoff = new Date(Date.parse(today) - 6 * 86400_000).toISOString().slice(0, 10);
  const results = [];
  const accounts = new Map();
  for (const { slug, date, captions } of posts) {
    if (date < cutoff || date > today) continue;
    const url = `${site}/posts/${slug}`;
    if (!live) {
      results.push({ slug, status: "dry-run" });
      continue;
    }
    const deployed = await checkLive(url, slug).catch(() => null);
    if (deployed === null) {
      results.push({ slug, status: "site-check-error" });
      continue;
    }
    if (!deployed) {
      results.push({ slug, status: "waiting-for-site" });
      continue;
    }
    for (const [channel, caption] of Object.entries(captions)) {
      let key;
      let claimed = false;
      try {
        if (!accounts.has(channel)) accounts.set(channel, await target(channel));
        const account = accounts.get(channel);
        key = `jb:syndication:${channel}:${account.id}:${slug}`;
        claimed = await redis("SET", key, "sending", "NX") === "OK";
        if (!claimed) {
          const saved = await redis("GET", key);
          const previous = saved && saved !== "sending" ? JSON.parse(saved) : null;
          results.push({ slug, channel, status: previous?.publicationId ? "already-published" : "needs-review" });
          continue;
        }
        const result = await send(channel, account, caption, url);
        if (!result.id) throw new Error("Publication response had no ID");
        await redis("SET", key, JSON.stringify({ publicationId: result.id, at: new Date().toISOString() }));
        results.push({ slug, channel, status: "published" });
      } catch {
        results.push({ slug, channel, status: claimed ? "needs-review" : "configuration-or-service-error" });
      }
    }
  }
  return results;
}
