import type {NextRequest} from "next/server";

import {routing} from "@/i18n/routing";
import {searchReviews} from "@/lib/search/reviews-search";
import type {SearchResponse} from "@/lib/search/types";
import type {AppLocale} from "@/sanity/lib/localize";

/**
 * `POST /api/reviews/search` — the ONLY search endpoint the browser talks to
 * (Phase 1.09). It never exposes a provider key: the two-tier orchestrator runs
 * server-side and the route only returns the localized `{ mode, results }`. The
 * keyword fallback works with zero env keys, so this route always responds.
 *
 * The body is untrusted, so every field is coerced defensively and any internal
 * failure is swallowed into an empty keyword response — internals never leak.
 */
export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const empty: SearchResponse = {mode: "keyword", results: []};
    return Response.json(empty, {status: 400});
  }

  const raw = (body ?? {}) as Record<string, unknown>;

  const q = typeof raw.q === "string" ? raw.q : "";
  const locale: AppLocale =
    typeof raw.locale === "string" &&
    (routing.locales as readonly string[]).includes(raw.locale)
      ? (raw.locale as AppLocale)
      : routing.defaultLocale;
  const topic =
    typeof raw.topic === "string" && raw.topic.length > 0
      ? raw.topic
      : undefined;

  try {
    return Response.json(await searchReviews({q, locale, topic}));
  } catch {
    const empty: SearchResponse = {mode: "keyword", results: []};
    return Response.json(empty);
  }
}
