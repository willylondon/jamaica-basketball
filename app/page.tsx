import Link from "next/link";
import PostCardFeatured from "@/components/ui/PostCardFeatured";
import PostCard from "@/components/ui/PostCard";
import SocialCta from "@/components/ui/SocialCta";
import SponsorPlaceholder from "@/components/ui/SponsorPlaceholder";
import { getPublishedPosts, getFeaturedPosts, getPostsByCategory, getTrendingPosts, CATEGORIES } from "@/lib/content";

export default function HomePage() {
  const allPosts = getPublishedPosts();
  const featuredPosts = getFeaturedPosts();
  const heroPost = featuredPosts[0] || allPosts[0];
  const latestPosts = allPosts.filter((p) => p.slug !== heroPost?.slug).slice(0, 6);

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
          Your Source for Basketball in Jamaica
        </h2>
        <p className="text-sm text-text-muted leading-relaxed max-w-3xl">
          Jamaica Basketball is the definitive independent source for basketball news, features, and analysis in Jamaica.
          From the national team&apos;s FIBA campaigns to schoolboy and schoolgirl basketball, club leagues, 3x3 competition,
          and player spotlights — we cover every level of the game across the island. Follow us for the latest on
          Jamaican basketball players, coaches, events, and the growing basketball culture in Jamaica.
        </p>
      </section>
    </div>
  );
}
