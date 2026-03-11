import Link from "next/link";
import { getCategoryLabel } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import type { Post } from "@/lib/content";

interface PostCardProps {
    post: Post;
    priority?: boolean;
}

export default function PostCard({ post, priority = false }: PostCardProps) {
    return (
        <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent-glow">
            {/* Image */}
            <Link href={`/posts/${post.slug}`} className="relative aspect-video overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent z-10" />
                <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={priority}
                />
                {/* Category badge */}
                <span className="absolute top-3 left-3 z-20 rounded-full bg-accent/90 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-black backdrop-blur-sm">
                    {getCategoryLabel(post.category)}
                </span>
            </Link>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                <Link href={`/posts/${post.slug}`}>
                    <h3 className="font-display text-lg font-bold leading-tight text-text transition-colors group-hover:text-accent line-clamp-2">
                        {post.title}
                    </h3>
                </Link>
                {post.dek && (
                    <p className="mt-1.5 text-sm text-text-muted line-clamp-2">
                        {post.dek}
                    </p>
                )}
                <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-text-dim">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span className="text-border">·</span>
                    <span>{post.author}</span>
                </div>
            </div>
        </article>
    );
}
