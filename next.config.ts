import type { NextConfig } from "next";

// Third parties the public site loads: Google Analytics (gtag) and Google Fonts.
// Cover images, including Wikimedia ones, are proxied through /_next/image.
// Next.js hydration uses inline scripts, so script-src needs 'unsafe-inline'
// until the site moves to nonce-based CSP.
const siteCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const baseHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: baseHeaders },
      // The CMS at /admin loads Sveltia from unpkg and talks to GitHub, so it is
      // left out of the site CSP rather than given a policy it would break under.
      {
        source: "/((?!admin(?:/|$)).*)",
        headers: [{ key: "Content-Security-Policy", value: siteCsp }],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/wikipedia/commons/**',
      },
    ],
    minimumCacheTTL: 60,
  },
  // Enable modern optimization features
  experimental: {
    optimizePackageImports: ["lucide-react"],
  }
};

export default nextConfig;
