import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { handleInstagramEvent, instagramEvents, replyText, signatureMatches } from "./inbox.mjs";
import { approvedPosts, syndicate, verifyTargets } from "./publish.mjs";
import { publicationLedger } from "./publication-ledger.mjs";
import { handleTelegramCommunityUpdate } from "./telegram-community.mjs";
import { matchesTelegramSecret, moderateTelegramUpdate } from "./telegram-moderation.mjs";

function mockedProviders(t, overrides, fetchHandler) {
  const previous = new Map(Object.keys(overrides).map((key) => [key, process.env[key]]));
  Object.assign(process.env, overrides);
  t.after(() => {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  const ledger = new Map();
  t.mock.method(globalThis, "fetch", (url, options) => {
    if (new URL(url).hostname === "redis.example") {
      const [command, key, value, condition] = JSON.parse(options.body);
      if (command === "GET") return Response.json({ result: ledger.get(key) ?? null });
      assert.equal(command, "SET");
      if (condition === "NX" && ledger.has(key)) return Response.json({ result: null });
      ledger.set(key, value);
      return Response.json({ result: "OK" });
    }
    return fetchHandler(new URL(url), options);
  });
  return ledger;
}

const redisEnv = { UPSTASH_REDIS_REST_URL: "https://redis.example", UPSTASH_REDIS_REST_TOKEN: "fixture" };
const metaEnv = {
  META_GRAPH_VERSION: "v27.0", IG_API_MODE: "instagram-login",
  IG_ACCOUNT_ID: "1", IG_ACCESS_TOKEN: "fixture", NEWSROOM_PUBLISH_CHANNELS: "", NEWSROOM_PUBLICATION_LEDGER: "",
};

const featuredPhoto = "/images/qualifying-game.jpg";
const site = "https://jamaicabasketball.online";
const approvedPost = {
  slug: "approved", date: "2026-11-19", image: featuredPhoto,
  captions: { instagram: "IG", facebook: "FB" },
};

function livePost(preview) {
  const metadata = preview ? `<meta property="og:image" content="${site}${preview}">` : "";
  return new Response(`${metadata}<article data-newsroom-syndication="approved">`);
}

test("only explicit approvals enter the queue and dry-run sends no requests", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "jb-newsroom-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  t.mock.method(globalThis, "fetch", () => assert.fail("Dry-run attempted a provider request"));
  const frontmatter = (slug, draft) => [
    "---", `slug: "${slug}"`, 'date: "2026-11-19"', `draft: ${draft}`,
    "syndicate: true", `image: "${featuredPhoto}"`, 'instagramCaption: "Instagram caption"', 'facebookCaption: "Facebook caption"', "---",
  ].join("\n");
  await writeFile(join(directory, "approved.mdx"), frontmatter("approved", false));
  await writeFile(join(directory, "draft.mdx"), frontmatter("draft", true));
  const posts = await approvedPosts(directory);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].image, featuredPhoto);
  assert.deepEqual(await syndicate(posts, false, new Date("2026-11-20T02:00:00Z")), [
    { slug: "approved", status: "dry-run" },
  ]);
  await writeFile(join(directory, "duplicate.mdx"), frontmatter("approved", false));
  await assert.rejects(approvedPosts(directory), /duplicate syndication/);
});

