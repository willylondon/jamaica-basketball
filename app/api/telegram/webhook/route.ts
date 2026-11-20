import { matchesTelegramSecret, moderateTelegramUpdate } from "@/newsroom/telegram-moderation.mjs";
import { telegramConfigured, telegramGroupId } from "@/newsroom/telegram.mjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
    const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_GROUP_ID: group, TELEGRAM_WEBHOOK_SECRET: secret } = process.env;
    const id = telegramGroupId(group);
    if (!id || !telegramConfigured(token) || !secret) return new Response("Unavailable", { status: 503 });
    if (!matchesTelegramSecret(secret, request.headers.get("x-telegram-bot-api-secret-token"))) {
        return new Response("Unauthorized", { status: 401 });
    }

    let update: unknown;
    try {
        const body = await request.text();
        if (Buffer.byteLength(body, "utf8") > 256 * 1024) return new Response("Payload too large", { status: 413 });
        update = JSON.parse(body);
    } catch {
        return new Response("Invalid JSON", { status: 400 });
    }

    try {
        await moderateTelegramUpdate(update, { id, token });
        return new Response("OK");
    } catch {
        console.error("Telegram moderation action needs retry");
        return new Response("Retry", { status: 503 });
    }
}
