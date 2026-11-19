import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { graph, instagramHost, json, postJson, redis } from "./services.mjs";

const retention = 30 * 24 * 3600;
const replyWindow = 23 * 3600_000;
const website = "https://jamaicabasketball.online";
const inbox = "https://business.facebook.com/latest/inbox";
const numericId = /^\d+$/;
const eventId = /^[A-Za-z0-9_=:+./-]{1,512}$/;

export function signatureMatches(raw, signature, secret) {
  if (!secret || !/^sha256=[a-f0-9]{64}$/.test(signature || "")) return false;
  const actual = Buffer.from(signature.slice(7), "hex");
  const expected = createHmac("sha256", secret).update(raw).digest();
  return timingSafeEqual(actual, expected);
}

export function replyText(event) {
  if (typeof event.text !== "string" || event.text.length > 100) return null;
  const text = event.text.trim().toLowerCase().replace(/[.!?]+$/, "").replace(/\s+/g, " ");
  if (/^(where can i read (the |your )?(news|articles)|what is your website|what's your website|website link)$/.test(text)) {
    return `Find the latest coverage from Jamaica Basketball at ${website}/news.`;
  }
  if (event.type === "comment") return null;
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)$/.test(text)) {
    return "Thanks for contacting Jamaica Basketball. We cover the sport as an independent media outlet. How can we help?";
  }
  if (/^(how (can|do) i (send|submit) (you )?(a )?(story )?tip|where can i send a tip)$/.test(text)) {
    return `Thanks for thinking of Jamaica Basketball. You can send a story tip through ${website}/contact.`;
  }
  return null;
}

export function instagramEvents(payload, account) {
  if (payload?.object !== "instagram" || !Array.isArray(payload.entry)) return [];
  const events = [];
  for (const entry of payload.entry) {
    if (entry?.id !== account) continue;
    for (const event of Array.isArray(entry.messaging) ? entry.messaging : []) {
      const message = event?.message;
      const sender = event?.sender?.id;
      if (!eventId.test(message?.mid || "") || !numericId.test(sender || "") || sender === account
        || event.recipient?.id !== account || message.is_echo || message.is_self || message.is_deleted) continue;
      events.push({
        type: "dm", id: message.mid, sender, timestamp: Number(event.timestamp),
        text: message.attachments?.length || message.reply_to || message.referral || message.is_unsupported ? null : message.text,
      });
    }
    for (const event of Array.isArray(entry.changes) ? entry.changes : []) {
      const value = event?.value;
      if (event?.field !== "comments" || !numericId.test(value?.id || "")
        || !numericId.test(value?.from?.id || "") || value.from.id === account
        || value.from.id === value.from.self_ig_scoped_id || value.from.username?.toLowerCase() === "jamaicabasketball") continue;
      events.push({
        type: "comment", id: value.id, sender: value.from.id, timestamp: Number(entry.time) * 1000,
        text: value.parent_id || value.media?.ad_id ? null : value.text,
      });
    }
  }
  return events;
}

async function alertEditor(key, event, reason) {
  const { BREVO_API_KEY: token, NEWSROOM_ALERT_FROM: from, NEWSROOM_ALERT_TO: to } = process.env;
  if (!token || !from || !to) throw new Error("Newsroom alerts are not configured");
  const lock = `${key}:alert-lock`;
  const sent = `${key}:alert-sent`;
  if (await redis("GET", sent)) return;
  if (await redis("SET", lock, "locked", "NX", "EX", "120") !== "OK") {
    throw new Error("Instagram alert is already processing");
  }
  if (await redis("GET", sent)) return;
  const body = {
    sender: { email: from },
    to: [{ email: to }],
    subject: `Jamaica Basketball Instagram ${event.type === "dm" ? "DM" : "comment"} needs review`,
    textContent: [
      `Status: ${reason}`,
      `Received: ${new Date().toISOString()}`,
      `Open the Instagram tab in Meta Business Suite Inbox: ${inbox}`,
      `Reference: ${key.slice(-12)}`,
    ].join("\n"),
    headers: { IdempotencyKey: key.slice(-64) },
  };
  await json("https://api.brevo.com/v3/smtp/email", postJson(body, { "api-key": token }));
  await redis("SET", sent, new Date().toISOString(), "EX", String(retention));
}

export async function handleInstagramEvent(event, account, mode) {
  const hash = createHash("sha256").update(`${account}:${event.type}:${event.id}`).digest("hex");
  const key = `jb:inbox:${hash}`;
  const timestamp = Date.now() - event.timestamp;
  const canReply = mode === "reply" && timestamp >= 0 && timestamp < replyWindow
    && (event.type === "dm" || process.env.IG_PUBLIC_COMMENT_REPLIES === "true");
  const reply = canReply ? replyText(event) : null;
  let status = reply ? "reply-started" : "needs-review";
  const claimed = await redis("SET", key, status, "NX", "EX", String(retention)) === "OK";
  if (claimed && reply) {
    try {
      const token = process.env.IG_ACCESS_TOKEN;
      if (event.type === "dm") {
        const sender = createHash("sha256").update(`${account}:${event.sender}`).digest("hex");
        if (await redis("SET", `jb:inbox:sender:${sender}`, "replied", "NX", "EX", "900") !== "OK") {
          await redis("SET", key, "rate-limited", "EX", String(retention));
          return;
        }
        const result = await graph(`${account}/messages`, token, {
          recipient: { id: event.sender }, message: { text: reply },
        }, "POST", instagramHost());
        if (!result.message_id) throw new Error("Instagram did not confirm the DM");
      } else {
        const result = await graph(`${event.id}/replies`, token, { message: reply }, "POST", instagramHost());
        if (!result.id) throw new Error("Instagram did not confirm the comment reply");
      }
      status = "replied";
    } catch {
      status = "reply-unconfirmed";
    }
    await redis("SET", key, status, "EX", String(retention));
  } else if (!claimed) {
    status = await redis("GET", key);
  }
  if (["needs-review", "reply-unconfirmed", "reply-started"].includes(status)) await alertEditor(key, event, status);
}
