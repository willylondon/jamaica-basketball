import { mkdir, writeFile } from "node:fs/promises";
import { discover } from "./discover.mjs";
import { approvedPosts, syndicate, verifyTargets } from "./publish.mjs";
import { redis } from "./services.mjs";

const live = process.argv.includes("--live") && process.env.NEWSROOM_PUBLISH_LIVE === "true";
if (process.argv.includes("--check-targets")) {
  for (const { channel, id } of await verifyTargets()) console.log(`${channel}: verified target ${id}`);
  process.exit(0);
}
const discovery = process.argv.includes("--syndicate-only") ? {} : await discover();
let publication = [];
if (!process.argv.includes("--discovery-only")) {
  let posts = await approvedPosts();
  const replay = process.env.BLOTATO_REPLAY_SLUGS?.trim();
  if (replay && live) {
    const slugs = new Set(replay.split(",").map((slug) => slug.trim()));
    posts = posts.filter((post) => slugs.has(post.slug));
    if (posts.length !== slugs.size) throw new Error("Replay includes an unknown or unapproved article");
    process.env.NEWSROOM_PUBLISH_CHANNELS = "tiktok,twitter";
    process.env.BLOTATO_START_DATE = posts.map((post) => post.date).sort()[0];
  }
  publication = await syndicate(posts, live);
}
const report = { generatedAt: new Date().toISOString(), mode: live ? "live" : "dry-run", discovery, publication };
await mkdir(".newsroom", { recursive: true });
await writeFile(".newsroom/daily.json", JSON.stringify(report, null, 2) + "\n", { mode: 0o600 });
if (process.env.GITHUB_ACTIONS === "true" && process.env.UPSTASH_REDIS_REST_URL && Object.keys(discovery).length) {
  const key = `jb:reports:${process.env.GITHUB_RUN_ID}:${process.env.GITHUB_RUN_ATTEMPT}`;
  await redis("SET", key, JSON.stringify(report), "EX", "604800");
  console.log(`Private report stored at ${key}`);
}
for (const [name, { status, leads }] of Object.entries(discovery)) console.log(`${name}: ${status} (${leads.length} leads)`);
for (const result of publication) console.log(result.slug, result.channel || "", result.status, result.publicUrl || result.submissionId || "");
if (publication.length === 0 && !process.argv.includes("--discovery-only")) console.log("No recent approved stories are queued for syndication.");
if (Object.values(discovery).some(({ status }) => ["failed", "partial"].includes(status)) ||
  publication.some(({ status }) => ["needs-review", "configuration-or-service-error", "site-check-error"].includes(status))) {
  process.exitCode = 1;
}
