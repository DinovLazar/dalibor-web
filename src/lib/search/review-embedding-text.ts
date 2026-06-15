import {createHash} from "node:crypto";

import {localizedValue, type LocalizedField} from "@/sanity/lib/localize";

import {blocksToPlainText} from "./keyword";

/**
 * Build the single combined-language source text that gets embedded for a review,
 * plus its content hash (Phase 2.03). Extracted so the backfill script
 * (`scripts/embed-reviews.mts`) and the re-index route
 * (`/api/reviews/reindex`) embed **identical** text — if they drifted, a
 * re-index would store a vector the backfill never would, and the content hash
 * would stop being a reliable "unchanged?" check.
 *
 * No `server-only` guard: this is pure data-shaping (it reuses the 1.09
 * `blocksToPlainText` flattener + `localizedValue`), so the Node backfill script
 * can import it directly without tripping the server/client boundary.
 */

/**
 * The fields a review contributes to its embedding text. Both the search-source
 * query (`REVIEWS_SEARCH_QUERY`) and the single-review query
 * (`REVIEW_BY_SLUG_QUERY`) project these, so one builder serves both callers.
 * It is an intentional structural *subset* of those TypeGen'd result types — if
 * either query stops projecting one of these four fields, keep this in sync.
 */
export interface EmbeddableReview {
  reviewTitle?: LocalizedField<string>;
  bookTitle?: LocalizedField<string>;
  bookAuthor?: string | null;
  body?: LocalizedField<unknown>;
}

/** mk → en → sr, the project's canonical language order. */
const LANGUAGES = ["mk", "en", "sr"] as const;

/**
 * One vector row per review (decision #5): the multilingual model matches
 * cross-lingually from this single combined-language source. The title/book
 * fields are joined across all three languages and the body is flattened with
 * the SAME Portable-Text flattener the keyword path uses, so stored vectors and
 * query-time text are built consistently.
 */
export function buildReviewEmbeddingText(review: EmbeddableReview): string {
  return LANGUAGES.flatMap((lang) => [
    localizedValue(review.reviewTitle, lang),
    localizedValue(review.bookTitle, lang),
    review.bookAuthor,
    blocksToPlainText(localizedValue(review.body, lang)),
  ])
    .filter(Boolean)
    .join("\n");
}

/**
 * Stable SHA-256 of the embedding source text. Stored alongside the vector so a
 * re-index can skip re-embedding a review whose source text is unchanged.
 */
export function reviewEmbeddingHash(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}
