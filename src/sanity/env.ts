/**
 * Sanity environment variables, read + validated once. These are all PUBLIC
 * values (no secret token): the website reads only published documents.
 *
 * - NEXT_PUBLIC_SANITY_PROJECT_ID — the project id from sanity.io/manage
 * - NEXT_PUBLIC_SANITY_DATASET    — "production" (public dataset)
 * - NEXT_PUBLIC_SANITY_API_VERSION — pinned API date (content-lake versioning)
 */

function assertValue<T>(value: T | undefined, errorMessage: string): T {
  if (value === undefined) {
    throw new Error(errorMessage);
  }
  return value;
}

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-06-06";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET",
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID",
);

/**
 * The site's public base URL (Phase 1.12). Used as `metadataBase` and as the
 * base for every absolute URL the SEO layer emits — canonical, hreflang, Open
 * Graph, the sitemap, and robots.
 *
 * OPTIONAL by design: the production domain is undecided until deploy (2.05), so
 * this falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is unset
 * rather than hard-failing. Every absolute URL therefore resolves now and flips
 * to the real domain with a single env change later. Any trailing slash is
 * stripped so callers can safely build `${siteUrl}${path}`.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");
