import type { Metadata } from "next";
import Link from "next/link";
import PostCardFeatured from "@/components/ui/PostCardFeatured";
import PostCard from "@/components/ui/PostCard";
import SocialCta from "@/components/ui/SocialCta";
import SponsorPlaceholder from "@/components/ui/SponsorPlaceholder";
import { getPublishedPosts, getFeaturedPosts, getPostsByCategory, getTrendingPosts, CATEGORIES } from "@/lib/content";
import { LEAGUE_HUBS, getPostsForLeagueHub } from "@/lib/leagues";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "News, Scores and Features in Jamaica",
  description:
    "Jamaica Basketball covers national team news, school basketball, 3x3, club competition, player features, and basketball culture across Jamaica.",
  alternates: {
    canonical: SITE.url,
  },
};

export default function HomePage() {
  const allPosts = getPublishedPosts();
  const featuredPosts = getFeaturedPosts();
  const heroPost = featuredPosts[0] || allPosts[0];
  const latestPosts = allPosts.filter((p) => p.slug !== heroPost?.slug).slice(0, 6);
  const coverageHubs = CATEGORIES.filter((category) =>
    ["news", "national-team", "high-school", "club-basketball", "3x3", "player-spotlight"].includes(category.slug)
  );
  const leagueHubs = LEAGUE_HUBS.slice(0, 6);

  // Opinion + Features combined module
  const opinionPosts = getPostsByCategory("opinion").slice(0, 3);
  const featurePosts = getPostsByCategory("features").slice(0, 3);

  // Trending / recommended
  const trendingPosts = getTrendingPosts(4).filter((p) => p.slug !== heroPost?.slug);

  // Category spotlights (exclude opinion/features since they have dedicated modules)
  const spotlightCategories = CATEGORIES.filter(
    (c) => !["news", "opinion", "features"].includes(c.slug) && getPostsByCategory(c.slug).length > 0
  ).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      {/* Hero */}
      {heroPost && (
        <section className="mb-10">
          <PostCardFeatured post={heroPost} />
        </section>
      )}

      {/* Latest Posts */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-text">
            Latest
          </h2>
          <Link
            href="/archive"
            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            View All →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post, i) => (
            <PostCard key={post.slug} post={post} priority={i < 2} />
          ))}
        </div>
      </section>

      <section className="mb-14 rounded-2xl border border-border bg-surface/60 p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h2 className="font-display text-xl font-bold text-text">
              Coverage Hubs
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-text-muted">
              Explore the biggest topics in Jamaican basketball, from FIBA competition and school leagues to club basketball, 3x3, and player development.
            </p>
          </div>
          <Link
            href="/archive"
            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            Browse Archive →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coverageHubs.map((category) => {
            const count = getPostsByCategory(category.slug).length;
            return (
              <Link
                key={category.slug}
                href={category.slug === "news" ? "/news" : `/category/${category.slug}`}
                className="rounded-xl border border-border bg-bg/40 p-5 transition-colors hover:border-accent/40 hover:bg-surface"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {count} article{count === 1 ? "" : "s"}
                </p>
                <h3 className="mt-2 font-display text-lg font-bold text-text">
                  {category.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {category.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-14 rounded-2xl border border-border bg-surface/60 p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-text">
              Leagues & Programs
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-text-muted">
              These hubs are built from the Jamaica Basketball datasheets so the site can track active leagues, school competitions, JABA programs, and academy pathways in one place.
            </p>
          </div>
          <Link
            href="/leagues"
            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            View All Leagues →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leagueHubs.map((hub) => {
            const relatedPosts = getPostsForLeagueHub(hub);
            return (
              <Link
                key={hub.slug}
                href={`/leagues/${hub.slug}`}
                className="rounded-xl border border-border bg-bg/40 p-5 transition-colors hover:border-accent/40 hover:bg-surface"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {hub.teamCount} tracked teams
                </p>
                <h3 className="mt-2 font-display text-lg font-bold text-text">
                  {hub.shortLabel}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {hub.status}
                </p>
                <p className="mt-4 text-sm text-text-dim">
                  {relatedPosts.length} related article{relatedPosts.length === 1 ? "" : "s"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Opinion & Features Module */}
      {(opinionPosts.length > 0 || featurePosts.length > 0) && (
        <section className="mb-14">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Opinion column */}
            {opinionPosts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-bold text-text">
                    Opinion
                  </h2>
                  <Link
                    href="/opinion"
                    className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
                  >
                    More →
                  </Link>
                </div>
                <div className="space-y-4">
                  {opinionPosts.map((post) => (
                    <article key={post.slug} className="flex gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/30">
                      <div className="min-w-0 flex-1">
                        <Link href={`/posts/${post.slug}`}>
                          <h3 className="font-display font-bold text-text transition-colors hover:text-accent line-clamp-2">
                            {post.title}
                          </h3>
                        </Link>
                        {post.dek && (
                          <p className="mt-1 text-sm text-text-muted line-clamp-2">{post.dek}</p>
                        )}
                        <p className="mt-2 text-xs text-text-dim">{post.author}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Features column */}
            {featurePosts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-bold text-text">
                    Features
                  </h2>
                  <Link
                    href="/features"
                    className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
                  >
                    More →
                  </Link>
                </div>
                <div className="space-y-4">
                  {featurePosts.map((post) => (
                    <article key={post.slug} className="flex gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/30">
                      <div className="min-w-0 flex-1">
                        <Link href={`/posts/${post.slug}`}>
                          <h3 className="font-display font-bold text-text transition-colors hover:text-accent line-clamp-2">
                            {post.title}
                          </h3>
                        </Link>
                        {post.dek && (
                          <p className="mt-1 text-sm text-text-muted line-clamp-2">{post.dek}</p>
                        )}
                        <p className="mt-2 text-xs text-text-dim">{post.author}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Trending / Recommended */}
      {trendingPosts.length > 0 && (
        <section className="mb-14">
          <h2 className="font-display text-xl font-bold text-text mb-6">
            Trending
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trendingPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Sponsor Placeholder */}
      <div className="mb-14">
        <SponsorPlaceholder />
      </div>

      {/* Category Spotlights */}
      {spotlightCategories.map((cat) => {
        const catPosts = getPostsByCategory(cat.slug).slice(0, 3);
        if (catPosts.length === 0) return null;
        return (
          <section key={cat.slug} className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-text">
                {cat.label}
              </h2>
              <Link
                href={`/category/${cat.slug}`}
                className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
              >
                More {cat.label} →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {catPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Social Follow CTA */}
      <div className="mb-14">
        <SocialCta />
      </div>

      {/* SEO text block */}
      <section className="mt-10 mb-6 rounded-xl border border-border bg-surface/50 p-6 md:p-8">
        <h2 className="font-display text-lg font-bold text-text mb-3">
          Jamaica Basketball News, Features and Culture
        </h2>
        <p className="text-sm text-text-muted leading-relaxed max-w-3xl">
          Jamaica Basketball is an independent publishing platform focused on the full basketball ecosystem in Jamaica. We cover
          Jamaica basketball news, national team updates, schoolboy and schoolgirl competitions, club leagues, 3x3 events,
          player spotlights, and the wider culture shaping the game across the island.
        </p>
        <p className="mt-3 text-sm text-text-muted leading-relaxed max-w-3xl">
          Start with the <Link href="/news" className="text-accent hover:text-accent-hover">latest news</Link>, explore
          our <Link href="/category/national-team" className="text-accent hover:text-accent-hover">national team coverage</Link>,
          browse <Link href="/category/high-school" className="text-accent hover:text-accent-hover">high school basketball stories</Link>,
          or dig into <Link href="/category/3x3" className="text-accent hover:text-accent-hover">3x3 basketball in Jamaica</Link>.
        </p>
      </section>
    </div>
  );
}
