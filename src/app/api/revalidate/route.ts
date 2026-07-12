import type {NextRequest} from "next/server";
import {revalidateTag} from "next/cache";

import {
  POST_TAG,
  REVIEW_TAG,
  postSlugTag,
  reviewSlugTag,
} from "@/sanity/lib/tags";

/**
 * `POST /api/revalidate` — the live-site refresh receiver (Phase 2.14).
 *
 * A Sanity webhook (project `ndqmaath`) calls this on every publish / update /
 * delete of a `post` or `review`. It busts the matching cache tag (see
 * `@/sanity/lib/tags`), so the statically-rendered blog and review surfaces —
 * the index lists, the single pages, and the Home grids — regenerate within a
 * minute or two, with no redeploy. Without this the site would never learn that
 * a post was published (every blog surface is generated at build time).
 *
 * Modelled on its sibling `POST /api/reviews/reindex`: the same shared
 * `x-webhook-secret` gate, the same 503-when-unconfigured / 401-when-wrong
 * semantics. It never revalidates unauthenticated, keeps the response body free
 * of internals, and ignores drafts defensively.
 *
 * The site is static-by-default and STAYS that way — this route only invalidates
 * cache entries, it does not make anything dynamic.
 */

/** The webhook projection agreed for this phase: `{_type, _id, "slug": slug.current}`. */
type WebhookPayload = {
  _type?: unknown;
  _id?: unknown;
  slug?: unknown;
};

/**
 * Immediate expiration. Sanity is an external system calling this Route Handler
 * and needs the data to expire NOW (not lazily on a later visit), so we pass the
 * `{expire: 0}` cache-life profile — the documented pattern for webhook-driven
 * revalidation in Next 16 (the bare single-arg `revalidateTag(tag)` is a type
 * error here).
 */
const EXPIRE_NOW = {expire: 0} as const;

export async function POST(request: NextRequest): Promise<Response> {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Revalidate route not configured.", {status: 503});
  }
  if (request.headers.get("x-webhook-secret") !== secret) {
    return new Response("Unauthorized.", {status: 401});
  }

  let payload: WebhookPayload;
  try {
    payload = (await request.json()) as WebhookPayload;
  } catch {
    return new Response("Invalid JSON body.", {status: 400});
  }

  const type = typeof payload._type === "string" ? payload._type : "";
  const id = typeof payload._id === "string" ? payload._id : "";
  const slug = typeof payload.slug === "string" ? payload.slug : "";

  // Defensive draft guard: the webhook filter (`!(_id in path("drafts.**"))`)
  // already excludes drafts, but never trust it — a `drafts.*` id must never
  // revalidate the published surfaces (the portal saves drafts constantly).
  if (id.startsWith("drafts.")) {
    return Response.json({revalidated: false, reason: "draft"});
  }

  // Map the changed document to the cache tags behind the surfaces it affects:
  // the broad type tag (index list + Home grid, whose ordering/titles depend on
  // the whole set) and the per-slug tag (that one document's page).
  const tags: string[] = [];
  if (type === "post") {
    tags.push(POST_TAG);
    if (slug) tags.push(postSlugTag(slug));
  } else if (type === "review") {
    tags.push(REVIEW_TAG);
    if (slug) tags.push(reviewSlugTag(slug));
  } else {
    return Response.json({revalidated: false, reason: "ignored-type"});
  }

  for (const tag of tags) {
    revalidateTag(tag, EXPIRE_NOW);
  }

  return Response.json({revalidated: true, tags});
}
