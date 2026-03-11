import type { MetadataRoute } from "next";
import { getPublishedPosts, CATEGORIES } from "@/lib/content";

const BASE_URL = "https://jamaicabasketball.online";

export default function sitemap(): MetadataRoute.Sitemap {
    const posts = getPublishedPosts();

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${BASE_URL}/posts/${post.slug}`,
        lastModified: new Date(post.updated || post.date),
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
        url: `${BASE_URL}/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.7,
    }));

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/news`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/opinion`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/features`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/archive`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ];

    return [...staticPages, ...categoryEntries, ...postEntries];
}