test("site verification gates publication and an uncertain send stays claimed", async (t) => {
  const posts = [approvedPost];
  const now = new Date("2026-11-19T15:00:00Z");
  let deployed = false;
  let instagramSends = 0;
  let facebookSends = 0;
  const ledger = mockedProviders(t, { ...redisEnv, ...metaEnv, FB_PAGE_ID: "2", FB_PAGE_ACCESS_TOKEN: "fixture" }, (url, options) => {
    if (url.hostname === "jamaicabasketball.online") {
      if (url.pathname === featuredPhoto) return new Response(null, { headers: { "content-type": "image/jpeg" } });
      return deployed ? livePost(featuredPhoto) : new Response(null, { status: 404 });
    }
    if (url.href.includes("graph.instagram.com")) {
      if (url.pathname.endsWith("/me")) return Response.json({ user_id: "1", username: "jamaicabasketball" });
      if (url.pathname.endsWith("/media")) {
        assert.equal(JSON.parse(options.body).image_url, site + featuredPhoto);
        return Response.json({ id: "42" });
      }
      if (url.pathname.endsWith("/42")) return Response.json({ status_code: "FINISHED" });
      if (url.pathname.endsWith("/media_publish")) {
        instagramSends++;
        throw new Error("Unconfirmed provider response");
      }
    }
    if (url.pathname.endsWith("/me")) return Response.json({ id: "2", can_post: true });
    if (url.pathname.endsWith("/feed")) {
      facebookSends++;
      return Response.json({ id: "2_27" });
    }
    assert.fail(`Unexpected provider call to ${url.hostname}`);
  });
  assert.deepEqual(await syndicate(posts, true, now), [{ slug: "approved", status: "waiting-for-site" }]);
  assert.equal(ledger.size, 0);
  deployed = true;
  assert.deepEqual((await syndicate(posts, true, now)).map(({ status }) => status), ["needs-review", "published"]);
  assert.deepEqual((await syndicate(posts, true, now)).map(({ status }) => status), ["needs-review", "already-published"]);
  assert.equal(instagramSends, 1);
  assert.equal(facebookSends, 1);
});

test("Unified Login verifies the assigned Instagram and derives only the configured Page token", async (t) => {
  let username = "jamaicabasketball";
  mockedProviders(t, { ...metaEnv, IG_API_MODE: "unified", FB_PAGE_ID: "2", FB_PAGE_ACCESS_TOKEN: "" }, (url, options) => {
    assert.equal(url.hostname, "graph.facebook.com");
    assert.equal(options.method, undefined, "Preflight must be read-only");
    if (url.pathname.endsWith("/assigned_instagram_accounts")) {
      return Response.json({ data: [{ id: "33", username: "other" }, { id: "1", username }] });
    }
    if (url.pathname.endsWith("/me/accounts")) {
      return Response.json({ data: [{ id: "44", access_token: "other" }, { id: "2", access_token: "page-fixture" }] });
    }
    assert.equal(url.pathname, "/v27.0/me");
    assert.equal(options.headers.Authorization, "Bearer page-fixture");
    return Response.json({ id: "2", can_post: true });
  });
  assert.deepEqual(await verifyTargets(), [{ channel: "instagram", id: "1" }, { channel: "facebook", id: "2" }]);
  username = "wrong";
  await assert.rejects(verifyTargets(), /Instagram account verification failed/);
});

test("Facebook-only preflight and publication never contact Instagram", async (t) => {
  const environment = {
    ...redisEnv, ...metaEnv, NEWSROOM_PUBLISH_CHANNELS: "facebook",
    FB_PAGE_ID: "2", FB_PAGE_ACCESS_TOKEN: "page-fixture", IG_ACCESS_TOKEN: "",
  };
  let sends = 0;
  let canPost = true;
  mockedProviders(t, environment, (url) => {
    if (url.hostname === "jamaicabasketball.online") {
      if (url.pathname === featuredPhoto) return new Response(null, { headers: { "content-type": "image/jpeg" } });
      return livePost(featuredPhoto);
    }
    assert.equal(url.hostname, "graph.facebook.com");
    if (url.pathname === "/v27.0/me") {
      assert.equal(url.searchParams.get("fields"), "id,can_post");
      return Response.json({ id: "2", can_post: canPost });
    }
    assert.equal(url.pathname, "/v27.0/2/feed");
    sends++;
    return Response.json({ id: "2_30" });
  });
  assert.deepEqual(await verifyTargets(), [{ channel: "facebook", id: "2" }]);
  const posts = [approvedPost];
  assert.deepEqual(await syndicate(posts, true, new Date("2026-11-19T15:00:00Z")), [
    { slug: "approved", channel: "facebook", status: "published" },
  ]);
  assert.equal(sends, 1);
  canPost = false;
  await assert.rejects(verifyTargets(), /posting permission could not be verified/);
});

