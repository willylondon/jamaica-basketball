import { posts } from "@/.velite";
import type { Post } from "@/.velite";

export type { Post };

export const CATEGORIES = [
    { slug: "news", label: "News", description: "Latest basketball news from across Jamaica" },
    { slug: "opinion", label: "Opinion", description: "Analysis and commentary on Jamaican basketball" },
    { slug: "features", label: "Features", description: "In-depth features on Jamaican basketball" },
    { slug: "national-team", label: "National Team", description: "Jamaica national basketball team coverage" },
    { slug: "high-school", label: "High School", description: "Schoolboy and schoolgirl basketball coverage in Jamaica" },
    { slug: "club-basketball", label: "Club Basketball", description: "Club basketball and JABA league coverage" },
    { slug: "3x3", label: "3x3", description: "Jamaica 3x3 basketball news and coverage" },
    { slug: "player-spotlight", label: "Player Spotlight", description: "Profiles of Jamaican basketball players" },
    { slug: "coach-spotlight", label: "Coach Spotlight", description: "Profiles of Jamaican basketball coaches" },
    { slug: "events", label: "Events", description: "Basketball events and tournaments in Jamaica" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function getCategoryBySlug(slug: string) {
    return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryLabel(slug: string): string {
    return getCategoryBySlug(slug)?.label ?? slug;
}

/** Return all published posts sorted newest first */
export function getPublishedPosts(): Post[] {
    return posts
        .filter((p) => !p.draft)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Return published posts filtered by category */
export function getPostsByCategory(category: string): Post[] {
    return getPublishedPosts().filter((p) => p.category === category);
}

/** Return published posts filtered by tag */
export function getPostsByTag(tag: string): Post[] {
    return getPublishedPosts().filter((p) => p.tags.includes(tag));
}

/** Return a single post by slug */
export function getPostBySlug(slug: string): Post | undefined {
    return posts.find((p) => p.slug === slug && !p.draft);
}

/** Return featured posts */
export function getFeaturedPosts(): Post[] {
    return getPublishedPosts().filter((p) => p.featured);
}

/** Return related posts (same category, excluding current) */
export function getRelatedPosts(post: Post, limit = 3): Post[] {
    return getPublishedPosts()
        .filter((p) => p.category === post.category && p.slug !== post.slug)
        .slice(0, limit);
}

/** Return breaking posts */
export function getBreakingPosts(): Post[] {
    return getPublishedPosts().filter((p) => p.breaking);
}

/** Return trending posts (recent, non-featured, for recommendations) */
export function getTrendingPosts(limit = 4): Post[] {
    return getPublishedPosts()
        .filter((p) => !p.featured)
        .slice(0, limit);
}

/** Return all unique tags across published posts */
export function getAllTags(): string[] {
    const tags = new Set<string>();
    getPublishedPosts().forEach((p) => p.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
}
