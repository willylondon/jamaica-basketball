import Link from "next/link";
import { getCategoryLabel, getAuthorName } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/content";
import PostCover from "@/components/ui/PostCover";

interface PostCardProps {
    post: Post;
    priority?: boolean;
}

export default function PostCard({ post, priority = false }: PostCardProps) {
    return (
        <article className="group flex flex-col">
            <Link href={`/posts/${post.slug}`} className="relative block aspect-video overflow-hidden rounded-md bg-surface" tabIndex={-1} aria-hidden="true">
                <PostCover
                    post={post}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={priority}
                    className="transition-transform duration-500 group-hover:scale-[1.03]"
                />
            </Link>
            <div className="flex flex-1 flex-col pt-3.5">
                <Link href={`/category/${post.category}`} className="kicker w-fit text-accent hover:text-accent-hover">
                    {getCategoryLabel(post.category)}
                </Link>
                <h3 className="mt-1.5 font-body text-[1.1875rem] font-bold leading-snug tracking-normal">
                    <Link href={`/posts/${post.slug}`} className="text-text transition-colors hover:text-accent">
                        {post.title}
                    </Link>
                </h3>
                {post.dek && (
                    <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-relaxed text-text-muted">{post.dek}</p>
                )}
                <p className="mt-auto pt-3 text-[0.8125rem] text-text-dim">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span aria-hidden="true"> · </span>
                    {getAuthorName(post.author)}
                </p>
            </div>
        </article>
    );
}
