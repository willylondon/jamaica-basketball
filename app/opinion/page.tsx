import type { Metadata } from "next";
import { getPostsByCategory } from "@/lib/content";
import { SITE } from "@/lib/utils";
import PostCard from "@/components/ui/PostCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
    title: "Opinion",
    description: "Analysis and commentary on Jamaican basketball",
    alternates: { canonical: `${SITE.url}/opinion` },
};

export default function OpinionPage() {
    const posts = getPostsByCategory("opinion");

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <Breadcrumbs items={[{ label: "Opinion" }]} />
            <header className="mb-8">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-text">
                    Opinion
                </h1>
                <p className="mt-2 text-text-muted">
                    Analysis and commentary on Jamaican basketball
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
                    <p className="text-text-muted">No opinion pieces yet. Check back soon!</p>
                </div>
            )}
        </div>
    );
}
