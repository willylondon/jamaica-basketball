import { createHash, timingSafeEqual } from "node:crypto";
import { redis } from "./services.mjs";
import { telegram } from "./telegram.mjs";

const profanity = /\b(?:fuck(?:s|ed|er|ing|ers)?|shit(?:s|ty|ting)?|bullshit|bitch(?:es|ing)?|asshole(?:s)?|motherfuck(?:er|ers|ing)|bastard(?:s)?|damn(?:ed|it)?|bloodclaa?t|b[ou]mboclaa?t|rassclaa?t)\b/u;
const personalAttack = /\b(?:you(?: are|'re|re| is)? (?:an? )?(?:stupid|idiot|moron|dumbass|worthless|pathetic|loser)|shut (?:the hell )?up|go (?:kill|hang) yourself)\b/u;
const invitation = /(?:t\.me\/(?:\+|joinchat\/)|chat\.whatsapp\.com\/|discord\.gg\/)/iu;
const solicitation = /\b(?:guaranteed (?:profits?|returns?)|double your (?:money|crypto)|(?:send|share) (?:me |us )?your (?:password|one.time code|seed phrase)|claim your (?:free )?(?:crypto|airdrop))\b/u;
const hash = value => createHash("sha256").update(value).digest("hex");

const spamWindow = `
local previous = redis.call('GET', KEYS[3])
if previous then return tonumber(previous) end
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[2] - 20)
redis.call('ZREMRANGEBYSCORE', KEYS[2], '-inf', ARGV[2] - 60)
redis.call('ZADD', KEYS[1], 'NX', ARGV[2], ARGV[1])
redis.call('ZADD', KEYS[2], 'NX', ARGV[2], ARGV[1])
redis.call('EXPIRE', KEYS[1], 60)
redis.call('EXPIRE', KEYS[2], 90)
local remove = 0
if redis.call('ZCARD', KEYS[1]) >= 8 or redis.call('ZCARD', KEYS[2]) >= 3 then remove = 1 end
redis.call('SET', KEYS[3], tostring(remove), 'EX', 600)
return remove
`;

function normalize(text) {
  return text.normalize("NFKC").replace(/[\u200B-\u200F\u2060\uFEFF]/gu, "").toLowerCase()
    .replace(/[’‘]/gu, "'").replace(/\s+/gu, " ").trim();
}

export function matchesTelegramSecret(expected, actual) {
  if (!expected || !actual) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function moderateTelegramUpdate(update, { id, token }) {
  const message = update?.message ?? update?.edited_message;
  if (!message || String(message.chat?.id) !== id ||
      !["group", "supergroup"].includes(message.chat?.type) ||
      !Number.isSafeInteger(message.message_id) || message.message_id <= 0 || (message.from?.is_bot && !message.sender_chat)) return;

  const text = normalize(message.text ?? message.caption ?? "");
  const links = (message.entities ?? message.caption_entities ?? [])
    .filter(entity => entity.type === "text_link").map(entity => entity.url).join(" ");
  let remove = profanity.test(text) || personalAttack.test(text) || solicitation.test(text) ||
    invitation.test(text + " " + links);

  const sender = message.sender_chat?.id ?? message.from?.id;
  if (!remove && !update.edited_message && (text || message.photo || message.video || message.sticker || message.document) &&
      Number.isSafeInteger(sender) && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const scope = `jb:tg:spam:${hash(`${id}:${sender}`)}`;
    const fingerprint = hash(text || String(message.photo?.at(-1)?.file_unique_id ?? message.video?.file_unique_id ??
      message.sticker?.file_unique_id ?? message.document?.file_unique_id ?? message.message_id));
    const time = Math.floor(Date.now() / 1000);
    try {
      remove = Number(await redis("EVAL", spamWindow, "3", `${scope}:recent`, `${scope}:${fingerprint}`, `${scope}:decision:${message.message_id}`,
        String(message.message_id), String(time))) === 1;
    } catch {
      console.error("Telegram spam counter unavailable");
    }
  }

  if (remove) await telegram("deleteMessage", token, { chat_id: id, message_id: message.message_id });
}
