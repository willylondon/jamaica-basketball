import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getPublishedPosts, getRelatedPosts, getCategoryLabel, getAuthorBySlug, getAuthorName } from "@/lib/content";
import { formatDate, SITE } from "@/lib/utils";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CategoryBadge from "@/components/ui/CategoryBadge";
import PostCard from "@/components/ui/PostCard";
import AuthorCard from "@/components/ui/AuthorCard";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import PostCover from "@/components/ui/PostCover";
import ReadingProgress from "@/components/ui/ReadingProgress";
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
            images: [{ url: imageUrl, alt: post.imageAlt }],
            publishedTime: post.date,
            authors: [getAuthorName(post.author)],
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
    const readingTime = (post.metadata as any)?.readingTime;
    const imageCredit = (post as any).imageCredit as string | undefined;
    const toc = (post as any).toc || [];
    const headings = toc.filter((t: any) => t.depth >= 2 && t.depth <= 3).map((t: any) => ({
      id: t.url.replace("#", ""),
      text: t.title,
      level: t.depth,
    }));
    const showToc = headings.length >= 3;

    return (
        <>
            <ReadingProgress />
            <ArticleJsonLd
                title={post.title}
                description={post.excerpt || post.dek || post.title}
                url={`${SITE.url}/posts/${post.slug}`}
                image={post.ogImage || post.image}
                datePublished={post.date}
                dateModified={post.updated}
                author={author?.name ?? post.author}
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: SITE.url },
                    { name: categoryLabel, url: `${SITE.url}/category/${post.category}` },
                    { name: post.title, url: `${SITE.url}/posts/${post.slug}` },
                ]}
            />
            <article className="mx-auto max-w-4xl px-4 py-8 lg:px-8" data-newsroom-syndication={post.syndicate ? post.slug : undefined}>
                <Breadcrumbs items={[{ label: categoryLabel, href: `/category/${post.category}` }, { label: post.title }]} />
                <header className="mb-8">
                    <CategoryBadge category={post.category} size="md" />
                    <h1 className="mt-3 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.98] text-text">{post.title}</h1>
                    {post.dek && <p className="mt-4 max-w-3xl text-lg leading-normal text-text-muted md:text-[1.3125rem]">{post.dek}</p>}
                    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border pb-6 text-sm text-text-dim">
                        <span className="font-semibold text-text">{author?.name ?? post.author}</span>
                        <span className="text-text-dim">·</span>
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                        {readingTime && (
                            <>
                                <span className="text-text-dim">·</span>
                                <span>{readingTime} min read</span>
                            </>
                        )}
                        {post.updated && (
                            <>
                                <span className="text-text-dim">·</span>
                                <span className="text-text-dim">Updated {formatDate(post.updated)}</span>
                            </>
                        )}
                    </div>
                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {post.tags.map((tag: string) => (
                                <span key={tag} className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-dim">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </header>
                <figure className="mb-8">
                    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-surface">
                        <PostCover post={post} size="lead" sizes="(max-width: 896px) 100vw, 896px" priority />
                    </div>
                    {imageCredit && (
                        <figcaption className="mt-2 text-right text-xs text-text-dim">
                            {imageCredit}
                        </figcaption>
                    )}
                </figure>
                {showToc && (
                    <nav className="mb-10 rounded-md bg-surface p-5" aria-label="Table of contents">
                        <h2 className="kicker mb-3 text-accent">In this article</h2>
                        <ul className="space-y-1.5">
                            {headings.map((h: any) => (
                                <li key={h.id} className={h.level === 3 ? "ml-4" : ""}><a href={`#${h.id}`} className="text-sm text-text-muted transition-colors hover:text-accent">{h.text}</a></li>
                            ))}
                        </ul>
                    </nav>
                )}
                <div className="article-body max-w-[42rem]"><MDXContent code={post.body} /></div>
                <aside aria-label="Editorial standards" className="mt-10 max-w-[42rem] rounded-md border border-border-hover p-5 text-[0.9375rem] leading-relaxed text-text-muted">
                    <strong className="text-text">Our standards.</strong> Results, quotes and figures are checked against FIBA, JABA, ISSA or named reporting, and corrections are noted on the story. Spot an error?{" "}
                    <a href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent(`Correction: ${post.title}`)}`} className="font-semibold text-accent underline underline-offset-2 hover:text-accent-hover">
                        Tell the editors
                    </a>
                    .
                </aside>
                {author && <AuthorCard author={author} />}
                <div className="mt-8 flex flex-wrap items-center gap-2.5 border-t border-border pt-6">
                    <span className="text-sm font-medium text-text-muted">Share:</span>
                    <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${SITE.url}/posts/${post.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 items-center rounded-full border border-border-hover px-4 text-sm font-semibold text-text transition-colors hover:border-ink hover:bg-ink hover:text-ink-text"
                    >
                        X / Twitter
                    </a>
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITE.url}/posts/${post.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 items-center rounded-full border border-border-hover px-4 text-sm font-semibold text-text transition-colors hover:border-ink hover:bg-ink hover:text-ink-text"
                    >
                        Facebook
                    </a>
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${SITE.url}/posts/${post.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 items-center rounded-full border border-border-hover px-4 text-sm font-semibold text-text transition-colors hover:border-ink hover:bg-ink hover:text-ink-text"
                    >
                        WhatsApp
                    </a>
                </div>
            </article>
            {relatedPosts.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
                    <div className="section-head"><h2>Related stories</h2></div>
                    <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                        {relatedPosts.map((p) => (<PostCard key={p.slug} post={p} />))}
                    </div>
                </section>
            )}
        </>
    );
}
