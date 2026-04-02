import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getPublishedPosts, getRelatedPosts, getCategoryLabel, getAuthorBySlug } from "@/lib/content";
import { formatDate, SITE } from "@/lib/utils";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CategoryBadge from "@/components/ui/CategoryBadge";
import PostCard from "@/components/ui/PostCard";
import AuthorCard from "@/components/ui/AuthorCard";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import Image from "next/image";
import { MDXContent } from "@/components/mdx-content";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) return {};

    const title = post.seoTitle || post.title;
    const description = post.seoDescription || post.excerpt || post.dek || `${post.title} — Jamaica Basketball`;
    const image = post.ogImage || post.image;
    const imageUrl = image.startsWith("http") ? image : `${SITE.url}${image}`;
    const canonical = post.canonicalUrl || `${SITE.url}/posts/${post.slug}`;

    return {
        title,
        description,
        keywords: post.keywords.length > 0 ? post.keywords : undefined,
        openGraph: {
            type: "article",
            title,
            description,
            url: `${SITE.url}/posts/${post.slug}`,
            images: [{ url: imageUrl, width: 1200, height: 630, alt: post.imageAlt }],
            publishedTime: post.date,
            modifiedTime: post.updated || post.date,
            authors: [post.author],
            tags: post.tags,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [imageUrl],
        },
        alternates: {
            canonical,
        },
    };
}

export default async function PostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) notFound();

    const author = getAuthorBySlug(post.author);
    const relatedPosts = getRelatedPosts(post, 3);
    const categoryLabel = getCategoryLabel(post.category);
    // Cast toc as any since Typescript type might not be updated until build
    const toc = (post as any).toc || [];
    const headings = toc.filter((t: any) => t.depth >= 2 && t.depth <= 3).map((t: any) => ({
      id: t.url.replace("#", ""),
      text: t.title,
      level: t.depth,
    }));
    const showToc = headings.length >= 3;

    return (
        <>
            <ArticleJsonLd
                title={post.title}
                description={post.excerpt || post.dek || post.title}
                url={`${SITE.url}/posts/${post.slug}`}
                image={post.ogImage || post.image}
                datePublished={post.date}
                dateModified={post.updated}
                author={post.author}
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: SITE.url },
                    { name: categoryLabel, url: `${SITE.url}/category/${post.category}` },
                    { name: post.title, url: `${SITE.url}/posts/${post.slug}` },
                ]}
            />

            <article className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    items={[
                        { label: categoryLabel, href: `/category/${post.category}` },
                        { label: post.title },
                    ]}
                />

                {/* Post header */}
                <header className="mb-8">
                    <CategoryBadge category={post.category} size="md" />
                    <h1 className="mt-4 font-display text-3xl md:text-5xl font-extrabold leading-tight text-text">
                        {post.title}
                    </h1>
                    {post.dek && (
                        <p className="mt-3 text-lg text-text-muted max-w-2xl">
                            {post.dek}
                        </p>
                    )}

                    {/* Meta */}
                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                        <span className="font-medium text-text">{post.author}</span>
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                        {post.updated && (
                            <span className="text-text-dim">
                                Updated {formatDate(post.updated)}
                            </span>
                        )}
                        {post.metadata?.readingTime && (
                            <span>{Math.ceil(post.metadata.readingTime)} min read</span>
                        )}
                    </div>
                </header>

                {/* Featured image */}
                <figure className="mb-8 overflow-hidden rounded-xl relative w-full aspect-video">
                    <Image
                        src={post.image}
                        alt={post.imageAlt}
                        fill
                        className="object-cover"
                        priority
                    />
                </figure>

                {/* Table of Contents */}
                {showToc && (
                    <nav className="mb-8 rounded-xl border border-border bg-surface p-5" aria-label="Table of contents">
                        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">
                            In This Article
                        </h2>
                        <ul className="space-y-1.5">
                            {headings.map((h: any) => (
                                <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
                                    <a
                                        href={`#${h.id}`}
                                        className="text-sm text-text-muted transition-colors hover:text-accent"
                                    >
                                        {h.text}
                                    </a>
                                </li>
                            ))}
                    <MDXContent code={post.body} />
                </div>

                {/* Author Card */}
                {author && <AuthorCard author={author} />}

                {/* Tags */}
                    <div className="mt-10 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-border px-3 py-1 text-xs text-text-muted transition-colors hover:border-accent/30 hover:text-accent"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Share */}
                <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                    <span className="text-sm font-medium text-text-muted">Share:</span>
                    <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${SITE.url}/posts/${post.slug}`)}&text=${encodeURIComponent(post.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted transition-colors hover:text-accent"
                        aria-label="Share on Twitter"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>
                </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
                    <h2 className="mb-6 font-display text-xl font-bold text-text">
                        Related Stories
                    </h2>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {relatedPosts.map((p) => (
                            <PostCard key={p.slug} post={p} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
