import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { client } from "@/sanity/lib/client";
import { siteUrl } from "@/sanity/env";
import { POST_SLUGS_QUERY, REVIEW_SLUGS_QUERY } from "@/sanity/lib/queries";

/**
 * Localized sitemap (Phase 1.12). Emits one `<url>` entry per (path × locale),
 * each carrying the full hreflang `languages` map (mk/en/sr + x-default → the
 * default locale, `en`) so
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
function entriesForPath(
  path: string,
  lastModified?: Date,
): MetadataRoute.Sitemap {
  const languages = {
    mk: urlFor(path, "mk"),
    en: urlFor(path, "en"),
    sr: urlFor(path, "sr"),
    "x-default": urlFor(path, routing.defaultLocale),
  };

  return routing.locales.map((loc) => ({
    url: urlFor(path, loc),
    alternates: { languages },
    ...(lastModified ? { lastModified } : {}),
  }));
}

/**
 * Per-document `_updatedAt`, keyed by slug, for review + post sitemap entries.
 *
 * Deliberately a raw GROQ string rather than a `defineQuery` in
 * `sanity/lib/queries.ts`: adding a field to the typed slug queries would make
 * the checked-in TypeGen output stale until someone re-runs `npm run typegen`,
 * and a sitemap timestamp isn't worth coupling the build to that step. The
 * response is narrow and explicitly typed here instead.
 */
async function lastModifiedBySlug(
  type: "review" | "post",
): Promise<Map<string, Date>> {
  const rows = await client.fetch<{ slug: string | null; _updatedAt: string }[]>(
    `*[_type == $type && defined(slug.current)]{ "slug": slug.current, _updatedAt }`,
    { type },
  );

  const map = new Map<string, Date>();
  for (const row of rows) {
    if (!row.slug) continue;
    const date = new Date(row._updatedAt);
    // Guard against an unparseable timestamp poisoning the sitemap.
    if (!Number.isNaN(date.getTime())) map.set(row.slug, date);
  }
  return map;
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

  const [reviewSlugs, postSlugs, reviewDates, postDates] = await Promise.all([
    client.fetch(REVIEW_SLUGS_QUERY),
    client.fetch(POST_SLUGS_QUERY),
    lastModifiedBySlug("review"),
    lastModifiedBySlug("post"),
  ]);

  const reviewSlugList = reviewSlugs
    .map(({ slug }) => slug)
    .filter((slug): slug is string => Boolean(slug));

  const blogSlugList = postSlugs
    .map(({ slug }) => slug)
    .filter((slug): slug is string => Boolean(slug));

  // Static pages carry no timestamp (they have no single source document), but
  // content pages do: `lastModified` is a recrawl hint, so a fresh review or post
  // gets picked up sooner than it would on crawl scheduling alone.
  const staticEntries = staticPaths.flatMap((path) => entriesForPath(path));

  const reviewEntries = reviewSlugList.flatMap((slug) =>
    entriesForPath(`/reviews/${slug}`, reviewDates.get(slug)),
  );

  const blogEntries = blogSlugList.flatMap((slug) =>
    entriesForPath(`/blog/${slug}`, postDates.get(slug)),
  );

  return [...staticEntries, ...reviewEntries, ...blogEntries];
}
