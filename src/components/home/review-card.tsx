import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Cover } from "@/components/cover";
import {
  availableLanguages,
  contentLang,
  localizedValue,
} from "@/sanity/lib/localize";
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
 * note shows which languages exist (§6.13).
 *
 * Phase 3.01: the row no longer stacks below 420px — the stacked variant made a
 * single card 522px tall on a phone. It is a compact row at every width (96×144
 * cover, 16px padding, two-line clamps below `sm`), with the topic chips hidden
 * on a phone where there is no height budget for them.
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
  const lang = contentLang(review.reviewTitle, locale);

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
      className="group/card flex gap-[18px] card-surface p-5 outline-none transition-[transform,box-shadow] duration-200 max-sm:gap-3.5 max-sm:p-4 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <Cover
        image={review.coverImage}
        locale={locale}
        decorative
        className="w-[132px] max-sm:w-24"
        sizes="(max-width: 639px) 96px, 132px"
        pixelWidth={288}
        monogram={monogramOf(localizedValue(review.bookTitle, locale))}
      />
      <div className="flex min-w-0 flex-col gap-[7px] max-sm:gap-1">
        <h3
          lang={lang}
          className="font-display text-h4 text-text transition-colors max-sm:line-clamp-2 group-hover/card:text-primary-strong"
        >
          {title}
        </h3>
        {author || date ? (
          <p className="text-meta font-medium text-text-muted max-sm:line-clamp-1">
            {author}
            {author && date ? " · " : ""}
            {date ? (
              <time dateTime={review.publishedAt ?? undefined}>{date}</time>
            ) : null}
          </p>
        ) : null}
        {excerpt ? (
          <p lang={lang} className="line-clamp-2 text-body text-text-muted max-sm:text-meta">
            {excerpt}
          </p>
        ) : null}
        {topics.length ? (
          <ul className="mt-0.5 flex flex-wrap gap-2 max-sm:hidden">
            {topics.map((tp) => (
              <li
                key={tp.id}
                className="inline-flex h-7 items-center rounded-pill border border-primary px-3 text-chip text-primary-strong"
              >
                {tp.label}
              </li>
            ))}
          </ul>
        ) : null}
        {missing && langs.length ? (
          <p className="text-meta text-text-muted max-sm:line-clamp-1">
            {t("availableIn", {
              langs: langs.map((l) => l.toUpperCase()).join(" · "),
            })}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
