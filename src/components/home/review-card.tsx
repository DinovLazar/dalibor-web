import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Cover } from "@/components/cover";
import { availableLanguages, localizedValue } from "@/sanity/lib/localize";
import type { AppLocale } from "@/sanity/lib/localize";
import type { HOME_REVIEWS_QUERY_RESULT } from "@/sanity/sanity.types";
import { formatMonthYear } from "@/lib/datetime";
import { monogramOf } from "@/lib/strings";

type ReviewItem = HOME_REVIEWS_QUERY_RESULT[number];

/**
 * Review card (§6.6) — the horizontal "library row": cover left, text right;
 * the whole card is one link to the canonical single-review URL
 * (`/[locale]/reviews/[slug]`, which 404s locally until 1.09). The cover is
 * decorative (alt="") because the title names the link. When the active locale's
 * translation is missing the content falls back (mk→en→sr) and an "available in"
 * note shows which languages exist (§6.13). Stacks below 420px (§6.6).
 */
export async function ReviewCard({
  review,
  locale,
}: {
  review: ReviewItem;
  locale: string;
}) {
  const t = await getTranslations("common");

  const title = localizedValue(review.reviewTitle, locale) ?? "";
  const langs = availableLanguages(review.reviewTitle);
  const missing = !langs.includes(locale as AppLocale);

  const author = review.bookAuthor?.trim() || undefined;
  const date = formatMonthYear(review.publishedAt, locale);
  const excerpt = localizedValue(review.excerpt, locale);

  const topics = (review.topics ?? [])
    .map((tp) => ({ id: tp._id, label: localizedValue(tp.title, locale) }))
    .filter((tp): tp is { id: string; label: string } => Boolean(tp.label))
    .slice(0, 3);

  const href = review.slug ? `/reviews/${review.slug}` : "/reviews";

  return (
    <Link
      href={href}
      className="group/card flex gap-[18px] rounded-card border border-border bg-surface p-5 shadow-card outline-none transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus max-xs:flex-col"
    >
      <Cover
        image={review.coverImage}
        locale={locale}
        decorative
        className="w-[132px] max-sm:w-[104px] max-xs:w-full max-xs:max-w-[140px]"
        sizes="(max-width: 419px) 140px, (max-width: 639px) 104px, 132px"
        pixelWidth={400}
        monogram={monogramOf(localizedValue(review.bookTitle, locale))}
      />
      <div className="flex min-w-0 flex-col gap-[7px]">
        <h3 className="font-display text-h4 text-text transition-colors group-hover/card:text-primary-strong">
          {title}
        </h3>
        {author || date ? (
          <p className="text-meta font-medium text-text-muted">
            {author}
            {author && date ? " · " : ""}
            {date ? (
              <time dateTime={review.publishedAt ?? undefined}>{date}</time>
            ) : null}
          </p>
        ) : null}
        {excerpt ? (
          <p className="line-clamp-2 text-body text-text-muted">{excerpt}</p>
        ) : null}
        {topics.length ? (
          <ul className="mt-0.5 flex flex-wrap gap-2">
            {topics.map((tp) => (
              <li
                key={tp.id}
                className="inline-flex h-7 items-center rounded-pill border border-primary px-3 text-eyebrow font-semibold text-primary-strong"
              >
                {tp.label}
              </li>
            ))}
          </ul>
        ) : null}
        {missing && langs.length ? (
          <p className="text-meta text-text-muted">
            {t("availableIn", {
              langs: langs.map((l) => l.toUpperCase()).join(" · "),
            })}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
