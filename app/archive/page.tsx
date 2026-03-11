import type { Metadata } from "next";
import { getPublishedPosts, getCategoryLabel } from "@/lib/content";
import { formatDate, SITE } from "@/lib/utils";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Link from "next/link";
import CategoryBadge from "@/components/ui/CategoryBadge";

export const metadata: Metadata = {
    title: "Archive",
    description: "Browse all Jamaica Basketball articles chronologically.",
    alternates: { canonical: `${SITE.url}/archive` },
};

export default function ArchivePage() {
    const posts = getPublishedPosts();

    // Group by year-month
    const grouped: Record<string, typeof posts> = {};
    posts.forEach((post) => {
        const d = new Date(post.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(post);
    });

    const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
            <Breadcrumbs items={[{ label: "Archive" }]} />

            <header className="mb-8">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-text">
                    Archive
                </h1>
                <p className="mt-2 text-text-muted">
                    All articles, sorted by date
                </p>
            </header>

            {sortedKeys.map((key) => {
                const [year, month] = key.split("-");
                const monthName = new Date(Number(year), Number(month) - 1).toLocaleString("en-US", { month: "long" });
                return (
                    <section key={key} className="mb-10">
                        <h2 className="mb-4 font-display text-lg font-bold text-accent">
                            {monthName} {year}
                        </h2>
                        <div className="space-y-3">
                            {grouped[key].map((post) => (
                                <article
                                    key={post.slug}
                                    className="flex items-start gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/30"
                                >
                                    <time
                                        dateTime={post.date}
                                        className="shrink-0 text-sm text-text-dim min-w-[5rem]"
                                    >
                                        {formatDate(post.date)}
                                    </time>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1">
                                            <CategoryBadge category={post.category} size="sm" />
                                        </div>
                                        <Link
                                            href={`/posts/${post.slug}`}
                                            className="font-display font-bold text-text transition-colors hover:text-accent line-clamp-1"
                                        >
                                            {post.title}
                                        </Link>
                                        {post.dek && (
                                            <p className="mt-0.5 text-sm text-text-muted line-clamp-1">
                                                {post.dek}
                                            </p>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                );
            })}

            {posts.length === 0 && (
                <div className="rounded-xl border border-border bg-surface p-10 text-center">
                    <p className="text-text-muted">No articles yet. Check back soon!</p>
                </div>
            )}
        </div>
    );
}
