import "server-only";

import {client} from "@/sanity/lib/client";
import {REVIEWS_SEARCH_QUERY} from "@/sanity/lib/queries";
import {
  availableLanguages,
  localizedValue,
  resolveTopics,
  type AppLocale,
} from "@/sanity/lib/localize";
import type {REVIEWS_SEARCH_QUERY_RESULT} from "@/sanity/sanity.types";

import {blocksToPlainText, keywordSearch, type KeywordItem} from "./keyword";
import type {ReviewSummary, SearchRequest, SearchResponse} from "./types";

/**
 * The Reviews search orchestrator (Phase 1.09). Two-tier and honest about which
 * tier ran: when all three search env vars are present and the query is
 * non-empty it tries the semantic path (Voyage embedding → Supabase pgvector
 * RPC), and it falls back to the always-on keyword path on not-configured /
 * empty-query / any-error. One `REVIEWS_SEARCH_QUERY` fetch feeds both paths:
 * the keyword path matches against it directly, the semantic path hydrates its
 * matched slugs from it.
 */

type ReviewDoc = REVIEWS_SEARCH_QUERY_RESULT[number];

/** How many nearest neighbours to ask the vector RPC for. */
const SEMANTIC_MATCH_COUNT = 24;

/**
 * Semantic search runs ONLY when all three vars are present. Exported so the
 * dormant re-index route shares the exact same "is search configured?" rule.
 */
export function semanticConfigured(): boolean {
  return Boolean(
    process.env.VOYAGE_API_KEY &&
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** Project a Sanity review doc to the locale-resolved card summary. */
function toSummary(review: ReviewDoc, locale: AppLocale): ReviewSummary {
  return {
    slug: review.slug ?? "",
    title: localizedValue(review.reviewTitle, locale) ?? "",
    bookTitle: localizedValue(review.bookTitle, locale) ?? undefined,
    bookAuthor: review.bookAuthor ?? undefined,
    topics: resolveTopics(review.topics, locale),
    coverRef: review.coverImage?.asset?._ref,
    date: review.publishedAt ?? undefined,
    availableLanguages: availableLanguages(review.reviewTitle),
  };
}

/**
 * The semantic path. Returns `null` (not throw) on a not-actionable result so
 * the caller can fall through to keyword cleanly; a thrown error is also caught
 * upstream. Heavy deps are dynamically imported so the keyword path never pulls
 * in Voyage/Supabase. Topic-scoping is applied to the hydrated Sanity set
 * (topics live in Sanity, not the vector table), so we never chain `.eq()` onto
 * the RPC (decision #5).
 */
async function semanticSearch(
  q: string,
  scoped: ReviewDoc[],
  locale: AppLocale,
): Promise<ReviewSummary[] | null> {
  const {embedQuery} = await import("./embeddings");
  const {getSupabaseAdmin} = await import("./supabase");

  const queryEmbedding = await embedQuery(q);
  const supabase = getSupabaseAdmin();
  const {data, error} = await supabase.rpc("match_reviews", {
    query_embedding: queryEmbedding,
    match_count: SEMANTIC_MATCH_COUNT,
    match_threshold: 0,
  });
  if (error || !Array.isArray(data)) return null;

  // Hydrate the matched slugs from the (already topic-scoped) Sanity set,
  // walking the RPC rows so the similarity order is preserved with no re-sort.
  const bySlug = new Map<string, ReviewDoc>();
  for (const review of scoped) {
    if (review.slug) bySlug.set(review.slug, review);
  }
  return (data as {slug: string; similarity: number}[])
    .map((row) => bySlug.get(row.slug))
    .filter((review): review is ReviewDoc => review !== undefined)
    .map((review) => toSummary(review, locale));
}

/**
 * Run a Reviews search. Resolves to `{ mode, results }`, where `mode` honestly
 * reports whether semantic or the keyword fallback produced the results.
 */
export async function searchReviews({
  q,
  locale,
  topic,
}: SearchRequest): Promise<SearchResponse> {
  const reviews = await client.fetch(REVIEWS_SEARCH_QUERY);
  const scoped = topic
    ? reviews.filter((review) =>
        (review.topics ?? []).some((t) => t.slug === topic),
      )
    : reviews;

  const query = q.trim();

  if (query && semanticConfigured()) {
    try {
      const results = await semanticSearch(query, scoped, locale);
      if (results !== null) return {mode: "semantic", results};
      // Null → fall through to keyword (e.g. RPC error or empty store).
    } catch {
      // Any semantic failure falls through to the keyword path below.
    }
  }

  const items: KeywordItem[] = scoped.map((review) => {
    const summary = toSummary(review, locale);
    // Reuse the already-resolved summary fields; only the body needs flattening.
    const haystack = [
      summary.title,
      summary.bookTitle,
      summary.bookAuthor,
      ...summary.topics.map((topic) => topic.label),
      blocksToPlainText(localizedValue(review.body, locale)),
    ]
      .filter(Boolean)
      .join("\n");
    return {summary, haystack};
  });
  return {mode: "keyword", results: keywordSearch(query, items)};
}
