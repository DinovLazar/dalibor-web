import type { AppLocale } from "@/sanity/lib/localize";

/**
 * The Reviews topic-search contract (Phase 1.09). The browser only ever talks to
 * our own `POST /api/reviews/search`; the request/response below are the single
 * shape the search backend and the Reviews UI both build against. Every
 * `ReviewSummary` is already resolved to the requested locale (mk→en→sr
 * fallback), so the client renders cards without re-localizing.
 */

export interface ReviewSummary {
  slug: string;
  /** Localized review title. */
  title: string;
  /** Localized reviewed-book title (for the no-cover monogram). */
  bookTitle?: string;
  bookAuthor?: string;
  /** Localized topic labels + their slugs. */
  topics: { slug: string; label: string }[];
  /** The cover image asset ref (`coverImage.asset._ref`), if any. */
  coverRef?: string;
  /** `publishedAt` as an ISO string, if any. */
  date?: string;
  /** Which of mk/en/sr this review actually has a title in (the "available in" note). */
  availableLanguages: AppLocale[];
}

export interface SearchRequest {
  q: string;
  locale: AppLocale;
  /** Optional topic slug to narrow results (mirrors the SSR `?topic=` filter). */
  topic?: string;
}

/** Which path actually ran — honest about semantic vs the keyword fallback. */
export type SearchMode = "semantic" | "keyword";

export interface SearchResponse {
  mode: SearchMode;
  results: ReviewSummary[];
}
