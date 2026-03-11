"use client";

import { useState, useMemo } from "react";
import type { Metadata } from "next";
import Fuse from "fuse.js";
import { getPublishedPosts } from "@/lib/content";
import PostCard from "@/components/ui/PostCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

// Build search index at module level (only runs once on client)
const allPosts = getPublishedPosts();

const fuse = new Fuse(allPosts, {
    keys: [
        { name: "title", weight: 0.4 },
        { name: "dek", weight: 0.2 },
        { name: "excerpt", weight: 0.2 },
        { name: "tags", weight: 0.1 },
        { name: "category", weight: 0.1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
});

export default function SearchPage() {
    const [query, setQuery] = useState("");

    const results = useMemo(() => {
        if (!query.trim()) return [];
        return fuse.search(query).map((r) => r.item);
    }, [query]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <Breadcrumbs items={[{ label: "Search" }]} />

            <header className="mb-8">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-text mb-4">
                    Search
                </h1>
                <div className="relative max-w-xl">
                    <svg
                        className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-dim"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Search articles..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface py-3.5 pl-12 pr-4 text-text placeholder:text-text-dim focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                        autoFocus
                    />
                </div>
            </header>

            {query.trim() && (
                <p className="mb-6 text-sm text-text-muted">
                    {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
                </p>
            )}

            {results.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {results.map((post) => (
                        <PostCard key={post.slug} post={post} />
                    ))}
                </div>
            ) : query.trim() ? (
                <div className="rounded-xl border border-border bg-surface p-10 text-center">
                    <p className="text-text-muted">
                        No results found. Try a different search term.
                    </p>
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-surface p-10 text-center">
                    <p className="text-text-muted">
                        Start typing to search across all articles.
                    </p>
                </div>
            )}
        </div>
    );
}
