import Link from "next/link";
import { getCategoryLabel } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/content";
import CoverImage from "@/components/ui/CoverImage";

interface PostCardProps {
    post: Post;
    priority?: boolean;
}

export default function PostCard({ post, priority = false }: PostCardProps) {
    const readingTime = (post.metadata as any)?.readingTime;

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5">
            {/* Image */}
            <Link href={`/posts/${post.slug}`} className="relative aspect-video overflow-hidden bg-surface-hover">
                <CoverImage
                    src={post.image}
                    alt={post.imageAlt}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={priority}
                />
                {/* Category badge */}
                <span className="absolute top-3 left-3 z-20 rounded-full bg-accent px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-black shadow-md">
                    {getCategoryLabel(post.category)}
                </span>
                {/* Reading time badge */}
                {readingTime && (
                    <span className="absolute top-3 right-3 z-20 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[0.6875rem] font-medium text-white">
                        {readingTime} min read
                    </span>
                )}
            </Link>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                <Link href={`/posts/${post.slug}`}>
                    <h3 className="font-display text-base font-bold leading-snug text-text transition-colors group-hover:text-accent line-clamp-2">
                        {post.title}
                    </h3>
                </Link>
                {post.dek && (
                    <p className="mt-2 text-sm text-text-muted line-clamp-2 leading-relaxed">
                        {post.dek}
                    </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-4 text-xs text-text-dim">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span className="font-medium text-text-dim truncate ml-2 max-w-[120px]">{post.author}</span>
                </div>
            </div>
        </article>
    );
}
