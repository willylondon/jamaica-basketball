import { SITE } from "@/lib/utils";

interface JsonLdProps {
    data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export function OrganizationJsonLd() {
    return (
        <JsonLd
            data={{
                "@context": "https://schema.org",
                "@type": "Organization",
                name: SITE.name,
                url: SITE.url,
                logo: `${SITE.url}/logo.jpg`,
                sameAs: [SITE.socials.instagram, SITE.socials.tiktok],
            }}
        />
    );
}

export function WebSiteJsonLd() {
    return (
        <JsonLd
            data={{
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE.name,
                url: SITE.url,
                potentialAction: {
                    "@type": "SearchAction",
                    target: `${SITE.url}/search?q={search_term_string}`,
                    "query-input": "required name=search_term_string",
                },
            }}
        />
    );
}

export function ArticleJsonLd({
    title,
    description,
    url,
    image,
    datePublished,
    dateModified,
    author,
}: {
    title: string;
    description: string;
    url: string;
    image: string;
    datePublished: string;
    dateModified?: string;
    author: string;
}) {
    return (
        <JsonLd
            data={{
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                headline: title,
                description,
                url,
                image: image.startsWith("http") ? image : `${SITE.url}${image}`,
                datePublished,
                dateModified: dateModified || datePublished,
                author: {
                    "@type": "Person",
                    name: author,
                },
                publisher: {
                    "@type": "Organization",
                    name: SITE.name,
                    url: SITE.url,
                    logo: {
                        "@type": "ImageObject",
                        url: `${SITE.url}/logo.jpg`,
                    },
                },
            }}
        />
    );
}

export function BreadcrumbJsonLd({
    items,
}: {
    items: { name: string; url: string }[];
}) {
    return (
        <JsonLd
            data={{
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: items.map((item, i) => ({
                    "@type": "ListItem",
                    position: i + 1,
                    name: item.name,
                    item: item.url,
                })),
            }}
        />
    );
}
