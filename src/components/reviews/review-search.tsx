"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Search, X } from "lucide-react";

import { ReviewResults } from "@/components/reviews/review-results";
import type { ReviewSummary, SearchResponse } from "@/lib/search/types";

/**
 * Progressive-enhancement search box (§6.9) — wraps the server-rendered Reviews
 * list (`children`) and swaps it for client search results once the reader runs
 * a query. With JS off the form does nothing and the SSR list (already filtered
 * by `?topic=`) stays visible; with JS on, submitting POSTs to
 * `/api/reviews/search` (which scopes by the same `topic`) and renders the
 * locale-resolved results in place. No layout shift: the leading search glyph and
 * the trailing spinner/clear slot are fixed-width. Network errors fall through to
 * the empty state — the API already owns the keyword fallback. Client component.
 *
 * **Phase 3.01 — search comes first.** The topic filter used to sit above this
 * box and, wrapped, was 312px tall on a phone, so the search input started 615px
 * down the page and the first review at 737px. The order is now
 * H1 → lede → search → filter → results: the filter is passed in as `filter` and
 * rendered between the input and the results, rather than being a sibling the
 * page places above. It stays a Server Component; only its scroll-into-view
 * wrapper is client code, and passing it through as a node keeps it that way.
 *
 * The placeholder is the SHORT string (`common.searchPlaceholderShort`): the full
 * one is 246px wide in Macedonian and was clipped inside the 192px of usable
 * input width at 320px. The full instruction survives verbatim as the input's
 * accessible name (`<label class="sr-only">`) and as the helper text below, so
 * nothing is lost — only the visible hint is shorter.
 */
export function ReviewSearch({
  locale,
  topic,
  className,
  filter,
  children,
}: {
  locale: string;
  topic: string | null;
  className?: string;
  /** The topic filter, rendered between the input and the results (§6.8). */
  filter?: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReviewSummary[] | null>(null);
  const [submitted, setSubmitted] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      setResults(null);
      setSubmitted("");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reviews/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, locale, topic: topic ?? undefined }),
      });
      const data: SearchResponse = await res.json();
      setResults(data.results);
      setSubmitted(q);
    } catch {
      // The API owns the keyword fallback; a network error just shows the empty state.
      setResults([]);
      setSubmitted(q);
    } finally {
      setLoading(false);
    }
  }

  function onClear() {
    setQuery("");
    setResults(null);
    setSubmitted("");
  }

  return (
    <div className={className}>
      <form role="search" onSubmit={onSubmit} className="relative">
        <label htmlFor="reviews-search" className="sr-only">
          {t("common.searchPlaceholder")}
        </label>
        <input
          id="reviews-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("common.searchPlaceholderShort")}
          className="h-12 w-full rounded-input border border-border-strong bg-bg pl-11 pr-11 text-[1.0625rem] text-text placeholder:text-text-muted outline-none transition-shadow focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgb(168_116_55_/_0.18)]"
        />
        <button
          type="submit"
          aria-label={t("reviews.searchSubmit")}
          className="absolute inset-y-0 left-0 grid w-11 place-items-center rounded-l-input text-text-muted outline-none transition-colors hover:text-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
        >
          <Search className="size-5" strokeWidth={1.75} />
        </button>
        <div className="absolute inset-y-0 right-0 grid w-11 place-items-center">
          {loading ? (
            <Loader2
              className="size-[18px] animate-spin text-primary-strong"
              strokeWidth={1.75}
              aria-hidden
            />
          ) : results !== null ? (
            <button
              type="button"
              onClick={onClear}
              aria-label={t("reviews.clearSearch")}
              className="grid size-11 place-items-center text-text-muted outline-none hover:text-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
            >
              <X className="size-[18px]" strokeWidth={1.75} />
            </button>
          ) : null}
        </div>
      </form>

      {results === null ? (
        <p className="mt-2 text-caption text-text-muted">
          {t("reviews.searchHelp")}
        </p>
      ) : null}

      {/* The topic filter narrows the SSR list, so it belongs with the results,
          not with the search input — and it is hidden while client results are
          showing, because those are already scoped by the same active topic and
          a filter row that cannot be seen to apply is a lie. */}
      {filter && results === null ? <div className="mt-5">{filter}</div> : null}

      <div className="mt-6">
        {results !== null ? (
          <ReviewResults
            results={results}
            locale={locale}
            query={submitted}
            onClear={onClear}
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
