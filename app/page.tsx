     1|import type { Metadata } from "next";
     2|import Link from "next/link";
     3|import PostCardFeatured from "@/components/ui/PostCardFeatured";
     4|import PostCard from "@/components/ui/PostCard";
     5|import SocialCta from "@/components/ui/SocialCta";
     6|import SponsorPlaceholder from "@/components/ui/SponsorPlaceholder";
     7|import { getPublishedPosts, getFeaturedPosts, getPostsByCategory, getTrendingPosts, CATEGORIES } from "@/lib/content";
     8|import { LEAGUE_HUBS, getPostsForLeagueHub } from "@/lib/leagues";
     9|import { SITE } from "@/lib/utils";
    10|
    11|export const metadata: Metadata = {
    12|  title: "News, Scores and Features in Jamaica",
    13|  description:
    14|    "Jamaica Basketball covers national team news, school basketball, 3x3, club competition, player features, and basketball culture across Jamaica.",
    15|  alternates: {
    16|    canonical: SITE.url,
    17|  },
    18|};
    19|
    20|export default function HomePage() {
  // Build version: 2026-04-01-V4-FINAL-FIX

    21|  const allPosts = getPublishedPosts();
    22|  const featuredPosts = getFeaturedPosts();
    23|  const heroPost = featuredPosts[0] || allPosts[0];
    24|  const latestPosts = allPosts.filter((p) => p.slug !== heroPost?.slug).slice(0, 6);
    25|  const coverageHubs = CATEGORIES.filter((category) =>
    26|    ["news", "national-team", "high-school", "club-basketball", "3x3", "player-spotlight"].includes(category.slug)
    27|  );
    28|  const leagueHubs = LEAGUE_HUBS.slice(0, 6);
    29|
    30|  // Opinion + Features combined module
    31|  const opinionPosts = getPostsByCategory("opinion").slice(0, 3);
    32|  const featurePosts = getPostsByCategory("features").slice(0, 3);
    33|
    34|  // Trending / recommended
    35|  // Filter out latest posts to reduce duplication on homepage
    36|  const latestSlugSet = new Set(latestPosts.map(p => p.slug));
    37|  const trendingPosts = getTrendingPosts(8)
    38|    .filter((p) => p.slug !== heroPost?.slug && !latestSlugSet.has(p.slug))
    39|    .slice(0, 4);
    40|
    41|  // Category spotlights (exclude opinion/features since they have dedicated modules)
    42|  const spotlightCategories = CATEGORIES.filter(
    43|    (c) => !["news", "opinion", "features"].includes(c.slug) && getPostsByCategory(c.slug).length > 0
    44|  ).slice(0, 3);
    45|
    46|  return (
    47|    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
    48|      {/* Hero */}
    49|      {heroPost && (
    50|        <section className="mb-10">
    51|          <PostCardFeatured post={heroPost} />
    52|        </section>
    53|      )}
    54|
    55|      {/* Latest Posts */}
    56|      <section className="mb-14">
    57|        <div className="flex items-center justify-between mb-6">
    58|          <h2 className="font-display text-xl font-bold text-text">
    59|            Latest
    60|          </h2>
    61|          <Link
    62|            href="/archive"
    63|            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
    64|          >
    65|            View All →
    66|          </Link>
    67|        </div>
    68|        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    69|          {latestPosts.map((post, i) => (
    70|            <PostCard key={post.slug} post={post} priority={i < 2} />
    71|          ))}
    72|        </div>
    73|      </section>
    74|
    75|      <section className="mb-14 rounded-2xl border border-border bg-surface/60 p-6 md:p-8">
    76|        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
    77|          <div>
    78|            <h2 className="font-display text-xl font-bold text-text">
    79|              Coverage Hubs
    80|            </h2>
    81|            <p className="mt-2 max-w-3xl text-sm text-text-muted">
    82|              Explore the biggest topics in Jamaican basketball, from FIBA competition and school leagues to club basketball, 3x3, and player development.
    83|            </p>
    84|          </div>
    85|          <Link
    86|            href="/archive"
    87|            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
    88|          >
    89|            Browse Archive →
    90|          </Link>
    91|        </div>
    92|        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    93|          {coverageHubs.map((category) => {
    94|            const count = getPostsByCategory(category.slug).length;
    95|            return (
    96|              <Link
    97|                key={category.slug}
    98|                href={category.slug === "news" ? "/news" : `/category/${category.slug}`}
    99|                className="rounded-xl border border-border bg-bg/40 p-5 transition-colors hover:border-accent/40 hover:bg-surface"
   100|              >
   101|                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
   102|                  {count} article{count === 1 ? "" : "s"}
   103|                </p>
   104|                <h3 className="mt-2 font-display text-lg font-bold text-text">
   105|                  {category.label}
   106|                </h3>
   107|                <p className="mt-2 text-sm leading-relaxed text-text-muted">
   108|                  {category.description}
   109|                </p>
   110|              </Link>
   111|            );
   112|          })}
   113|        </div>
   114|      </section>
   115|
   116|      <section className="mb-14 rounded-2xl border border-border bg-surface/60 p-6 md:p-8">
   117|        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
   118|          <div>
   119|            <h2 className="font-display text-xl font-bold text-text">
   120|              Leagues & Programs
   121|            </h2>
   122|            <p className="mt-2 max-w-3xl text-sm text-text-muted">
   123|              These hubs are built from the Jamaica Basketball datasheets so the site can track active leagues, school competitions, JABA programs, and academy pathways in one place.
   124|            </p>
   125|          </div>
   126|          <Link
   127|            href="/leagues"
   128|            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
   129|          >
   130|            View All Leagues →
   131|          </Link>
   132|        </div>
   133|        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
   134|          {leagueHubs.map((hub) => {
   135|            const relatedPosts = getPostsForLeagueHub(hub);
   136|            return (
   137|              <Link
   138|                key={hub.slug}
   139|                href={`/leagues/${hub.slug}`}
   140|                className="rounded-xl border border-border bg-bg/40 p-5 transition-colors hover:border-accent/40 hover:bg-surface"
   141|              >
   142|                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
   143|                  {hub.teamCount} tracked teams
   144|                </p>
   145|                <h3 className="mt-2 font-display text-lg font-bold text-text">
   146|                  {hub.shortLabel}
   147|                </h3>
   148|                <p className="mt-2 text-sm leading-relaxed text-text-muted">
   149|                  {hub.status}
   150|                </p>
   151|                <p className="mt-4 text-sm text-text-dim">
   152|                  {relatedPosts.length} related article{relatedPosts.length === 1 ? "" : "s"}
   153|                </p>
   154|              </Link>
   155|            );
   156|          })}
   157|        </div>
   158|      </section>
   159|
   160|      {/* Opinion & Features Module */}
   161|      {(opinionPosts.length > 0 || featurePosts.length > 0) && (
   162|        <section className="mb-14">
   163|          <div className="grid gap-8 lg:grid-cols-2">
   164|            {/* Opinion column */}
   165|            {opinionPosts.length > 0 && (
   166|              <div>
   167|                <div className="flex items-center justify-between mb-5">
   168|                  <h2 className="font-display text-xl font-bold text-text">
   169|                    Opinion
   170|                  </h2>
   171|                  <Link
   172|                    href="/opinion"
   173|                    className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
   174|                  >
   175|                    More →
   176|                  </Link>
   177|                </div>
   178|                <div className="space-y-4">
   179|                  {opinionPosts.map((post) => (
   180|                    <article key={post.slug} className="flex gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/30">
   181|                      <div className="min-w-0 flex-1">
   182|                        <Link href={`/posts/${post.slug}`}>
   183|                          <h3 className="font-display font-bold text-text transition-colors hover:text-accent line-clamp-2">
   184|                            {post.title}
   185|                          </h3>
   186|                        </Link>
   187|                        {post.dek && (
   188|                          <p className="mt-1 text-sm text-text-muted line-clamp-2">{post.dek}</p>
   189|                        )}
   190|                        <p className="mt-2 text-xs text-text-dim">{post.author}</p>
   191|                      </div>
   192|                    </article>
   193|                  ))}
   194|                </div>
   195|              </div>
   196|            )}
   197|
   198|            {/* Features column */}
   199|            {featurePosts.length > 0 && (
   200|              <div>
   201|                <div className="flex items-center justify-between mb-5">
   202|                  <h2 className="font-display text-xl font-bold text-text">
   203|                    Features
   204|                  </h2>
   205|                  <Link
   206|                    href="/features"
   207|                    className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
   208|                  >
   209|                    More →
   210|                  </Link>
   211|                </div>
   212|                <div className="space-y-4">
   213|                  {featurePosts.map((post) => (
   214|                    <article key={post.slug} className="flex gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/30">
   215|                      <div className="min-w-0 flex-1">
   216|                        <Link href={`/posts/${post.slug}`}>
   217|                          <h3 className="font-display font-bold text-text transition-colors hover:text-accent line-clamp-2">
   218|                            {post.title}
   219|                          </h3>
   220|                        </Link>
   221|                        {post.dek && (
   222|                          <p className="mt-1 text-sm text-text-muted line-clamp-2">{post.dek}</p>
   223|                        )}
   224|                        <p className="mt-2 text-xs text-text-dim">{post.author}</p>
   225|                      </div>
   226|                    </article>
   227|                  ))}
   228|                </div>
   229|              </div>
   230|            )}
   231|          </div>
   232|        </section>
   233|      )}
   234|
   235|      {/* Trending / Recommended */}
   236|      {trendingPosts.length > 0 && (
   237|        <section className="mb-14">
   238|          <h2 className="font-display text-xl font-bold text-text mb-6">
   239|            Trending
   240|          </h2>
   241|          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
   242|            {trendingPosts.map((post) => (
   243|              <PostCard key={post.slug} post={post} />
   244|            ))}
   245|          </div>
   246|        </section>
   247|      )}
   248|
   249|      {/* Sponsor Placeholder */}
   250|      <div className="mb-14">
   251|        <SponsorPlaceholder />
   252|      </div>
   253|
   254|      {/* Category Spotlights */}
   255|      {spotlightCategories.map((cat) => {
   256|        const catPosts = getPostsByCategory(cat.slug).slice(0, 3);
   257|        if (catPosts.length === 0) return null;
   258|        return (
   259|          <section key={cat.slug} className="mb-14">
   260|            <div className="flex items-center justify-between mb-6">
   261|              <h2 className="font-display text-xl font-bold text-text">
   262|                {cat.label}
   263|              </h2>
   264|              <Link
   265|                href={`/category/${cat.slug}`}
   266|                className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
   267|              >
   268|                More {cat.label} →
   269|              </Link>
   270|            </div>
   271|            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
   272|              {catPosts.map((post) => (
   273|                <PostCard key={post.slug} post={post} />
   274|              ))}
   275|            </div>
   276|          </section>
   277|        );
   278|      })}
   279|
   280|      {/* Partnership CTA */}
   281|      <section className="mb-14 rounded-3xl overflow-hidden relative">
   282|        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-surface to-bg z-0" />
   283|        <div className="relative z-10 px-8 py-12 md:px-12 md:py-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
   284|          <div className="max-w-2xl">
   285|            <h2 className="font-display text-3xl md:text-4xl font-black text-text leading-tight mb-4">
   286|              Partner with the Source of <span className="text-accent">Jamaica Basketball</span>
   287|            </h2>
   288|            <p className="text-lg text-text-muted leading-relaxed">
   289|              Reach the most engaged basketball audience in Jamaica. We offer premium sponsorship spots, event coverage, and brand integration across our platforms.
   290|            </p>
   291|          </div>
   292|          <Link
   293|            href="mailto:partner@jamaicabasketball.online"
   294|            className="inline-flex h-14 items-center justify-center rounded-full bg-accent px-10 text-base font-bold uppercase tracking-wider text-black transition-all hover:bg-accent-hover hover:scale-105 active:scale-95 shadow-xl shadow-accent/20"
   295|          >
   296|            Become a Partner
   297|          </Link>
   298|        </div>
   299|      </section>
   300|
   301|      {/* Social Follow CTA */}
   302|      <div className="mb-14">
   303|        <SocialCta />
   304|      </div>
   305|
   306|      {/* SEO text block */}
   307|      <section className="mt-10 mb-6 rounded-xl border border-border bg-surface/50 p-6 md:p-8">
   308|        <h2 className="font-display text-lg font-bold text-text mb-3">
   309|          Jamaica Basketball News, Features and Culture
   310|        </h2>
   311|        <p className="text-sm text-text-muted leading-relaxed max-w-3xl">
   312|          Jamaica Basketball is an independent publishing platform focused on the full basketball ecosystem in Jamaica. We cover
   313|          Jamaica basketball news, national team updates, schoolboy and schoolgirl competitions, club leagues, 3x3 events,
   314|          player spotlights, and the wider culture shaping the game across the island.
   315|        </p>
   316|        <p className="mt-3 text-sm text-text-muted leading-relaxed max-w-3xl">
   317|          Start with the <Link href="/news" className="text-accent hover:text-accent-hover">latest news</Link>, explore
   318|          our <Link href="/category/national-team" className="text-accent hover:text-accent-hover">national team coverage</Link>,
   319|          browse <Link href="/category/high-school" className="text-accent hover:text-accent-hover">high school basketball stories</Link>,
   320|          or dig into <Link href="/category/3x3" className="text-accent hover:text-accent-hover">3x3 basketball in Jamaica</Link>.
   321|        </p>
   322|      </section>
   323|    </div>
   324|  );
   325|}
   326|