import { createHash } from "node:crypto";
import { bearer, postJson, redis } from "./services.mjs";

const namespace = "newsroom/publications";
const receiptPrefix = "Jamaica Basketball publication receipt ";
const digestFormat = /^[0-9a-f]{40}$/;
const publicationIdFormat = /^\d+(?:_\d+)?$/;

async function github(path, { method = "GET", body } = {}) {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.NEWSROOM_LEDGER_TOKEN;
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo || "") || !token || process.env.GITHUB_REF !== "refs/heads/main") {
    throw new Error("The GitHub publication ledger is not configured for main");
  }
  const headers = {
    ...bearer(token),
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  return fetch(`https://api.github.com/repos/${repo}/git/${path}`, {
    ...(body ? postJson(body, headers) : { headers }),
    method,
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
}

function githubLedger(key) {
  const hash = createHash("sha256").update(key).digest("hex");
  const ref = `${namespace}/${hash}`;
  const sha = process.env.GITHUB_SHA;
  const tree = process.env.NEWSROOM_LEDGER_TREE;
  if (!digestFormat.test(sha || "") || !digestFormat.test(tree || "")) {
    throw new Error("The GitHub publication ledger needs the checked-out commit and tree");
  }

  async function existingReceipt() {
    const reference = await github(`ref/${ref}`);
    if (!reference.ok) throw new Error("Existing publication reservation could not be verified");
    const node = await reference.json();
    if (node.ref !== `refs/${ref}` || node.object?.type !== "commit" || !digestFormat.test(node.object.sha)) {
      throw new Error("Unexpected publication reservation");
    }
    const commit = await github(`commits/${node.object.sha}`);
    if (!commit.ok) throw new Error("Publication reservation status could not be loaded");
    const { message } = await commit.json();
    const prefix = `${receiptPrefix}${hash}\n\n`;
    const id = typeof message === "string" && message.startsWith(prefix)
      ? message.slice(prefix.length).trim() : "";
    return publicationIdFormat.test(id) ? "already-published" : "needs-review";
  }

  return {
    async reserve() {
      const response = await github("refs", { method: "POST", body: { ref: `refs/${ref}`, sha } });
      if (response.status === 201) return "reserved";
      if (response.status === 409 || response.status === 422) return existingReceipt();
      throw new Error(`GitHub publication reservation returned HTTP ${response.status}`);
    },

    async record(publicationId) {
      if (!publicationIdFormat.test(publicationId)) throw new Error("Unexpected Meta publication ID");
      const created = await github("commits", {
        method: "POST",
        body: {
          message: `${receiptPrefix}${hash}\n\n${publicationId}`,
          tree,
          parents: [sha],
          author: { name: "github-actions[bot]", email: "41898282+github-actions[bot]@users.noreply.github.com" },
        },
      });
      if (created.status !== 201) throw new Error("The publication receipt could not be created");
      const receipt = await created.json();
      if (!digestFormat.test(receipt.sha || "")) throw new Error("Invalid publication receipt");

      const updated = await github(`refs/${ref}`, { method: "PATCH", body: { sha: receipt.sha, force: false } });
      if (!updated.ok) throw new Error("The publication receipt could not be attached");
    },
  };
}

export function publicationLedger(key) {
  if (process.env.NEWSROOM_PUBLICATION_LEDGER === "github") return githubLedger(key);
  return {
    async reserve() {
      if (await redis("SET", key, "sending", "NX") === "OK") return "reserved";
      const saved = await redis("GET", key);
      const previous = saved && saved !== "sending" ? JSON.parse(saved) : null;
      return previous?.publicationId ? "already-published" : "needs-review";
    },
    async record(publicationId) {
      await redis("SET", key, JSON.stringify({ publicationId, at: new Date().toISOString() }));
    },
  };
}
