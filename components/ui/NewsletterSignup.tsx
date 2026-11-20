"use client";
import { useId, useState } from "react";

interface NewsletterSignupProps {
    /** "band": the large homepage briefing band. "compact": footer column. */
    variant?: "band" | "compact";
}

/** Email signup posting to /api/subscribe (Brevo). Always rendered on an ink background. */
export default function NewsletterSignup({ variant = "compact" }: NewsletterSignupProps) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const inputId = useId();

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
        }
    }

    const band = variant === "band";

    if (status === "success") {
        return (
            <p role="status" className="flex items-center gap-2 rounded-full bg-ink-raised px-5 py-3 text-sm font-semibold text-gold">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                You&apos;re in. Check your inbox to confirm.
            </p>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={band ? "flex flex-wrap items-end gap-2.5" : "flex flex-col gap-2"}>
            <div className={band ? "flex min-w-[220px] flex-1 flex-col gap-1.5" : "flex flex-col gap-1.5"}>
                <label htmlFor={inputId} className="text-[0.8125rem] font-semibold text-ink-muted">
                    Email address
                </label>
                <input
                    id={inputId}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="h-12 w-full rounded-full border border-[#4A4F4B] bg-ink-raised px-4 text-base text-white placeholder:text-ink-muted focus:border-gold focus:outline-none"
                />
            </div>
            <button
                type="submit"
                disabled={status === "loading"}
                className="h-12 rounded-full bg-gold px-6 text-[0.9375rem] font-bold text-ink transition-colors hover:bg-gold-hover disabled:opacity-60"
            >
                {status === "loading" ? "Subscribing…" : status === "error" ? "Try again" : "Subscribe"}
            </button>
            {status === "error" && (
                <p role="alert" className="w-full text-sm text-[#FFB4A8]">Something went wrong. Please try again.</p>
            )}
        </form>
    );
}
