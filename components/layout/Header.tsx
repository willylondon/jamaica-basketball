"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/content";

const NAV_LINKS = [
    { href: "/news", label: "News" },
    { href: "/leagues", label: "Leagues & Programs" },
    { href: "/opinion", label: "Opinion" },
    { href: "/features", label: "Features" },
    { href: "/category/national-team", label: "National Team" },
    { href: "/category/high-school", label: "High School" },
    { href: "/category/3x3", label: "3x3" },
];

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <Image
                        src="/logo.jpg"
                        alt="Jamaica Basketball"
                        width={44}
                        height={44}
                        className="rounded-lg transition-transform group-hover:scale-105"
                        priority
                    />
                    <span className="hidden font-display text-lg font-bold tracking-tight text-text sm:inline">
                        Jamaica Basketball
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-1 lg:flex">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-md px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface hover:text-text"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href="/search"
                        className="ml-2 rounded-md px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface hover:text-text"
                        aria-label="Search"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </Link>
                </nav>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface lg:hidden"
                    aria-label="Toggle menu"
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
                    <div className="mt-2 border-t border-border pt-2">
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
                    <Link
                        href="/search"
                        onClick={() => setMobileOpen(false)}
                        className="mt-2 flex items-center gap-2 rounded-md border border-border px-3 py-3 text-sm font-medium text-text-muted transition-colors hover:bg-surface hover:text-text"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        Search
                    </Link>
                </nav>
            )}
        </header>
    );
}
