import Link from "next/link";
import { scoreboard } from "@/lib/scoreboard";
import { getPublishedPosts } from "@/lib/content";

/**
 * Ink band under the masthead: upcoming games and recent results from
 * content/settings/scoreboard.json. With no scoreboard entries it falls back
 * to the latest headlines so the band never sits empty.
 */
export default function ScoreStrip() {
    const groups = (scoreboard.strip ?? []).filter((g) => g.items.length > 0);

    if (groups.length === 0) {
        const posts = getPublishedPosts().slice(0, 4);
        if (posts.length === 0) return null;
        return (
            <div className="bg-ink text-ink-text">
                <div className="no-scrollbar mx-auto flex max-w-7xl items-stretch overflow-x-auto px-4 lg:px-8">
                    <span className="flex shrink-0 items-center border-r border-ink-line py-2.5 pr-4 font-display text-sm font-bold uppercase tracking-[0.1em] text-gold">
                        Latest
                    </span>
                    {posts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/posts/${post.slug}`}
                            className="flex shrink-0 items-center border-r border-ink-line px-4 py-2.5 text-sm font-medium text-ink-text transition-colors last:border-r-0 hover:text-gold"
                        >
                            {post.title}
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <nav aria-label="Scores and fixtures" className="bg-ink text-ink-text">
            <div className="no-scrollbar mx-auto flex max-w-7xl items-stretch overflow-x-auto px-4 lg:px-8">
                {groups.map((group, gi) => (
                    <div key={group.label} className="flex shrink-0 items-stretch">
                        <span
                            className={`flex items-center border-r border-ink-line py-2.5 pr-4 font-display text-sm font-bold uppercase tracking-[0.1em] text-gold ${gi > 0 ? "pl-4" : ""}`}
                        >
                            {group.label}
                        </span>
                        {group.items.map((item) => {
                            const inner = (
                                <>
                                    <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-ink-muted">
                                        {item.meta}
                                    </span>
                                    <span className="font-display text-[1.0625rem] font-bold leading-tight tracking-[0.02em]">
                                        {item.text}
                                    </span>
                                </>
                            );
                            const cls =
                                "flex min-h-[52px] flex-col justify-center border-r border-ink-line px-4 py-2 text-ink-text whitespace-nowrap";
                            return item.href ? (
                                <Link key={item.text} href={item.href} className={`${cls} transition-colors hover:bg-ink-raised hover:text-gold`}>
                                    {inner}
                                </Link>
                            ) : (
                                <div key={item.text} className={cls}>
                                    {inner}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </nav>
    );
}
