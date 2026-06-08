import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { client } from "@/sanity/lib/client";
import { siteUrl } from "@/sanity/env";
import { POST_SLUGS_QUERY, REVIEW_SLUGS_QUERY } from "@/sanity/lib/queries";

/**
 * Localized sitemap (Phase 1.12). Emits one `<url>` entry per (path × locale),
 * each carrying the full hreflang `languages` map (mk/en/sr + x-default → mk) so
 * crawlers see every translation of every page. Paths are locale-relative; the
 * absolute URL for a path+locale is `${siteUrl}/${loc}${path}` (home = `${siteUrl}/${loc}`),
 * never with a trailing slash. Dynamic review/blog slugs are fetched from Sanity
 * (falsy slugs filtered). No `lastModified`: we have no reliable per-doc
 * timestamp, and omitting it is correct.
 */

/** Build the absolute URL for a locale-relative `path` under a given locale. */
function urlFor(path: string, loc: string): string {
  return path === "" ? `${siteUrl}/${loc}` : `${siteUrl}/${loc}${path}`;
}

/** Three entries (one per locale) for a path, each with the full hreflang map. */
function entriesForPath(path: string): MetadataRoute.Sitemap {
  const languages = {
    mk: urlFor(path, "mk"),
    en: urlFor(path, "en"),
    sr: urlFor(path, "sr"),
    "x-default": urlFor(path, "mk"),
  };

  return routing.locales.map((loc) => ({
    url: urlFor(path, loc),
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/about",
    "/book",
    "/reviews",
    "/blog",
    "/contact",
    "/privacy",
  ];

  const [reviewSlugs, postSlugs] = await Promise.all([
    client.fetch(REVIEW_SLUGS_QUERY),
    client.fetch(POST_SLUGS_QUERY),
  ]);

  const reviewPaths = reviewSlugs
    .map(({ slug }) => slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => `/reviews/${slug}`);

  const blogPaths = postSlugs
    .map(({ slug }) => slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => `/blog/${slug}`);

  const allPaths = [...staticPaths, ...reviewPaths, ...blogPaths];

  return allPaths.flatMap(entriesForPath);
}
