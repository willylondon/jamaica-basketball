import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PostCard from "@/components/ui/PostCard";
import { getLeagueHubBySlug, LEAGUE_HUBS, getPostsForLeagueHub } from "@/lib/leagues";
import { SITE } from "@/lib/utils";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return LEAGUE_HUBS.map((hub) => ({ slug: hub.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const hub = getLeagueHubBySlug(slug);
    if (!hub) return {};

    return {
        title: hub.label,
        description: hub.description,
        alternates: { canonical: `${SITE.url}/leagues/${hub.slug}` },
    };
}

export default async function LeagueHubPage({ params }: PageProps) {
    const { slug } = await params;
    const hub = getLeagueHubBySlug(slug);
    if (!hub) notFound();

    const posts = getPostsForLeagueHub(hub);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <Breadcrumbs items={[{ label: "Leagues & Programs", href: "/leagues" }, { label: hub.label }]} />

            <header className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    {hub.status}
                </p>
                <h1 className="mt-2 font-display text-3xl md:text-4xl font-extrabold text-text">
                    {hub.label}
                </h1>
                <p className="mt-3 max-w-3xl text-text-muted">
                    {hub.description}
                </p>
            </header>

            <section className="mb-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-border bg-surface p-6">
                    <h2 className="font-display text-xl font-bold text-text">
                        Competition Snapshot
                    </h2>
                    <p className="mt-2 text-sm text-text-muted">
                        Competition layers pulled from the Jamaica Basketball datasheets and research files.
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border bg-bg/40 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-accent">Tracked Teams</p>
                            <p className="mt-2 text-3xl font-bold text-text">{hub.teamCount}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-bg/40 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-accent">Levels</p>
                            <p className="mt-2 text-sm text-text">{hub.levels.join(", ")}</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                            Dataset Competitions
                        </h3>
                        <ul className="mt-3 space-y-2 text-sm text-text-muted">
                            {hub.competitionNames.map((name) => (
                                <li key={name}>{name}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-6">
                    <h2 className="font-display text-xl font-bold text-text">
                        Teams We Track
                    </h2>
                    <ul className="mt-4 grid gap-2 text-sm text-text-muted">
                        {hub.teams.map((team) => (
                            <li key={team} className="rounded-lg border border-border bg-bg/40 px-3 py-2">
                                {team}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section>
                <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h2 className="font-display text-xl font-bold text-text">
                            Related Coverage
                        </h2>
                        <p className="mt-2 text-sm text-text-muted">
                            Stories matched from category and tag rules for this hub. Add future updates with the same league tags to keep this page populated.
                        </p>
                    </div>
                    <Link
                        href="/archive"
                        className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
                    >
                        Browse Archive →
                    </Link>
                </div>

                {posts.length > 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post, i) => (
                            <PostCard key={post.slug} post={post} priority={i < 3} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-border bg-surface p-8">
                        <p className="text-text-muted">
                            No stories are tagged into this hub yet. The league structure is live now, so new articles can be added without the page staying empty.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
