import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { LEAGUE_HUBS, getPostsForLeagueHub } from "@/lib/leagues";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Leagues and Programs",
    description:
        "Browse Jamaica Basketball coverage hubs for JABA, NBL, community basketball, ISSA age-group competition, women's basketball, and P.H.A.S.E. 1 Academy.",
    alternates: { canonical: `${SITE.url}/leagues` },
};

export default function LeaguesPage() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <Breadcrumbs items={[{ label: "Leagues & Programs" }]} />

            <header className="mb-8">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-text">
                    Leagues & Programs
                </h1>
                <p className="mt-2 max-w-3xl text-text-muted">
                    Built from the Jamaica Basketball datasheets, these hubs reflect the active competition layers and development pathways currently tracked in the ecosystem.
                </p>
            </header>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {LEAGUE_HUBS.map((hub) => {
                    const posts = getPostsForLeagueHub(hub);
                    return (
                        <Link
                            key={hub.slug}
                            href={`/leagues/${hub.slug}`}
                            className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/40 hover:bg-surface/80"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                                {hub.teamCount} tracked teams
                            </p>
                            <h2 className="mt-2 font-display text-2xl font-bold text-text">
                                {hub.label}
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-text-muted">
                                {hub.description}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {hub.levels.slice(0, 3).map((level) => (
                                    <span
                                        key={level}
                                        className="rounded-full border border-border px-3 py-1 text-xs text-text-muted"
                                    >
                                        {level}
                                    </span>
                                ))}
                            </div>
                            <p className="mt-5 text-sm text-text-dim">
                                {posts.length} related article{posts.length === 1 ? "" : "s"} on the site
                            </p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
