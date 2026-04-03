import Link from "next/link";
import { getPublishedPosts } from "@/lib/content";

export default function NewsTicker() {
    const posts = getPublishedPosts().slice(0, 8);
    if (posts.length === 0) return null;

    // Duplicate for seamless loop
    const items = [...posts, ...posts];

    return (
        <div className="relative z-40 border-b border-border bg-surface overflow-hidden">
            <div className="flex items-stretch">
                {/* Label */}
                <div className="flex-shrink-0 flex items-center gap-2 bg-accent px-4 py-2 z-10">
                    <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
                    <span className="text-[0.6875rem] font-black uppercase tracking-widest text-black whitespace-nowrap">
                        Latest
                    </span>
                </div>
                {/* Ticker track */}
                <div className="relative flex-1 overflow-hidden">
                    <div className="animate-ticker flex items-center gap-0 whitespace-nowrap">
                        {items.map((post, i) => (
                            <Link
                                key={`${post.slug}-${i}`}
                                href={`/posts/${post.slug}`}
                                className="inline-flex items-center gap-3 px-6 py-2 text-xs font-medium text-text-muted transition-colors hover:text-accent"
                            >
                                <span className="text-accent/40">◆</span>
                                {post.title}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
