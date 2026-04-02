import { type ClassValue, clsx } from "clsx";

export { clsx };

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/** Format date to readable string */
export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/** Compute reading time from text */
export function getReadingTime(text: string): string {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
}

/** Truncate text to a max length */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

/** Capitalize first letter */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Convert text into a route-safe slug */
export function slugify(value: string): string {
    return value
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/** Site metadata constants */
export const SITE = {
    name: "Jamaica Basketball",
    description:
        "The definitive source for basketball news, features, and analysis in Jamaica.",
    url: "https://jamaicabasketball.online",
    ogImage: "/og-default.jpg",
    contactEmail: "hello@jamaicabasketball.online",
    socials: {
        instagram: "https://www.instagram.com/jamaicabasketball?igsh=c2x5MGdmbXYxNjFk",
        tiktok: "https://tiktok.com/@jamaicabasketall",
        youtube: "",
        x: "",
    },
} as const;
