"use client";

import { useTranslations } from "next-intl";
import { BookOpen } from "lucide-react";

import { ReviewCard } from "@/components/reviews/review-card";
import type { ReviewSummary } from "@/lib/search/types";
import { availableInLabel } from "@/sanity/lib/localize";
import type { LocalizedImage } from "@/sanity/sanity.types";

/**
 * Search results (§6.9) — the client-side replacement for the server list while a
 * search is active. A header row names the query and offers a Clear affordance;
 * below it either the calm empty state (no matches) or a column of shared
 * {@link ReviewCard} rows reusing the exact same card as the SSR list. Each
 * `ReviewSummary` is already locale-resolved by the search API, so the card just
 * receives strings. Search results intentionally carry no excerpt (the contract
 * omits it), so the card simply renders without one.
 */
export function ReviewResults({
  results,
  locale,
  query,
  onClear,
}: {
  results: ReviewSummary[];
  locale: string;
  query: string;
  onClear: () => void;
}) {
  const t = useTranslations();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-meta text-text-muted">
          {t("reviews.resultsFor", { query })}
        </p>
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 text-meta font-medium text-primary-strong hover:underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {t("reviews.clearSearch")}
        </button>
      </div>

      {results.length === 0 ? (
        <div className="rounded-card border border-border bg-surface px-6 py-12 text-center">
          <BookOpen
            aria-hidden
            className="mx-auto size-10 text-text-muted"
            strokeWidth={1.75}
          />
          <h3 className="mt-4 font-display text-h4 text-text">
            {t("reviews.emptyTitle")}
          </h3>
          <p className="mt-2 text-body text-text-muted">
            {t("reviews.emptyBody")}
          </p>
          <button
            type="button"
            onClick={onClear}
            className="mt-4 text-meta font-medium text-primary-strong hover:underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {t("reviews.clearSearch")}
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {results.map((r) => {
            // The card's <Cover> only needs a usable asset reference; rebuild the
            // minimal LocalizedImage shape from the summary's flat coverRef.
            const coverImage: LocalizedImage | null = r.coverRef
              ? ({
                  _type: "localizedImage",
                  asset: { _type: "reference", _ref: r.coverRef },
                } as unknown as LocalizedImage)
              : null;
            const langsLabel = availableInLabel(r.availableLanguages, locale);
            const availableIn = langsLabel
              ? t("common.availableIn", { langs: langsLabel })
              : undefined;

            return (
              <li key={r.slug}>
                <ReviewCard
                  href={`/reviews/${r.slug}`}
                  coverImage={coverImage}
                  locale={locale}
                  title={r.title}
                  bookTitle={r.bookTitle}
                  bookAuthor={r.bookAuthor}
                  publishedAt={r.date}
                  topics={r.topics}
                  availableIn={availableIn}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
