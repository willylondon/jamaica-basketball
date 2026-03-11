import Link from "next/link";
import { getCategoryLabel } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import type { Post } from "@/lib/content";

interface PostCardFeaturedProps {
    post: Post;
}

export default function PostCardFeatured({ post }: PostCardFeaturedProps) {
    return (
        <article className="group relative overflow-hidden rounded-2xl border border-border bg-surface">
            <Link href={`/posts/${post.slug}`} className="block">
                <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent z-10" />
                    <Image
                        src={post.image}
                        alt={post.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                    />
                    {/* Content overlay */}
                    <div className="absolute inset-x-0 bottom-0 z-20 p-6 md:p-10">
                        <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-black mb-3">
                            {getCategoryLabel(post.category)}
                        </span>
                        <h2 className="font-display text-2xl md:text-4xl font-extrabold leading-tight text-white mb-2 max-w-3xl drop-shadow-lg">
                            {post.title}
                        </h2>
                        {post.dek && (
                            <p className="text-sm md:text-base text-gray-300 max-w-2xl mb-3 line-clamp-2">
                                {post.dek}
                            </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <time dateTime={post.date}>{formatDate(post.date)}</time>
                            <span>·</span>
                            <span>{post.author}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
}
