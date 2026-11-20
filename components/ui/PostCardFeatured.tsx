import Link from "next/link";
import { getCategoryLabel, getAuthorName } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/content";
import PostCover from "@/components/ui/PostCover";

interface PostCardFeaturedProps {
    post: Post;
}

/** The homepage lead story: a large cover with the headline set beneath it. */
export default function PostCardFeatured({ post }: PostCardFeaturedProps) {
    const readingTime = (post.metadata as { readingTime?: number } | undefined)?.readingTime;

    return (
        <article className="group">
            <Link href={`/posts/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden rounded-md bg-surface" tabIndex={-1} aria-hidden="true">
                <PostCover
                    post={post}
                    size="lead"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                    className="transition-transform duration-700 group-hover:scale-[1.02]"
                />
            </Link>
            <div className="pt-5">
                <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/category/${post.category}`} className="kicker text-accent hover:text-accent-hover">
                        {getCategoryLabel(post.category)}
                    </Link>
                    {post.breaking && (
                        <span className="kicker rounded-full bg-[#B42318] px-2.5 py-0.5 text-white">Breaking</span>
                    )}
                </div>
                <h2 className="mt-2 text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-none">
                    <Link href={`/posts/${post.slug}`} className="text-text transition-colors hover:text-accent">
                        {post.title}
                    </Link>
                </h2>
                {post.dek && (
                    <p className="mt-3 max-w-3xl text-lg leading-normal text-text-muted md:text-[1.1875rem]">{post.dek}</p>
                )}
                <p className="mt-3 text-sm text-text-dim">
                    {getAuthorName(post.author)}
                    <span aria-hidden="true"> · </span>
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    {readingTime ? (
                        <>
                            <span aria-hidden="true"> · </span>
                            {readingTime} min read
                        </>
                    ) : null}
                </p>
            </div>
        </article>
    );
}
