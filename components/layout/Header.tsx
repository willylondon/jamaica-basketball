"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/content";

const NAV_LINKS = [
    { href: "/news", label: "News" },
    { href: "/leagues", label: "Leagues" },
    { href: "/category/national-team", label: "National Team" },
    { href: "/category/high-school", label: "High School" },
    { href: "/opinion", label: "Opinion" },
    { href: "/features", label: "Features" },
];

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
    }

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex flex-shrink-0 items-center gap-2 group">
                    <Image
                        src="/logo.jpg"
                        alt="Jamaica Basketball"
                        width={40}
                        height={40}
                        className="rounded-lg transition-transform group-hover:scale-105"
                        priority
                    />
                    <span className="hidden font-display text-base font-bold tracking-tight text-text sm:inline">
                        Jamaica Basketball
                    </span>
                    <span className="font-display text-base font-bold tracking-tight text-text sm:hidden">
                        JB
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-0.5 lg:flex">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-md px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface hover:text-text"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop search */}
                <div className="hidden lg:flex items-center">
                    {searchOpen ? (
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <input
                                autoFocus
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search stories…"
                                className="w-52 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => { setSearchOpen(false); setQuery(""); }}
                                className="rounded-md p-1.5 text-text-dim hover:text-text transition-colors"
                                aria-label="Close search"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-dim transition-colors hover:border-accent/30 hover:text-text"
                            aria-label="Search"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <span className="text-xs">Search</span>
                        </button>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface lg:hidden"
                    aria-label="Toggle menu"
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <nav className="border-t border-border bg-bg px-4 pb-4 lg:hidden">
                    {/* Mobile search */}
                    <form onSubmit={handleSearch} className="mt-3 flex items-center gap-2">
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search stories…"
                            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/50 focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-accent px-3 py-2 text-xs font-bold text-black"
                        >
                            Go
                        </button>
                    </form>
                    <div className="mt-3">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="block rounded-md px-3 py-3 text-sm font-medium text-text-muted transition-colors hover:bg-surface hover:text-text"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="border-t border-border pt-2 mt-2">
                        {CATEGORIES.filter(
                            (c) => !NAV_LINKS.some((l) => l.href.includes(c.slug))
                        ).map((c) => (
                            <Link
                                key={c.slug}
                                href={`/category/${c.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className="block rounded-md px-3 py-3 text-sm font-medium text-text-muted transition-colors hover:bg-surface hover:text-text"
                            >
                                {c.label}
                            </Link>
                        ))}
                    </div>
                </nav>
            )}
        </header>
    );
}
