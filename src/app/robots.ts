import type { MetadataRoute } from "next";

import { previewNoindex, siteUrl } from "@/sanity/env";

/**
 * robots.txt (Phase 1.12; preview gate 2.05). Normally: allow crawling
 * everything but keep the embedded admin Studio (`/studio`) and the API routes
 * (`/api`) out of the index, point crawlers at the sitemap, and declare the
 * canonical host.
 *
 * When `PREVIEW_NOINDEX` is on (the noindexed validation deploy), this flips to
 * a blanket `Disallow: /` — paired with the site-wide `noindex` meta — so the
 * preview can never be crawled or indexed. No sitemap is advertised in that mode.
 */
export default function robots(): MetadataRoute.Robots {
  if (previewNoindex) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/api"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
