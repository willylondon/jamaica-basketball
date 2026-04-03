import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/content";
import { SITE } from "@/lib/utils";
import NewsletterSignup from "@/components/ui/NewsletterSignup";

const socialLinks = [
    {
        href: SITE.socials.instagram,
        label: "Instagram",
        icon: (
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        ),
    },
    {
        href: SITE.socials.tiktok,
        label: "TikTok",
        icon: (
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13.2a8.16 8.16 0 005.58 2.19V12a4.85 4.85 0 01-3.77-1.54V6.69z" />
        ),
    },
    ...(SITE.socials.youtube
        ? [
              {
                  href: SITE.socials.youtube,
                  label: "YouTube",
                  icon: (
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  ),
              },
          ]
        : []),
    ...(SITE.socials.x
        ? [
              {
                  href: SITE.socials.x,
                  label: "X / Twitter",
                  icon: (
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  ),
              },
          ]
        : []),
].filter((s) => s.href);

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-border bg-surface/50">
            <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4 group">
                            <Image src="/logo.jpg" alt="Jamaica Basketball" width={44} height={44} className="rounded-lg" />
                            <span className="font-display text-lg font-bold tracking-tight text-text">Jamaica Basketball</span>
                        </Link>
                        <p className="text-sm text-text-muted leading-relaxed mb-5">
                            The definitive independent source for basketball news, features, and analysis in Jamaica.
                        </p>
                        {/* Socials */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-text-muted transition-colors hover:text-accent"
                                    aria-label={s.label}
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        {s.icon}
                                    </svg>
                                </a>
                            ))}
                            {/* RSS */}
                            <a
                                href="/feed.xml"
                                className="text-text-muted transition-colors hover:text-accent"
                                aria-label="RSS Feed"
                                title="RSS Feed"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6.18 15.64a2.18 2.18 0 010 4.36 2.18 2.18 0 010-4.36M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Coverage */}
                    <div>
                        <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-accent">Coverage</h4>
                        <ul className="space-y-2">
                            <li><Link href="/leagues" className="text-sm text-text-muted transition-colors hover:text-text">Leagues & Programs</Link></li>
                            {CATEGORIES.slice(0, 6).map((c) => (
                                <li key={c.slug}>
                                    <Link href={c.slug === "news" ? "/news" : `/category/${c.slug}`} className="text-sm text-text-muted transition-colors hover:text-text">
                                        {c.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* More */}
                    <div>
                        <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-accent">More</h4>
                        <ul className="space-y-2">
                            {CATEGORIES.slice(6).map((c) => (
                                <li key={c.slug}>
                                    <Link href={`/category/${c.slug}`} className="text-sm text-text-muted transition-colors hover:text-text">
                                        {c.label}
                                    </Link>
                                </li>
                            ))}
                            <li><Link href="/archive" className="text-sm text-text-muted transition-colors hover:text-text">Archive</Link></li>
                            <li><Link href="/about" className="text-sm text-text-muted transition-colors hover:text-text">About</Link></li>
                            <li><Link href="/contact" className="text-sm text-text-muted transition-colors hover:text-text">Contact</Link></li>
                            <li>
                                <a href="/feed.xml" className="text-sm text-text-muted transition-colors hover:text-text">
                                    RSS Feed
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <NewsletterSignup />
                    </div>
                </div>

                <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-dim">
                    <p>&copy; {new Date().getFullYear()} Jamaica Basketball. All rights reserved.</p>
                    <p>Independent basketball media from Jamaica 🏀</p>
                </div>
            </div>
        </footer>
    );
}
