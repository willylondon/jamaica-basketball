import type { Metadata } from "next";
import { getPostsByCategory } from "@/lib/content";
import { SITE } from "@/lib/utils";
import PostCard from "@/components/ui/PostCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
    title: "Features",
    description: "In-depth features on Jamaican basketball",
    alternates: { canonical: `${SITE.url}/features` },
};

export default function FeaturesPage() {
    const posts = getPostsByCategory("features");

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <Breadcrumbs items={[{ label: "Features" }]} />
            <header className="mb-8">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-text">
                    Features
                </h1>
                <p className="mt-2 text-text-muted">
                    In-depth features on Jamaican basketball
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
                    <p className="text-text-muted">No feature articles yet. Check back soon!</p>
                </div>
            )}
        </div>
    );
}
