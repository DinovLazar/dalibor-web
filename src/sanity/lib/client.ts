import {createClient} from "next-sanity";

import {apiVersion, dataset, projectId} from "../env";

/**
 * Public read client used by the website (server components). It reads only
 * PUBLISHED documents and serves them from the CDN — no token is needed because
 * the `production` dataset is public. Drafts/editing happen in the Studio behind
 * a Sanity login and never reach this client (`perspective: "published"`).
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});

/**
 * Fresh (non-CDN) read client for the surfaces the revalidate webhook refreshes
 * (Phase 2.14): the blog + review index/single pages and the Home grids. Same
 * published-only read as `client`, but with `useCdn: false` so that when a cache
 * tag is busted the re-fetch pulls the LIVE truth immediately — bypassing the
 * API CDN, whose up-to-60s per-query lag otherwise makes revalidation
 * non-deterministic (a re-fetch could read stale data and cache a stale render,
 * e.g. a deleted post lingering on the index for a minute-plus).
 *
 * Normal traffic never pays for this: those fetches are cache-tagged (and the
 * lists `force-cache`d), so Next serves them from its Data Cache until a publish
 * busts the tag — only the post-publish re-fetch actually reaches Sanity.
 * `client` (useCdn: true) is left untouched for everything else, so the search +
 * reindex pipeline is byte-identical.
 */
export const clientFresh = client.withConfig({useCdn: false});