test("Facebook waits for a matching live photo before contacting Meta or reserving a post", async (t) => {
  const env = {
    ...redisEnv, ...metaEnv, NEWSROOM_PUBLISH_CHANNELS: "facebook",
    FB_PAGE_ID: "2", FB_PAGE_ACCESS_TOKEN: "fixture",
  };
  const now = new Date("2026-11-19T15:00:00Z");
  let preview;
  let imageStatus = 404;
  let mime = "image/jpeg";
  let photoChecks = 0;
  const ledger = mockedProviders(t, env, (url, options) => {
    assert.equal(url.hostname, "jamaicabasketball.online");
    if (url.pathname === featuredPhoto) {
      assert.equal(options.method, "HEAD");
      photoChecks++;
      return new Response(null, { status: imageStatus, headers: { "content-type": mime } });
    }
    assert.equal(url.pathname, "/posts/approved");
    return livePost(preview);
  });
  const waiting = [{ slug: "approved", channel: "facebook", status: "waiting-for-facebook-preview" }];
  assert.deepEqual(await syndicate([approvedPost], true, now), waiting);
  preview = "/logo.jpg";
  assert.deepEqual(await syndicate([approvedPost], true, now), waiting);
  assert.deepEqual(await syndicate([{ ...approvedPost, image: preview }], true, now), waiting);
  preview = "/images/another-game.jpg";
  assert.deepEqual(await syndicate([approvedPost], true, now), waiting);
  assert.equal(photoChecks, 0);
  preview = featuredPhoto;
  assert.deepEqual(await syndicate([approvedPost], true, now), waiting);
  imageStatus = 200;
  mime = "text/html";
  assert.deepEqual(await syndicate([approvedPost], true, now), waiting);
  assert.equal(photoChecks, 2);
  assert.equal(ledger.size, 0);
});

test("Instagram uses the article photo crop and waits if the deployed file is not a JPEG", async (t) => {
  const env = { ...redisEnv, ...metaEnv, NEWSROOM_PUBLISH_CHANNELS: "instagram" };
  const now = new Date("2026-11-19T15:00:00Z");
  const photo = "/images/qualifying-game-instagram.jpg";
  let mime = "text/html";
  let sentPhoto;
  const ledger = mockedProviders(t, env, (url, options) => {
    if (url.origin === site) {
      if (url.pathname === "/posts/approved") return livePost(featuredPhoto);
      assert.equal(url.pathname, photo);
      assert.equal(options.method, "HEAD");
      return new Response(null, { headers: { "content-type": mime } });
    }
    if (url.pathname.endsWith("/me")) return Response.json({ user_id: "1", username: "jamaicabasketball" });
    if (url.pathname.endsWith("/media")) {
      sentPhoto = JSON.parse(options.body).image_url;
      return Response.json({ id: "42" });
    }
    if (url.pathname.endsWith("/42")) return Response.json({ status_code: "FINISHED" });
    assert.ok(url.pathname.endsWith("/media_publish"));
    return Response.json({ id: "43" });
  });
  const post = { ...approvedPost, instagramImage: photo };
  assert.deepEqual(await syndicate([post], true, now), [
    { slug: "approved", channel: "instagram", status: "waiting-for-instagram-photo" },
  ]);
  assert.equal(ledger.size, 0);
  mime = "image/jpeg";
  assert.deepEqual(await syndicate([post], true, now), [
    { slug: "approved", channel: "instagram", status: "published" },
  ]);
  assert.equal(sentPhoto, site + photo);
});

