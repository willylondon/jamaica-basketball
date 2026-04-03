import Link from "next/link";
import { getCategoryLabel } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/content";
import CoverImage from "@/components/ui/CoverImage";

interface PostCardFeaturedProps {
    post: Post;
}

export default function PostCardFeatured({ post }: PostCardFeaturedProps) {
    const readingTime = (post.metadata as any)?.readingTime;

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-border bg-surface">
            <Link href={`/posts/${post.slug}`} className="block">
                <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-surface-hover">
                    {/* Layered gradient for better text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                    <CoverImage
                        src={post.image}
                        alt={post.imageAlt}
                        sizes="(max-width: 768px) 100vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        priority
                    />

                    {/* Top-left: LIVE / FEATURED badge */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-black shadow-lg">
                            {getCategoryLabel(post.category)}
                        </span>
                        {post.breaking && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                Breaking
                            </span>
                        )}
                    </div>

                    {/* Content overlay */}
                    <div className="absolute inset-x-0 bottom-0 z-20 p-6 md:p-10">
                        <h2 className="font-display text-2xl md:text-4xl font-extrabold leading-tight text-white mb-3 max-w-3xl drop-shadow-md">
                            {post.title}
                        </h2>
                        {post.dek && (
                            <p className="text-sm md:text-base text-white/75 max-w-2xl mb-4 line-clamp-2 leading-relaxed">
                                {post.dek}
                            </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-white/60">
                            <time dateTime={post.date}>{formatDate(post.date)}</time>
                            <span className="text-white/30">·</span>
                            <span>{post.author}</span>
                            {readingTime && (
                                <>
                                    <span className="text-white/30">·</span>
                                    <span>{readingTime} min read</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Arrow indicator on hover */}
                    <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-black opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 shadow-lg">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </div>
                </div>
            </Link>
        </article>
    );
}
