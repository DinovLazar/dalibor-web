import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Cover } from "@/components/cover";
import { localizedValue, type AppLocale } from "@/sanity/lib/localize";
import type { REVIEW_BY_SLUG_QUERY_RESULT } from "@/sanity/sanity.types";
import { monogramOf } from "@/lib/strings";

/**
 * The §7.4 reviewed-book card for the single-review page. Renders the book's
 * cover, title (with an alternate-script subtitle so e.g. /mk also shows the
 * Latin title), author · year, publisher, and — when present — the review's
 * `source` (where it first appeared). Two-column mini-card on small/tablet,
 * stacked at `lg` where the parent makes it the sticky sidebar; the parent owns
 * placement and stickiness, this is just the card. Server component (async — it
 * resolves i18n with `getTranslations`).
 */
export async function ReviewBookAside({
  review,
  locale,
}: {
  review: NonNullable<REVIEW_BY_SLUG_QUERY_RESULT>;
  locale: string;
}) {
  const t = await getTranslations();

  const bookTitle = localizedValue(review.bookTitle, locale) ?? "";

  // Alternate-script subtitle: first title in en→sr→mk that exists and differs
  // from the shown one (so /mk surfaces the Latin form, and vice versa).
  const subtitle = (["en", "sr", "mk"] as AppLocale[])
    .map((l) => localizedValue(review.bookTitle, l))
    .find((v) => v && v !== bookTitle);

  const authorYear = [review.bookAuthor, review.publicationYear]
    .filter(Boolean)
    .join(" · ");

  const sourceName = review.source?.sourceName;
  const sourceUrl = review.source?.sourceUrl;

  // The schema has no reviewed-book purchase links — only `source` (where the
  // review first appeared). We render the real source data, never fabricated
  // "where to buy" links (the mockup's generic purchase links don't apply here).
  const sourceLink =
    sourceUrl || sourceName ? (
      <div className="mt-4 border-t border-border pt-4 lg:col-span-full">
        <p className="eyebrow text-eyebrow uppercase text-text-muted">
          {t("reviews.source")}
        </p>
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 text-meta font-medium text-primary-strong outline-none hover:text-primary-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {sourceName || sourceUrl}
            <ExternalLink className="size-4" strokeWidth={1.75} aria-hidden />
          </a>
        ) : (
          <p className="mt-1 text-meta text-text-muted">{sourceName}</p>
        )}
      </div>
    ) : null;

  return (
    <div className="grid grid-cols-[96px_1fr] gap-[18px] rounded-card border border-border bg-surface p-5 shadow-card sm:grid-cols-[120px_1fr] lg:block">
      <Cover
        image={review.coverImage}
        locale={locale}
        className="w-full max-w-[160px] lg:mb-4"
        sizes="(max-width: 1023px) 120px, 160px"
        pixelWidth={400}
        monogram={monogramOf(bookTitle)}
      />
      {/* Keep the text grouped in the small/tablet grid; unwrap at lg so it
          flows under the (now block) cover. */}
      <div className="lg:contents">
        <div>
          <p className="eyebrow text-eyebrow uppercase text-primary-strong">
            {t("reviews.reviewedBook")}
          </p>
          <h2 className="mt-1 font-display text-h3 text-text">{bookTitle}</h2>
          {subtitle ? (
            <p className="text-body italic text-text-muted">{subtitle}</p>
          ) : null}
          {authorYear ? (
            <p className="mt-2 text-meta font-medium text-text-muted">
              {authorYear}
            </p>
          ) : null}
          {review.publisher ? (
            <p className="text-meta text-text-muted">{review.publisher}</p>
          ) : null}
        </div>
        {sourceLink}
      </div>
    </div>
  );
}
