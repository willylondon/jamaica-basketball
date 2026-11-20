import Link from "next/link";
import { CATEGORIES } from "@/lib/content";
import { SITE } from "@/lib/utils";
import NewsletterSignup from "@/components/ui/NewsletterSignup";

const followLinks = [
    { href: SITE.socials.telegram, label: "Telegram" },
    { href: SITE.socials.instagram, label: "Instagram" },
    { href: SITE.socials.tiktok, label: "TikTok" },
    { href: SITE.socials.youtube, label: "YouTube" },
    { href: SITE.socials.x, label: "X" },
].filter((s) => s.href);

const linkCls = "text-ink-text/85 transition-colors hover:text-gold";

export default function Footer() {
    const coverage = CATEGORIES.filter((c) => !["opinion", "features", "events", "coach-spotlight"].includes(c.slug));

    return (
        <footer className="mt-auto border-t border-ink-line bg-ink text-ink-text">
            <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.6fr]">
                    <div className="flex flex-col gap-3">
                        <Link href="/" className="font-display text-2xl font-extrabold uppercase tracking-[0.04em] text-white hover:text-white">
                            Jamaica <span className="text-gold">Basketball</span>
                        </Link>
                        <p className="text-sm leading-relaxed text-ink-muted">
                            Independent coverage of basketball in Jamaica, from the national team to the school leagues.
                        </p>
                    </div>

                    <nav aria-label="Coverage" className="flex flex-col gap-2.5 text-sm">
                        <h2 className="mb-1 font-body text-sm font-bold text-white">Coverage</h2>
                        {coverage.map((c) => (
                            <Link key={c.slug} href={c.slug === "news" ? "/news" : `/category/${c.slug}`} className={linkCls}>
                                {c.label}
                            </Link>
                        ))}
                        <Link href="/leagues" className={linkCls}>Leagues &amp; Programs</Link>
                    </nav>

                    <nav aria-label="About" className="flex flex-col gap-2.5 text-sm">
                        <h2 className="mb-1 font-body text-sm font-bold text-white">About</h2>
                        <Link href="/about" className={linkCls}>About us</Link>
                        <Link href="/features" className={linkCls}>Features</Link>
                        <Link href="/opinion" className={linkCls}>Opinion</Link>
                        <Link href="/archive" className={linkCls}>Archive</Link>
                        <Link href="/contact" className={linkCls}>Contact</Link>
                        <Link href="/privacy" className={linkCls}>Privacy</Link>
                    </nav>

                    <nav aria-label="Follow" className="flex flex-col gap-2.5 text-sm">
                        <h2 className="mb-1 font-body text-sm font-bold text-white">Follow</h2>
                        {followLinks.map((s) => (
                            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
                                {s.label}
                            </a>
                        ))}
                        <a href="/feed.xml" className={linkCls}>RSS feed</a>
                    </nav>

                    <div className="flex flex-col gap-3">
                        <h2 className="font-body text-sm font-bold text-white">The briefing</h2>
                        <p className="text-sm leading-relaxed text-ink-muted">Jamaica basketball stories, straight to your inbox.</p>
                        <NewsletterSignup />
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-2 border-t border-ink-line pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
                    <p>&copy; {new Date().getFullYear()} Jamaica Basketball. All rights reserved.</p>
                    <p>
                        Spot an error?{" "}
                        <a href={`mailto:${SITE.contactEmail}`} className="text-ink-text underline underline-offset-2 hover:text-gold">
                            Tell the editors
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
