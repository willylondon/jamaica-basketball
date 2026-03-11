import { defineConfig, defineCollection, s } from "velite";

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.mdx",
  schema: s.object({
    title: s.string(),
    slug: s.slug("posts"),
    dek: s.string().optional().default(""),
    excerpt: s.string().optional().default(""),
    description: s.string().optional().default(""),
    date: s.isodate(),
    updated: s.isodate().optional(),
    author: s.string().default("Jamaica Basketball"),
    category: s.enum([
      "news",
      "opinion",
      "features",
      "national-team",
      "high-school",
      "club-basketball",
      "3x3",
      "player-spotlight",
      "coach-spotlight",
      "events",
    ]),
    tags: s.array(s.string()).default([]),
    image: s.string(),
    imageAlt: s.string(),
    draft: s.boolean().default(false),
    featured: s.boolean().default(false),
    breaking: s.boolean().default(false),
    seoTitle: s.string().optional(),
    seoDescription: s.string().optional(),
    canonicalUrl: s.string().optional(),
    ogImage: s.string().optional(),
    keywords: s.array(s.string()).default([]),
    body: s.mdx(),
    metadata: s.metadata(),
  }),
});

const pages = defineCollection({
  name: "Page",
  pattern: "pages/**/*.mdx",
  schema: s.object({
    title: s.string(),
    slug: s.slug("pages"),
    description: s.string().optional().default(""),
    seoTitle: s.string().optional(),
    seoDescription: s.string().optional(),
    image: s.string().optional(),
    body: s.mdx(),
  }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { posts, pages },
});
