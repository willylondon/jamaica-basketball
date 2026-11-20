import { readdir, readFile } from "node:fs/promises";
import matter from "gray-matter";
import { blotatoChannels, blotatoPostStatus, submitBlotatoPost, verifyBlotatoTarget } from "./blotato.mjs";
import { graph, instagramHost } from "./services.mjs";
import { publicationLedger } from "./publication-ledger.mjs";
import { telegram, verifyTelegramTarget } from "./telegram.mjs";

const site = "https://jamaicabasketball.online";
const limits = { instagram: 2000, facebook: 4000 };
const channelsSupported = [...Object.keys(limits), "telegram", ...blotatoChannels];
const placeholderPhoto = /(?:^|[._-])(?:logo|placeholder|og-default)(?:[._-]|$)/i;
const slugFormat = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const idFormat = /^\d+$/;
const dateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Jamaica", year: "numeric", month: "2-digit", day: "2-digit",
});

function configuredChannels() {
  const setting = process.env.NEWSROOM_PUBLISH_CHANNELS?.trim();
  if (!setting) return Object.keys(limits);
  const channels = [...new Set(setting.split(",").map((channel) => channel.trim()))];
  if (channels.some((channel) => !channelsSupported.includes(channel))) {
    throw new Error("Unknown newsroom publication channel");
  }
  return channels;
}

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
    const { slug, title, excerpt, image, instagramImage, instagramCaption, facebookCaption } = data;
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
    posts.push({ slug, date, title, excerpt, image, instagramImage, captions });
  }
  return posts;
}

async function liveArticle(url) {
  const response = await fetch(url, { redirect: "error", cache: "no-store", signal: AbortSignal.timeout(12000) });
  if (response.status === 404) return "";
  if (!response.ok) throw new Error("The published site did not respond successfully");
  return response.text();
}

function articlePhotoUrl(image) {
  if (typeof image !== "string" || !image.trim()) return null;
  const url = URL.parse(image, site);
  if (!url || url.origin !== site || url.username || url.password || url.hash ||
      placeholderPhoto.test(url.pathname.split("/").at(-1))) return null;
  return url;
}

async function photoHeaders(url) {
  const response = await fetch(url, {
    method: "HEAD", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(12000),
  });
  return response.ok ? response.headers : null;
}

async function facebookPreviewMatches(html, image) {
  const expected = articlePhotoUrl(image);
  if (!expected) return false;
  const previewTag = html.match(/<meta\b[^>]*\sproperty="og:image"[^>]*>/i)?.[0];
  const preview = previewTag?.match(/\scontent="([^"]+)"/i)?.[1].replaceAll("&amp;", "&");
  if (preview !== expected.href) return false;

  const headers = await photoHeaders(expected);
  return /^image\/(?:jpeg|png|webp|gif)(?:;|$)/i.test(headers?.get("content-type") || "");
}

async function instagramPhotoUrl(image) {
  const url = articlePhotoUrl(image);
  if (!url) return null;
  const headers = await photoHeaders(url);
  if (!/^image\/jpeg(?:;|$)/i.test(headers?.get("content-type") || "") ||
      Number(headers.get("content-length")) > 8_000_000) return null;
  return url.href;
}

async function tiktokPhotoUrl(image) {
  const url = articlePhotoUrl(image);
  if (!url) return null;
  const headers = await photoHeaders(url);
  if (!/^image\/(?:jpeg|webp)(?:;|$)/i.test(headers?.get("content-type") || "") ||
      Number(headers.get("content-length")) > 20_000_000) return null;
  return url.href;
}

async function target(channel) {
  if (blotatoChannels.includes(channel)) return verifyBlotatoTarget(channel);
  if (channel === "telegram") return verifyTelegramTarget();
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
  const me = await graph("me", token, { fields: "id,can_post" });
  if (me.id !== id || me.can_post !== true) throw new Error("Facebook Page ID or posting permission could not be verified");
  return { id, token };
}

export async function verifyTargets() {
  const accounts = await Promise.all(configuredChannels().map(async (channel) => {
    const { id } = await target(channel);
    return { channel, id };
  }));
  return accounts;
}