test("GitHub ledger claims atomically and retains confirmed or uncertain publication state", async (t) => {
  const original = "a".repeat(40);
  const receipt = "b".repeat(40);
  const environment = {
    NEWSROOM_PUBLICATION_LEDGER: "github", NEWSROOM_LEDGER_TOKEN: "ledger-fixture",
    GITHUB_REPOSITORY: "example/newsroom", GITHUB_REF: "refs/heads/main",
    GITHUB_SHA: original, NEWSROOM_LEDGER_TREE: "c".repeat(40),
  };
  const refs = new Map();
  const commits = new Map([[original, { message: "Source commit" }]]);
  let allowReceipt = true;
  mockedProviders(t, environment, (url, options) => {
    assert.equal(url.hostname, "api.github.com");
    assert.equal(options.headers.Authorization, "Bearer ledger-fixture");
    const base = "/repos/example/newsroom/git/";
    assert(url.pathname.startsWith(base));
    const path = url.pathname.slice(base.length);
    if (path === "refs" && options.method === "POST") {
      const { ref, sha } = JSON.parse(options.body);
      assert.match(ref, /^refs\/newsroom\/publications\/[a-f0-9]{64}$/);
      assert.equal(sha, original);
      if (refs.has(ref)) return Response.json({}, { status: 422 });
      refs.set(ref, sha);
      return Response.json({}, { status: 201 });
    }
    if (path.startsWith("ref/") && options.method === "GET") {
      const ref = "refs/" + path.slice(4);
      return Response.json({ ref, object: { sha: refs.get(ref), type: "commit" } });
    }
    if (path === "commits" && options.method === "POST") {
      if (!allowReceipt) return Response.json({}, { status: 503 });
      const commit = JSON.parse(options.body);
      assert.deepEqual(commit.parents, [original]);
      assert.equal(commit.tree, environment.NEWSROOM_LEDGER_TREE);
      assert.match(commit.message, /^Jamaica Basketball publication receipt [a-f0-9]{64}\n\n2_30$/);
      commits.set(receipt, commit);
      return Response.json({ sha: receipt }, { status: 201 });
    }
    if (path.startsWith("commits/") && options.method === "GET") return Response.json(commits.get(path.slice(8)));
    assert.equal(options.method, "PATCH");
    assert.match(path, /^refs\/newsroom\/publications\//);
    assert.deepEqual(JSON.parse(options.body), { sha: receipt, force: false });
    refs.set(path, receipt);
    return Response.json({});
  });
  const first = publicationLedger("jb:syndication:facebook:2:approved");
  const second = publicationLedger("jb:syndication:facebook:2:approved");
  assert.deepEqual((await Promise.all([first.reserve(), second.reserve()])).sort(), ["needs-review", "reserved"]);
  await first.record("2_30");
  assert.equal(await second.reserve(), "already-published");
  const uncertain = publicationLedger("jb:syndication:facebook:2:another");
  assert.equal(await uncertain.reserve(), "reserved");
  allowReceipt = false;
  await assert.rejects(uncertain.record("2_31"), /receipt could not be created/);
  assert.equal(await uncertain.reserve(), "needs-review");
});

test("checks the signed raw webhook and ignores echoes and other accounts", () => {
  const payload = {
    object: "instagram", entry: [
      { id: "2", messaging: [{ sender: { id: "5" }, recipient: { id: "2" }, message: { mid: "other", text: "Hello" } }] },
      { id: "1", messaging: [
        { sender: { id: "5" }, recipient: { id: "1" }, timestamp: 10, message: { mid: "known", text: "Hello" } },
        { sender: { id: "5" }, recipient: { id: "1" }, message: { mid: "echo", is_echo: true } },
      ] },
    ],
  };
  const raw = Buffer.from(JSON.stringify(payload));
  const signature = `sha256=${createHmac("sha256", "fixture").update(raw).digest("hex")}`;
  assert(signatureMatches(raw, signature, "fixture"));
  assert(!signatureMatches(Buffer.concat([raw, Buffer.from(" ")]), signature, "fixture"));
  const events = instagramEvents(payload, "1");
  assert.equal(events.length, 1);
  assert.match(replyText(events[0]), /independent media outlet/);
  assert.equal(replyText({ type: "dm", text: "Hi, I want to report a safeguarding concern" }), null);
});

test("only approved DM text gets an automatic reply and private text stays out of alerts", async (t) => {
  let replies = 0;
  let alerts = 0;
  const privateText = "A private, nonstandard message";
  const ledger = mockedProviders(t, {
    ...redisEnv, ...metaEnv, IG_PUBLIC_COMMENT_REPLIES: "false",
    BREVO_API_KEY: "fixture", NEWSROOM_ALERT_FROM: "from@example.com", NEWSROOM_ALERT_TO: "to@example.com",
  }, (url, options) => {
    if (url.hostname === "graph.instagram.com") {
      assert.equal(url.pathname, "/v27.0/1/messages");
      replies++;
      return Response.json({ message_id: "confirmed" });
    }
    assert.equal(url.hostname, "api.brevo.com");
    assert(!options.body.includes(privateText));
    alerts++;
    return Response.json({ messageId: "alert-confirmed" });
  });
  const dm = { type: "dm", id: "greeting", sender: "9", timestamp: Date.now() - 1000, text: "Hi" };
  await handleInstagramEvent(dm, "1", "reply");
  await handleInstagramEvent(dm, "1", "reply");
  await handleInstagramEvent({ ...dm, id: "private", text: privateText }, "1", "reply");
  await handleInstagramEvent({ ...dm, id: "private", text: privateText }, "1", "reply");
  await handleInstagramEvent({ ...dm, type: "comment", text: "What's your website?" }, "1", "reply");
  await handleInstagramEvent({ ...dm, id: "observe" }, "1", "observe");
  assert.equal(replies, 1);
  assert.equal(alerts, 3);
  assert(!JSON.stringify([...ledger]).includes(privateText));
});

test("Telegram moderation is limited to the chosen group and ignores ordinary basketball chat", async (t) => {
  const deleted = [];
  const config = { id: "-100700", token: "123456:telegram_fixture_only_not_a_real_token" };
  t.mock.method(globalThis, "fetch", (url, options) => {
    assert.equal(new URL(url).hostname, "api.telegram.org");
    assert.ok(new URL(url).pathname.endsWith("/deleteMessage"));
    deleted.push(JSON.parse(options.body));
    return Response.json({ ok: true, result: true });
  });
  const entry = (text, id, chat = -100700) => ({
    message_id: id, text, chat: { id: chat, type: "supergroup" }, from: { id: 44 },
  });
  assert.ok(matchesTelegramSecret("fixture", "fixture"));
  assert.equal(matchesTelegramSecret("fixture", "wrong"), false);
  await moderateTelegramUpdate({ message: entry("Shut up, you idiot", 1, -100701) }, config);
  await moderateTelegramUpdate({ message: entry("Pass to the assistant captain", 2) }, config);
  await moderateTelegramUpdate({ message: entry("What a great shot https://www.fiba.basketball", 3) }, config);
  await moderateTelegramUpdate({ message: entry("Shut up, you idiot", 4) }, config);
  await moderateTelegramUpdate({ edited_message: { ...entry(undefined, 5), caption: "join our group t.me/+bad" } }, config);
  assert.deepEqual(deleted, [{ chat_id: "-100700", message_id: 4 }, { chat_id: "-100700", message_id: 5 }]);
});

test("Telegram verifies its destination, skips old stories, and records each sent update once", async (t) => {
  const env = {
    ...redisEnv, ...metaEnv, NEWSROOM_PUBLISH_CHANNELS: "telegram",
    TELEGRAM_BOT_TOKEN: "123456:telegram_fixture_only_not_a_real_token",
    TELEGRAM_GROUP_ID: "-100700", TELEGRAM_START_DATE: "2026-11-19",
  };
  const now = new Date("2026-11-19T15:00:00Z");
  let sent = 0;
  const posts = [
    { ...approvedPost, slug: "old", date: "2026-11-18" },
    { ...approvedPost, title: "Game recap", excerpt: "Jamaica won." },
  ];
  mockedProviders(t, env, (url, options) => {
    if (url.origin === site) return new Response(`<article data-newsroom-syndication="${url.pathname.split("/").at(-1)}">`);
    assert.equal(url.hostname, "api.telegram.org");
    const body = JSON.parse(options.body);
    const reply = result => Response.json({ ok: true, result });
    if (url.pathname.endsWith("/getMe")) return reply({ id: 88, username: "Jamaicabasketball_Bot", is_bot: true });
    assert.equal(body.chat_id, "-100700");
    if (url.pathname.endsWith("/getChat")) return reply({ id: -100700, type: "supergroup" });
    if (url.pathname.endsWith("/getChatMember")) return reply({ status: "administrator", can_delete_messages: true });
    assert.ok(url.pathname.endsWith("/sendMessage"));
    assert.equal(body.text, `Game recap\n\nJamaica won.\n\n${site}/posts/approved`);
    sent++;
    return reply({ message_id: 99 });
  });
  assert.deepEqual(await verifyTargets(), [{ channel: "telegram", id: "-100700" }]);
  assert.deepEqual(await syndicate(posts, true, now), [{ slug: "approved", channel: "telegram", status: "published" }]);
  assert.deepEqual(await syndicate(posts, true, now), [{ slug: "approved", channel: "telegram", status: "already-published" }]);
  assert.equal(sent, 1);
});

test("Telegram tips and same-group reports reach only the group owner", async (t) => {
  const config = { id: "-100700", token: "123456:telegram_fixture_only_not_a_real_token" };
  const outbound = [];
  let membership = "member";
  t.mock.method(globalThis, "fetch", async (request, options) => {
    const url = new URL(request);
    assert.equal(url.hostname, "api.telegram.org");
    const args = JSON.parse(options.body);
    switch (url.pathname.split("/").at(-1)) {
      case "getChatMember":
        assert.deepEqual(args, { chat_id: config.id, user_id: 41 });
        return Response.json({ ok: true, result: { status: membership } });
      case "getChatAdministrators":
        assert.equal(args.chat_id, config.id);
        return Response.json({ ok: true, result: [
          { status: "administrator", user: { id: 92 } },
          { status: "creator", user: { id: 94, is_bot: false } },
        ] });
      case "sendMessage":
        outbound.push(args);
        return Response.json({ ok: true, result: { message_id: 1 } });
      default:
        assert.fail("Unexpected Telegram method");
    }
  });
  const update = (text, type = "private") => ({ message: {
    message_id: 3, text, from: { id: 41 }, chat: { id: type === "private" ? 41 : -100700, type },
  } });
  await handleTelegramCommunityUpdate(update("/start report"), config);
  assert.match(outbound.at(-1).text, /copy the message link/i);
  await handleTelegramCommunityUpdate(update("/tip Friday fixture moved", "supergroup"), config);
  await handleTelegramCommunityUpdate(update("/report https://t.me/c/711/13 Wrong group"), config);
  assert.deepEqual(outbound.map((item) => item.chat_id), [41, 41]);

  membership = "left";
  await handleTelegramCommunityUpdate(update("/tip Friday fixture moved"), config);
  assert.match(outbound.at(-1).text, /join the Jamaica Basketball/i);
  assert.equal(outbound.length, 3);

  membership = "member";
  await handleTelegramCommunityUpdate(update("/report https://t.me/c/700/13?single Repeated ads"), config);
  await handleTelegramCommunityUpdate(update("/tip Friday fixture moved"), config);
  assert.deepEqual(outbound.slice(3).map((item) => item.chat_id), [94, 41, 94, 41]);
  assert.match(outbound[3].text, /Group message report.*Repeated ads/s);
  assert.match(outbound[5].text, /Newsroom tip.*Friday fixture moved/s);
  assert.match(outbound[6].text, /sent privately/);
});
