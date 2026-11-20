import type { Metadata } from "next";
import Link from "next/link";
import PostCardFeatured from "@/components/ui/PostCardFeatured";
import PostCard from "@/components/ui/PostCard";
import NextGameCard from "@/components/home/NextGameCard";
import FixturesAndTables from "@/components/home/FixturesAndTables";
import SchoolsBoard from "@/components/home/SchoolsBoard";
import BriefingBand from "@/components/home/BriefingBand";
import { getPublishedPosts, getPostsByCategory, getAuthorName } from "@/lib/content";
import { LEAGUE_HUBS } from "@/lib/leagues";
import { scoreboard } from "@/lib/scoreboard";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
    title: "News, Scores and Features in Jamaica",
    description:
        "Jamaica Basketball covers national team news, school basketball, 3x3, club competition, player features, and basketball culture across Jamaica.",
    alternates: {
        canonical: SITE.url,
    },
};

function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="text-sm font-semibold text-accent hover:text-accent-hover">
            {children}
        </Link>
    );
}

export default function HomePage() {
    const allPosts = getPublishedPosts();
    const heroPost = allPosts[0];
    const topStories = allPosts.slice(1, 5);
    const shown = new Set([heroPost?.slug, ...topStories.map((p) => p.slug)]);
    const latestPosts = allPosts.filter((p) => !shown.has(p.slug)).slice(0, 8);
    const opinionPosts = getPostsByCategory("opinion").slice(0, 3);
    const featurePosts = getPostsByCategory("features").slice(0, 3);

    return (
        <>
            <div className="mx-auto max-w-7xl px-4 pt-8 lg:px-8">
                {/* Lead story, next game and top stories */}
                <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
                    {heroPost && <PostCardFeatured post={heroPost} />}
                    <aside className="flex min-w-0 flex-col gap-8">
                        {scoreboard.nextGame && <NextGameCard game={scoreboard.nextGame} />}
                        {topStories.length > 0 && (
                            <section aria-labelledby="top-stories-h">
                                <h2 id="top-stories-h" className="kicker text-text-dim">Top stories</h2>
                                <ol className="mt-1.5">
                                    {topStories.map((post, i) => (
                                        <li key={post.slug} className="flex gap-4 border-b border-border py-3.5 last:border-b-0">
                                            <span aria-hidden="true" className="w-6 shrink-0 font-display text-[1.75rem] font-extrabold leading-none text-accent">
                                                {i + 1}
                                            </span>
                                            <Link href={`/posts/${post.slug}`} className="text-base font-semibold leading-snug text-text hover:text-accent">
                                                {post.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        )}
                    </aside>
                </div>

                <FixturesAndTables fixtures={scoreboard.fixtures} standings={scoreboard.standings} />

                {scoreboard.schools && scoreboard.schools.results.length > 0 && <SchoolsBoard data={scoreboard.schools} />}

                {/* Latest */}
                {latestPosts.length > 0 && (
                    <section aria-labelledby="latest-h" className="mt-16">
                        <div className="section-head">
                            <h2 id="latest-h">Latest</h2>
                            <MoreLink href="/archive">All stories</MoreLink>
                        </div>
                        <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                            {latestPosts.map((post) => (
                                <PostCard key={post.slug} post={post} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Features and opinion */}
                {(featurePosts.length > 0 || opinionPosts.length > 0) && (
                    <div className="mt-16 grid gap-10 lg:grid-cols-2">
                        {[
                            { id: "features", title: "Features", href: "/features", posts: featurePosts },
                            { id: "opinion", title: "Opinion", href: "/opinion", posts: opinionPosts },
                        ]
                            .filter((col) => col.posts.length > 0)
                            .map((col) => (
                                <section key={col.id} aria-labelledby={`${col.id}-h`}>
                                    <div className="section-head">
                                        <h2 id={`${col.id}-h`}>{col.title}</h2>
                                        <MoreLink href={col.href}>More {col.title.toLowerCase()}</MoreLink>
                                    </div>
                                    <ul>
                                        {col.posts.map((post) => (
                                            <li key={post.slug} className="border-b border-border py-4 first:pt-0 last:border-b-0">
                                                <h3 className="font-body text-lg font-bold leading-snug tracking-normal">
                                                    <Link href={`/posts/${post.slug}`} className="text-text hover:text-accent">
                                                        {post.title}
                                                    </Link>
                                                </h3>
                                                {post.dek && <p className="mt-1 line-clamp-2 text-[0.9375rem] leading-relaxed text-text-muted">{post.dek}</p>}
                                                <p className="mt-1.5 text-[0.8125rem] text-text-dim">{getAuthorName(post.author)}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                    </div>
                )}

                {/* Leagues and programs */}
                <section aria-labelledby="leagues-h" className="mt-16">
                    <div className="section-head">
                        <h2 id="leagues-h">Leagues &amp; programs</h2>
                        <MoreLink href="/leagues">All leagues</MoreLink>
                    </div>
                    <ul className="flex flex-wrap gap-2.5">
                        {LEAGUE_HUBS.map((hub) => (
                            <li key={hub.slug}>
                                <Link
                                    href={`/leagues/${hub.slug}`}
                                    className="flex h-11 items-center rounded-full border border-border-hover px-5 text-[0.9375rem] font-semibold text-text transition-colors hover:border-ink hover:bg-ink hover:text-ink-text"
                                >
                                    {hub.shortLabel}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* About and partnerships */}
                <section aria-labelledby="about-h" className="mt-16 grid gap-8 border-t border-border pt-8 lg:grid-cols-[2fr_1fr]">
                    <div>
                        <h2 id="about-h" className="font-body text-lg font-bold tracking-normal">Jamaica basketball news, features and culture</h2>
                        <p className="mt-2 max-w-3xl text-[0.9375rem] leading-relaxed text-text-muted">
                            Jamaica Basketball is an independent publication covering the full basketball ecosystem in Jamaica: the{" "}
                            <Link href="/category/national-team" className="font-semibold text-accent hover:text-accent-hover">national team</Link>,{" "}
                            <Link href="/category/high-school" className="font-semibold text-accent hover:text-accent-hover">schoolboy and schoolgirl competitions</Link>,{" "}
                            <Link href="/category/club-basketball" className="font-semibold text-accent hover:text-accent-hover">club leagues</Link>,{" "}
                            <Link href="/category/3x3" className="font-semibold text-accent hover:text-accent-hover">3x3</Link> and the players shaping the game across the island.
                        </p>
                    </div>
                    <div className="rounded-md bg-surface p-5">
                        <h2 className="font-body text-base font-bold tracking-normal">Partner with us</h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-text-muted">Sponsorships, event coverage and brand partnerships.</p>
                        <a href="mailto:partner@jamaicabasketball.online" className="mt-3 inline-flex text-sm font-semibold text-accent hover:text-accent-hover">
                            partner@jamaicabasketball.online
                        </a>
                    </div>
                </section>
            </div>

            <BriefingBand />
        </>
    );
}
