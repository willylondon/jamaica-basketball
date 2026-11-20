"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "@/lib/content";
import { SITE } from "@/lib/utils";

const NAV_LINKS = [
    { href: "/category/national-team", label: "National Team" },
    { href: "/category/high-school", label: "Schools" },
    { href: "/leagues", label: "Leagues" },
    { href: "/category/3x3", label: "3x3" },
    { href: "/news", label: "News" },
    { href: "/features", label: "Features" },
    { href: "/opinion", label: "Opinion" },
];

function SearchIcon() {
    return (
        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
        </svg>
    );
}

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const router = useRouter();

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        router.push(`/search?q=${encodeURIComponent(q)}`);
        setQuery("");
        setSearchOpen(false);
        setMobileOpen(false);
    }

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:py-3.5 lg:px-8">
                <Link
                    href="/"
                    className="flex min-w-0 shrink items-baseline gap-1.5 font-display text-[1.375rem] font-extrabold uppercase leading-none tracking-[0.03em] text-text hover:text-text sm:gap-2 sm:text-[1.875rem]"
                    aria-label="Jamaica Basketball home"
                >
                    <span>Jamaica</span>
                    <span className="text-accent">Basketball</span>
                </Link>

                <nav aria-label="Sections" className="hidden flex-1 items-center gap-1 xl:flex">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-md px-2.5 py-2 text-[0.9375rem] font-semibold text-text transition-colors hover:text-accent"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex shrink-0 items-center gap-2">
                    <div className="hidden xl:flex items-center">
                        {searchOpen ? (
                            <form onSubmit={handleSearch} role="search" className="flex items-center gap-2">
                                <label htmlFor="header-search" className="sr-only">Search stories</label>
                                <input
                                    id="header-search"
                                    autoFocus
                                    type="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search stories…"
                                    className="h-11 w-44 rounded-full border border-border-hover bg-bg px-4 text-sm text-text placeholder:text-text-dim focus:border-accent focus:outline-none 2xl:w-56"
                                />
                                <button
                                    type="button"
                                    onClick={() => { setSearchOpen(false); setQuery(""); }}
                                    className="flex h-11 w-11 items-center justify-center rounded-full text-text-dim transition-colors hover:text-text"
                                    aria-label="Close search"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </form>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setSearchOpen(true)}
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-border-hover text-text transition-colors hover:border-text"
                                aria-label="Search"
                            >
                                <SearchIcon />
                            </button>
                        )}
                    </div>

                    <a
                        href={SITE.socials.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-accent px-3 text-[0.9375rem] font-semibold text-on-accent transition-colors hover:bg-accent-hover hover:text-on-accent sm:px-5"
                    >
                        <svg className="h-[18px] w-[18px] sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 3 3 10.5l7 2.5m11-10-4 18-7-8m11-10L10 13" />
                        </svg>
                        <span className="sr-only sm:not-sr-only">Join Telegram</span>
                    </a>

                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-border-hover text-text transition-colors hover:border-text xl:hidden"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-menu"
                    >
                        {mobileOpen ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <nav id="mobile-menu" aria-label="Menu" className="border-t border-border bg-bg px-4 pb-5 xl:hidden">
                    <form onSubmit={handleSearch} role="search" className="mt-4 flex items-center gap-2">
                        <label htmlFor="mobile-search" className="sr-only">Search stories</label>
                        <input
                            id="mobile-search"
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search stories…"
                            className="h-11 flex-1 rounded-full border border-border-hover bg-bg px-4 text-base text-text placeholder:text-text-dim focus:border-accent focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="flex h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-ink-text"
                        >
                            Search
                        </button>
                    </form>
                    <div className="mt-3 grid grid-cols-2 gap-x-4">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="block border-b border-border py-3 font-display text-xl font-bold text-text"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                        {CATEGORIES.filter((c) => !NAV_LINKS.some((l) => l.href.endsWith(`/${c.slug}`)) && !["news", "opinion", "features"].includes(c.slug)).map((c) => (
                            <Link
                                key={c.slug}
                                href={`/category/${c.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className="py-1.5 text-sm font-medium text-text-muted hover:text-accent"
                            >
                                {c.label}
                            </Link>
                        ))}
                        <Link href="/archive" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-medium text-text-muted hover:text-accent">
                            Archive
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
}
