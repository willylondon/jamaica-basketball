const groupId = /^-[1-9]\d{0,15}$/;
const tokenFormat = /^\d{6,16}:[\w-]{20,}$/;

export function telegramGroupId(value) {
  return typeof value === "string" && groupId.test(value) ? value : null;
}

export function telegramConfigured(token) {
  return typeof token === "string" && tokenFormat.test(token);
}

export async function telegram(method, token, body = {}) {
  if (!telegramConfigured(token)) throw new Error("Telegram bot token is not configured");
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
    });
    const result = await response.json();
    if (result.ok === true && response.ok) return result.result;
    if (method === "deleteMessage" && result.error_code === 400 && /message to delete not found/i.test(result.description)) return true;
  } catch {
    // A fetch error can include the bot credential in the request URL.
  }
  throw new Error(`Telegram ${method} failed`);
}

export async function verifyTelegramTarget() {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_GROUP_ID: id } = process.env;
  if (!telegramGroupId(id)) throw new Error("Telegram group is not configured");
  const bot = await telegram("getMe", token);
  if (!bot?.is_bot || bot.username?.toLowerCase() !== "jamaicabasketball_bot") {
    throw new Error("Telegram bot identity could not be verified");
  }
  const args = { chat_id: id };
  const [chat, member] = await Promise.all([
    telegram("getChat", token, args),
    telegram("getChatMember", token, { ...args, user_id: bot.id }),
  ]);
  if (String(chat?.id) !== id || !["group", "supergroup"].includes(chat?.type) ||
      member?.status !== "administrator" || (chat.type === "supergroup" && member.can_delete_messages !== true)) {
    throw new Error("Telegram group or moderation permission could not be verified");
  }
  return { id, token };
}
