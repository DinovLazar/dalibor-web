import { notFound } from "next/navigation";

/**
 * Catch-all 404 bridge.
 *
 * `not-found.tsx` only renders for `notFound()` thrown inside a *matched* route
 * segment. A URL that matches no route at all (e.g. `/en/does-not-exist`) never
 * enters a segment, so Next falls back to its own unstyled "404: This page could
 * not be found." — that fallback is what visitors were actually seeing.
 *
 * The documented fix is a root `app/not-found.tsx`, which this app cannot have:
 * it has no top-level root layout (the two roots are `[locale]/layout.tsx` and
 * `studio/layout.tsx`), so there is no layout for a root not-found to compose
 * with. Next's own docs call out both of our conditions — multiple root layouts,
 * and a root layout behind a top-level dynamic segment — as the case where a
 * plain root `not-found` cannot work.
 *
 * This catch-all is the stable, non-experimental answer: it matches anything
 * under `[locale]` that no more specific route claimed and immediately throws
 * into the segment's `not-found.tsx`, so unmatched URLs get the real localized
 * 404 with the full Style A chrome and a correct HTTP 404. Next always prefers a
 * more specific route over a catch-all, so no existing page is shadowed.
 *
 * Because the proxy redirects every non-prefixed path to a locale
 * (`/foo` → `/en/foo`), this covers all human-facing 404s. Requests that bypass
 * the proxy matcher entirely — paths containing a dot, such as `/wp-login.php`
 * from bots — still land on Next's built-in fallback; catching those too would
 * require the experimental `globalNotFound` flag.
 */
export default function CatchAllNotFound(): never {
  notFound();
}
