import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/utils";

import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Jamaica Basketball — News, Features & Analysis",
    template: "%s — Jamaica Basketball",
  },
  description: SITE.description,
  keywords: [
    "jamaica basketball",
    "jamaican basketball",
    "basketball jamaica",
    "jamaica basketball news",
    "jamaica national basketball team",
    "jamaica high school basketball",
    "jamaica 3x3 basketball",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: "Jamaica Basketball — News, Features & Analysis",
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jamaica Basketball — News, Features & Analysis",
    description: SITE.description,
    images: [SITE.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-JM" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Jamaica Basketball RSS Feed"
          href={`${SITE.url}/feed.xml`}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="min-h-screen flex flex-col bg-bg text-text antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BR1R18NB1V"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BR1R18NB1V');
          `}
        </Script>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
