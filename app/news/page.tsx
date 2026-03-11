import type { Metadata } from "next";
import { getPostsByCategory } from "@/lib/content";
import { SITE } from "@/lib/utils";
import PostCard from "@/components/ui/PostCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
    title: "News",
    description: "Latest basketball news from across Jamaica",
    alternates: { canonical: `${SITE.url}/news` },
};

export default function NewsPage() {
    const posts = getPostsByCategory("news");

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
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post, i) => (
                        <PostCard key={post.slug} post={post} priority={i < 3} />
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-surface p-10 text-center">
                    <p className="text-text-muted">No news articles yet. Check back soon!</p>
                </div>
            )}
        </div>
    );
}