async function send(channel, account, caption, url, photo) {
  const { id, token, host } = account;
  if (channel === "telegram") {
    const sent = await telegram("sendMessage", token, { chat_id: id, text: `${caption}\n\n${url}`, link_preview_options: { url } });
    return { id: String(sent?.message_id || "") };
  }
  if (channel === "facebook") return graph(`${id}/feed`, token, { message: caption.trim(), link: url }, "POST");
  const container = await graph(`${id}/media`, token, {
    image_url: photo, caption: `${caption.trim()}\n\n${url}`,
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
  const channels = configuredChannels();
  const today = dateFormat.format(now);
  const cutoff = new Date(Date.parse(today) - 6 * 86400_000).toISOString().slice(0, 10);
  const results = [];
  const accounts = new Map();
  const telegramStart = process.env.TELEGRAM_START_DATE;
  const blotatoStart = process.env.BLOTATO_START_DATE;
  for (const { slug, date, title, excerpt, image, instagramImage, captions } of posts) {
    if (date < cutoff || date > today) continue;
    const url = `${site}/posts/${slug}`;
    if (!live) {
      results.push({ slug, status: "dry-run" });
      continue;
    }
    const article = await liveArticle(url).catch(() => null);
    if (article === null) {
      results.push({ slug, status: "site-check-error" });
      continue;
    }
    if (!article.includes(`data-newsroom-syndication="${slug}"`)) {
      results.push({ slug, status: "waiting-for-site" });
      continue;
    }
    for (const channel of channels) {
      const viaBlotato = blotatoChannels.includes(channel);
      const start = viaBlotato ? blotatoStart : telegramStart;
      if ((viaBlotato || channel === "telegram") && (!start || publicationDate(start) !== start || date < start)) continue;
      if (channel === "facebook" && !await facebookPreviewMatches(article, image).catch(() => false)) {
        results.push({ slug, channel, status: "waiting-for-facebook-preview" });
        continue;
      }
      let photo;
      if (channel === "instagram") {
        photo = await instagramPhotoUrl(instagramImage || image).catch(() => null);
        if (!photo) {
          results.push({ slug, channel, status: "waiting-for-instagram-photo" });
          continue;
        }
      }
      if (channel === "tiktok") {
        photo = await tiktokPhotoUrl(instagramImage || image).catch(() => null);
        if (!photo) {
          results.push({ slug, channel, status: "waiting-for-tiktok-photo" });
          continue;
        }
      }
      if (channel === "twitter" && !await facebookPreviewMatches(article, image).catch(() => false)) {
        results.push({ slug, channel, status: "waiting-for-x-preview" });
        continue;
      }
      const caption = channel === "telegram" ? [title || slug, excerpt].filter(Boolean).join("\n\n").slice(0, 3600) : captions[channel];
      let claimed = false;
      try {
        if (!accounts.has(channel)) accounts.set(channel, await target(channel));
        const account = accounts.get(channel);
        const ledger = publicationLedger(`jb:syndication:${channel}:${account.id}:${slug}`);
        const reservation = await ledger.reserve();
        if (viaBlotato && (reservation === "reserved" || reservation.startsWith("blotato-pending:"))) {
          claimed = true;
          let submissionId = reservation.slice("blotato-pending:".length);
          if (reservation === "reserved") {
            submissionId = await submitBlotatoPost(channel, account, { title: title || slug, excerpt, url, photo });
            await ledger.record(`blotato-pending:${submissionId}`);
          }
          const status = await blotatoPostStatus(account, submissionId);
          if (status === "published") {
            await ledger.record(`blotato-published:${submissionId}`);
            results.push({ slug, channel, status: "published" });
          } else {
            const pending = status === "in-progress" || status === "scheduled";
            results.push({ slug, channel, status: pending ? "submitted" : "needs-review", submissionId });
          }
          continue;
        }
        if (reservation !== "reserved") {
          results.push({ slug, channel, status: reservation });
          continue;
        }
        claimed = true;
        const result = await send(channel, account, caption, url, photo);
        if (!result.id) throw new Error("Publication response had no ID");
        await ledger.record(result.id);
        results.push({ slug, channel, status: "published" });
      } catch {
        results.push({ slug, channel, status: claimed ? "needs-review" : "configuration-or-service-error" });
      }
    }
  }
  return results;
}
