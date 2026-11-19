import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { handleInstagramEvent, instagramEvents, replyText, signatureMatches } from "./inbox.mjs";
import { approvedPosts, syndicate, verifyTargets } from "./publish.mjs";
import { publicationLedger } from "./publication-ledger.mjs";

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

test("only explicit approvals enter the queue and dry-run sends no requests", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "jb-newsroom-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  t.mock.method(globalThis, "fetch", () => assert.fail("Dry-run attempted a provider request"));
  const frontmatter = (slug, draft) => [
    "---", `slug: "${slug}"`, 'date: "2026-11-19"', `draft: ${draft}`,
    "syndicate: true", 'instagramCaption: "Instagram caption"', 'facebookCaption: "Facebook caption"', "---",
  ].join("\n");
  await writeFile(join(directory, "approved.mdx"), frontmatter("approved", false));
  await writeFile(join(directory, "draft.mdx"), frontmatter("draft", true));
  const posts = await approvedPosts(directory);
  assert.equal(posts.length, 1);
  assert.deepEqual(await syndicate(posts, false, new Date("2026-11-20T02:00:00Z")), [
    { slug: "approved", status: "dry-run" },
  ]);
  await writeFile(join(directory, "duplicate.mdx"), frontmatter("approved", false));
  await assert.rejects(approvedPosts(directory), /duplicate syndication/);
});

test("site verification gates publication and an uncertain send stays claimed", async (t) => {
  const posts = [{ slug: "approved", date: "2026-11-19", captions: { instagram: "IG", facebook: "FB" } }];
  const now = new Date("2026-11-19T15:00:00Z");
  let deployed = false;
  let instagramSends = 0;
  let facebookSends = 0;
  const ledger = mockedProviders(t, { ...redisEnv, ...metaEnv, FB_PAGE_ID: "2", FB_PAGE_ACCESS_TOKEN: "fixture" }, (url) => {
    if (url.hostname === "jamaicabasketball.online") {
      return new Response(deployed ? '<article data-newsroom-syndication="approved">' : "Not found", { status: deployed ? 200 : 404 });
    }
    if (url.href.includes("graph.instagram.com")) {
      if (url.pathname.endsWith("/me")) return Response.json({ user_id: "1", username: "jamaicabasketball" });
      if (url.pathname.endsWith("/media")) return Response.json({ id: "42" });
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
      return new Response('<article data-newsroom-syndication="approved">');
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
  const posts = [{ slug: "approved", date: "2026-11-19", captions: { instagram: "IG", facebook: "FB" } }];
  assert.deepEqual(await syndicate(posts, true, new Date("2026-11-19T15:00:00Z")), [
    { slug: "approved", channel: "facebook", status: "published" },
  ]);
  assert.equal(sends, 1);
  canPost = false;
  await assert.rejects(verifyTargets(), /posting permission could not be verified/);
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
