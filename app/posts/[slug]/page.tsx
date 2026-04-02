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
    return {
        title,
        description,
        openGraph: {
            type: "article",
            title,
            description,
            url: `${SITE.url}/posts/${post.slug}`,
            images: [{ url: imageUrl, width: 1200, height: 630, alt: post.imageAlt }],
            publishedTime: post.date,
            authors: [post.author],
        },
        twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
        alternates: { canonical: post.canonicalUrl || `${SITE.url}/posts/${post.slug}` },
    };
}

export default async function PostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) notFound();

    const author = getAuthorBySlug(post.author);
    const relatedPosts = getRelatedPosts(post, 3);
    const categoryLabel = getCategoryLabel(post.category);
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
                <Breadcrumbs items={[{ label: categoryLabel, href: `/category/${post.category}` }, { label: post.title }]} />
                <header className="mb-8">
                    <CategoryBadge category={post.category} size="md" />
                    <h1 className="mt-4 font-display text-3xl md:text-5xl font-extrabold leading-tight text-text">{post.title}</h1>
                    {post.dek && <p className="mt-3 text-lg text-text-muted max-w-2xl">{post.dek}</p>}
                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                        <span className="font-medium text-text">{post.author}</span>
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                        {post.updated && <span className="text-text-dim">Updated {formatDate(post.updated)}</span>}
                    </div>
                </header>
                <figure className="mb-8 overflow-hidden rounded-xl relative w-full aspect-video">
                    <Image src={post.image} alt={post.imageAlt} fill className="object-cover" priority />
                </figure>
                {showToc && (
                    <nav className="mb-8 rounded-xl border border-border bg-surface p-5" aria-label="Table of contents">
                        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">In This Article</h2>
                        <ul className="space-y-1.5">
                            {headings.map((h: any) => (
                                <li key={h.id} className={h.level === 3 ? "ml-4" : ""}><a href={`#${h.id}`} className="text-sm text-text-muted transition-colors hover:text-accent">{h.text}</a></li>
                            ))}
                        </ul>
                    </nav>
                )}
                <div className="article-body prose prose-invert max-w-none"><MDXContent code={post.body} /></div>
                {author && <AuthorCard author={author} />}
                <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                    <span className="text-sm font-medium text-text-muted">Share:</span>
                </div>
            </article>
            {relatedPosts.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
                    <h2 className="mb-6 font-display text-xl font-bold text-text">Related Stories</h2>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {relatedPosts.map((p) => (<PostCard key={p.slug} post={p} />))}
                    </div>
                </section>
            )}
        </>
    );
}
