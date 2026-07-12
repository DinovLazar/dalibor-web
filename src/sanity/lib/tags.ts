/**
 * Cache tags for the Sanity content fetches behind the blog + review surfaces
 * (Phase 2.14). The site statically renders every one of these surfaces, so a
 * publish in Sanity would otherwise never reach the live site. Each content
 * fetch below is tagged, and `POST /api/revalidate` — driven by a Sanity webhook
 * — busts the matching tag on publish/update/delete, so the affected pages
 * regenerate within a minute or two, no redeploy.
 *
 * Two granularities, so a change refreshes exactly the surfaces it touches:
 *  - Broad type tags (`post` / `review`) sit on the AGGREGATE fetches — the
 *    blog/reviews index lists and the Home grids — because their ordering and
 *    titles depend on the whole set, so any document of that type changing must
 *    refresh them.
 *  - Per-slug tags (`post:<slug>` / `review:<slug>`) sit on the SINGLE-document
 *    fetches, so only the one page that changed regenerates.
 *
 * This module is intentionally just strings + string builders: it is imported by
 * both the server components that tag their fetches and the revalidate route
 * that busts those tags, keeping the two ends in lockstep from one source.
 */

/** Every `post` aggregate fetch (blog index + Home "From the blog"). */
export const POST_TAG = "post";

/** Every `review` aggregate fetch (reviews index + Home "Latest reviews"). */
export const REVIEW_TAG = "review";

/** The single blog-post page's own fetch. */
export const postSlugTag = (slug: string): string => `${POST_TAG}:${slug}`;

/** The single review page's own fetch. */
export const reviewSlugTag = (slug: string): string => `${REVIEW_TAG}:${slug}`;
