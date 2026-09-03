import { getTranslations } from "next-intl/server";
import { BookOpen } from "lucide-react";

import { ReviewCard } from "@/components/reviews/review-card";
import {
  availableInLabel,
  availableLanguages,
  contentLang,
  localizedValue,
  resolveTopics,
} from "@/sanity/lib/localize";
import type { REVIEWS_LIST_QUERY_RESULT } from "@/sanity/sanity.types";

/**
 * The server-rendered Reviews list (§7.3) — a single reading column of shared
 * {@link ReviewCard} rows, newest first. Every localized field is resolved here
 * (mk→en→sr) so the card stays presentational and identical to the client search
 * results. A review missing a translation in the active locale shows the
 * "available in: …" note (§6.13). When the list is empty (e.g. a topic with no
 * reviews) it renders a calm centered placeholder instead of an empty column.
 * Async server component (awaits translations for the availableIn note).
 */
export async function ReviewsList({
  reviews,
  locale,
}: {
  reviews: REVIEWS_LIST_QUERY_RESULT;
  locale: string;
}) {
  const t = await getTranslations();

  if (reviews.length === 0) {
    return (
      <div className="card-flat px-6 py-12 text-center">
        <BookOpen
          aria-hidden
          className="mx-auto size-10 text-text-muted"
          strokeWidth={1.75}
        />
        <p className="mt-4 text-body text-text-muted">{t("reviews.empty")}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((r) => {
        const title = localizedValue(r.reviewTitle, locale) ?? "";
        const bookTitle = localizedValue(r.bookTitle, locale);
        const bookAuthor = r.bookAuthor ?? undefined;
        const excerpt = localizedValue(r.excerpt, locale);
        const topics = resolveTopics(r.topics, locale);
        const langsLabel = availableInLabel(
          availableLanguages(r.reviewTitle),
          locale,
        );
        const availableIn = langsLabel
          ? t("common.availableIn", { langs: langsLabel })
          : undefined;

        return (
          <li key={r._id}>
            <ReviewCard
              href={`/reviews/${r.slug}`}
              coverImage={r.coverImage}
              locale={locale}
              title={title}
              bookTitle={bookTitle}
              bookAuthor={bookAuthor}
              publishedAt={r.publishedAt}
              excerpt={excerpt}
              topics={topics}
              availableIn={availableIn}
              contentLang={contentLang(r.reviewTitle, locale)}
            />
          </li>
        );
      })}
    </ul>
  );
}
