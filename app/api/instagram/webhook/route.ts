import { timingSafeEqual } from "node:crypto";
import { handleInstagramEvent, instagramEvents, signatureMatches } from "@/newsroom/inbox.mjs";

export const runtime = "nodejs";
export const maxDuration = 60;

export function GET(request: Request) {
    const params = new URL(request.url).searchParams;
    const expected = Buffer.from(process.env.META_WEBHOOK_VERIFY_TOKEN || "");
    const token = Buffer.from(params.get("hub.verify_token") || "");
    const challenge = params.get("hub.challenge");
    if (params.get("hub.mode") !== "subscribe" || !challenge || !expected.length
        || expected.length !== token.length || !timingSafeEqual(expected, token)) {
        return new Response("Forbidden", { status: 403 });
    }
    return new Response(challenge);
}

export async function POST(request: Request) {
    const { META_APP_SECRET: secret, IG_ACCOUNT_ID: account, IG_INBOX_MODE: mode } = process.env;
    if (!secret || !account || (mode !== "observe" && mode !== "reply")) {
        return new Response("Unavailable", { status: 503 });
    }
    const raw = Buffer.from(await request.arrayBuffer());
    if (raw.length > 512 * 1024) return new Response("Payload too large", { status: 413 });
    if (!signatureMatches(raw, request.headers.get("x-hub-signature-256"), secret)) {
        return new Response("Unauthorized", { status: 401 });
    }

    let payload: unknown;
    try {
        payload = JSON.parse(raw.toString("utf8"));
    } catch {
        return new Response("Invalid JSON", { status: 400 });
    }
    const events = instagramEvents(payload, account);
    const results = await Promise.allSettled(events.map((event) => handleInstagramEvent(event, account, mode)));
    if (results.some((result) => result.status === "rejected")) {
        console.error("Instagram webhook has incomplete event processing");
        return new Response("Retry", { status: 503 });
    }
    return new Response("OK");
}
