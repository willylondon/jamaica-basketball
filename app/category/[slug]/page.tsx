import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostsByCategory, getCategoryBySlug, CATEGORIES } from "@/lib/content";
import { SITE } from "@/lib/utils";
import PostCard from "@/components/ui/PostCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const cat = getCategoryBySlug(slug);
    if (!cat) return {};

    return {
        title: cat.label,
        description: cat.description,
        openGraph: {
            title: `${cat.label} — Jamaica Basketball`,
            description: cat.description,
            url: `${SITE.url}/category/${cat.slug}`,
        },
        alternates: {
            canonical: `${SITE.url}/category/${cat.slug}`,
        },
    };
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;
    const category = getCategoryBySlug(slug);
    if (!category) notFound();

    const posts = getPostsByCategory(slug);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <Breadcrumbs items={[{ label: category.label }]} />

            <header className="mb-8">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-text">
                    {category.label}
                </h1>
                <p className="mt-2 text-text-muted max-w-2xl">
                    {category.description}
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
                    <p className="text-text-muted">No posts in this category yet. Check back soon!</p>
                </div>
            )}
        </div>
    );
}
