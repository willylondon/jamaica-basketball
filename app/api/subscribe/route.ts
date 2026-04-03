import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const listId = Number(process.env.BREVO_LIST_ID);

    if (!apiKey || !listId) {
        console.error("Missing BREVO_API_KEY or BREVO_LIST_ID env vars");
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            listIds: [listId],
            updateEnabled: true,
        }),
    });

    // 201 = created, 204 = already exists (updated) — both are success
    if (res.ok || res.status === 204) {
        return NextResponse.json({ success: true });
    }

    const data = await res.json().catch(() => ({}));
    console.error("Brevo error:", data);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
}
