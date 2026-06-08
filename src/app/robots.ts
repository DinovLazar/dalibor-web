import type { MetadataRoute } from "next";

import { siteUrl } from "@/sanity/env";

/**
 * robots.txt (Phase 1.12). Allow crawling everything, but keep the embedded
 * admin Studio (`/studio`) and the API routes (`/api`) out of the index. Point
 * crawlers at the sitemap and declare the canonical host.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/api"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
