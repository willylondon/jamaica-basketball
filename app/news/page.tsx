import type { Metadata } from "next";
import { getPostsByCategory, getPublishedPosts } from "@/lib/content";
import { SITE } from "@/lib/utils";
import PostCard from "@/components/ui/PostCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
    title: "News",
    description: "Latest basketball news from across Jamaica",
    alternates: { canonical: `${SITE.url}/news` },
};

export default function NewsPage() {
    const explicitNewsPosts = getPostsByCategory("news");
    const fallbackPosts = getPublishedPosts().slice(0, 9);
    const posts = explicitNewsPosts.length > 0 ? explicitNewsPosts : fallbackPosts;
    const isFallback = explicitNewsPosts.length === 0;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <Breadcrumbs items={[{ label: "News" }]} />
            <header className="mb-8">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-text">
                    News
                </h1>
                <p className="mt-2 text-text-muted">
                    Latest basketball news from across Jamaica
                </p>
            </header>
            {posts.length > 0 ? (
                <>
                    {isFallback && (
                        <div className="mb-6 rounded-xl border border-border bg-surface p-5">
                            <p className="text-sm text-text-muted">
                                No stories are filed under the dedicated <strong>News</strong> category yet, so this page is currently showing the latest published coverage across the site. New time-sensitive reports should use the <strong>News</strong> category plus a league tag like <strong>JABA</strong>, <strong>NBL</strong>, or <strong>Under-19</strong>.
                            </p>
                        </div>
                    )}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post, i) => (
                            <PostCard key={post.slug} post={post} priority={i < 3} />
                        ))}
                    </div>
                </>
            ) : (
                <div className="rounded-xl border border-border bg-surface p-10 text-center">
                    <p className="text-text-muted">No news articles yet. Check back soon!</p>
                </div>
            )}
        </div>
    );
}
