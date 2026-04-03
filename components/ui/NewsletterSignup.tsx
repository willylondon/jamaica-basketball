"use client";
import { useState } from "react";

export default function NewsletterSignup() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setStatus("loading");
        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error("Failed");
            setStatus("success");
        } catch {
            setStatus("error");
            setErrorMsg("Something went wrong. Please try again.");
        }
    }

    return (
        <div>
            <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-accent">
                Newsletter
            </h4>
            <p className="mb-3 text-sm text-text-muted leading-relaxed">
                Jamaica Basketball stories, straight to your inbox.
            </p>
            {status === "success" ? (
                <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
                    <svg className="h-4 w-4 flex-shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-accent">You&apos;re in! Check your inbox.</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-black transition-all hover:bg-accent-hover disabled:opacity-60"
                    >
                        {status === "loading" ? "Subscribing…" : status === "error" ? "Retry" : "Subscribe"}
                    </button>
                    {status === "error" && (
                        <p className="text-xs text-red-400">{errorMsg}</p>
                    )}
                </form>
            )}
        </div>
    );
}
