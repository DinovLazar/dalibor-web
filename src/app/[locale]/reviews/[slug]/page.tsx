import { cache } from "react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { BackToTop } from "@/components/layout/back-to-top";
import { Section } from "@/components/layout/section";
import { buttonVariants } from "@/components/ui/button";
import { PortableText } from "@/components/portable-text";
import { JsonLd } from "@/components/seo/json-ld";
import { ReviewBookAside } from "@/components/reviews/review-book-aside";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, reviewJsonLd } from "@/lib/seo/jsonld";
import { client, clientFresh } from "@/sanity/lib/client";
import { siteUrl } from "@/sanity/env";
import { urlForImage } from "@/sanity/lib/image";
import {
  availableInLabel,
  availableLanguages,
  contentLang,
  localizedValue,
  resolveTopics,
  resolvedLanguage,
} from "@/sanity/lib/localize";
import { REVIEW_BY_SLUG_QUERY, REVIEW_SLUGS_QUERY } from "@/sanity/lib/queries";
import { reviewSlugTag } from "@/sanity/lib/tags";
import { formatFullDate } from "@/lib/datetime";
import { cn } from "@/lib/utils";

/** One review by slug, memoized per request so generateMetadata + the page
 *  component share a single fetch instead of hitting Sanity twice. */
const getReview = cache((slug: string) =>
  clientFresh.fetch(
    REVIEW_BY_SLUG_QUERY,
    { slug },
    { cache: "force-cache", next: { tags: [reviewSlugTag(slug)] } },
  ),
);

/**
 * The real Style A single-review page (§7.4). First real consumer of the shared
 * Portable Text renderer with the §3.6 drop cap (opt-in via `dropCap`). Localizes
 * mk→en→sr via `localizedValue`, with the §6.x "available in" note when the
 * current locale's translation is missing. The reading frame is a ~1008px column:
 * a head + body constrained to the reading measure beside an 18rem sticky aside
 * (the §7.4 reviewed-book card). Statically rendered via `generateStaticParams`;
 * an unknown slug → `notFound()`. Server component.
 */
export async function generateStaticParams() {
  const slugs = await client.fetch(REVIEW_SLUGS_QUERY);
  return routing.locales.flatMap((locale) =>
    slugs
      .filter((s) => s.slug)
      .map((s) => ({ locale, slug: s.slug as string })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const review = await getReview(slug);
  if (!review) return {};

  return buildPageMetadata({
    locale,
    page: "reviews",
    path: `/reviews/${slug}`,
    title: localizedValue(review.reviewTitle, locale) ?? "",
    description: localizedValue(review.excerpt, locale) ?? undefined,
    ogType: "article",
  });
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations();
  const review = await getReview(slug);
  if (!review) {
    notFound();
  }

  const title = localizedValue(review.reviewTitle, locale) ?? "";
  const langsLabel = availableInLabel(
    availableLanguages(review.reviewTitle),
    locale,
  );
  const date = formatFullDate(review.publishedAt, locale);
  const body = localizedValue(review.body, locale);
  const summary = localizedValue(review.excerpt, locale);
  const topics = resolveTopics(review.topics, locale);
  // Read the review's source the same way the aside does, for the "read at
  // source" fallback shown when a review has no body yet (§7.4 empty state).
  const sourceName = review.source?.sourceName;
  const sourceUrl = review.source?.sourceUrl;

  // Structured data: Review (the review, with the reviewed book as `itemReviewed`)
  // + BreadcrumbList (Home › Reviews › title). `Review` replaces the earlier
  // generic `Article`: it states that this text assesses a specific book, which
  // is both more accurate and what lets answer engines connect Dalibor to the
  // titles he has written about.
  const canonical = `${siteUrl}/${locale}/reviews/${slug}`;
  const coverImage = review.coverImage?.asset
    ? urlForImage(review.coverImage).width(1200).url()
    : undefined;
  const reviewedBookTitle = localizedValue(review.bookTitle, locale) ?? "";
  const reviewSchema = reviewJsonLd({
    headline: title,
    url: canonical,
    datePublished: review.publishedAt ?? undefined,
    dateModified: review._updatedAt ?? undefined,
    inLanguage: resolvedLanguage(review.body, locale) ?? locale,
    image: coverImage,
    description: summary ?? undefined,
    book: {
      // Fall back to the review's own title if the book title is missing, so
      // `itemReviewed` is never emitted nameless.
      name: reviewedBookTitle || title,
      author: review.bookAuthor ?? undefined,
      publisher: review.publisher ?? undefined,
      datePublished:
        review.publicationYear != null
          ? String(review.publicationYear)
          : undefined,
      image: coverImage,
    },
  });
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: t("nav.home"), url: `${siteUrl}/${locale}` },
    { name: t("nav.reviews"), url: `${siteUrl}/${locale}/reviews` },
    { name: title, url: canonical },
  ]);

  return (
    <Section>
      <JsonLd data={[reviewSchema, breadcrumbSchema]} />
      <BackToTop />
      <div className="mx-auto w-full max-w-[63rem] page-gutter">
        {/* Head — back link, breadcrumb, title, §6.16 double rule, date / note. */}
        <div className="reveal max-w-prose">
          <Link
            href="/reviews"
            className="tap-target inline-flex min-h-[24px] items-center gap-1.5 text-meta font-medium text-primary-strong outline-none hover:text-primary-hover hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <ArrowLeft className="size-[18px]" strokeWidth={1.75} aria-hidden />{" "}
            {t("reviews.backToReviews")}
          </Link>

          <nav
            aria-label={t("reviews.breadcrumbLabel")}
            className="mt-3.5 hidden text-meta font-medium sm:block"
          >
            <Link href="/" className="text-primary-strong hover:underline">
              {t("nav.home")}
            </Link>
            <span className="px-2 text-border-strong" aria-hidden>
              /
            </span>
            <Link href="/reviews" className="text-primary-strong hover:underline">
              {t("nav.reviews")}
            </Link>
            <span className="px-2 text-border-strong" aria-hidden>
              /
            </span>
            <span aria-current="page" className="text-text-muted">
              {title}
            </span>
          </nav>

          <h1
            lang={contentLang(review.reviewTitle, locale)}
            className="mt-4 font-display text-h1 text-text"
          >
            {title}
          </h1>

          {/* Title-page double rule (§6.16): 2px caramel + 1px hairline. */}
          <div
            aria-hidden
            className="relative my-[18px] h-0 border-t-2 border-primary"
          >
            <span className="absolute inset-x-0 top-[3px] block border-t border-border" />
          </div>

          <p className="text-meta text-text-muted">
            {date ? (
              <time dateTime={review.publishedAt ?? undefined}>{date}</time>
            ) : null}
            {langsLabel ? (
              <span>
                {date ? " · " : ""}
                {t("common.availableIn", { langs: langsLabel })}
              </span>
            ) : null}
          </p>
        </div>

        {/* Body + aside — prose at the reading measure, 18rem aside at lg. */}
        <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,42rem)_18rem] lg:items-start">
          <div className="reveal reveal-2 min-w-0">
            {body ? (
              <PortableText
                value={body}
                dropCap
                lang={contentLang(review.body, locale)}
              />
            ) : summary ? (
              /* No full body, but Dalibor has written a short summary: render it
                 as the reading content, with the "first published on …"
                 attribution beneath. `excerpt` is plain text — split blank lines
                 into paragraphs. */
              <div className="max-w-prose">
                {summary
                  .split(/\r?\n\s*\r?\n/)
                  .map((para) => para.trim())
                  .filter(Boolean)
                  .map((para, i) => (
                    <p
                      key={i}
                      lang={contentLang(review.excerpt, locale)}
                      className={`text-body text-text${i > 0 ? " mt-4" : ""}`}
                    >
                      {para}
                    </p>
                  ))}

                {sourceName ? (
                  <p className="mt-6 text-meta text-text-muted">
                    {t("reviews.fullTextAtSource", { source: sourceName })}
                    {sourceUrl ? (
                      <>
                        {" "}
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-medium text-primary-strong outline-none hover:text-primary-hover hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                        >
                          {t("reviews.readFullReview", { source: sourceName })}
                          <ExternalLink
                            className="size-4"
                            strokeWidth={1.75}
                            aria-hidden
                          />
                        </a>
                      </>
                    ) : null}
                  </p>
                ) : null}
              </div>
            ) : (
              /* No body pasted yet (§7.4 empty state): a quiet "read at source"
                 note in place of the reading column, never fabricated prose. */
              <div className="max-w-prose card-flat p-6">
                {sourceName ? (
                  <>
                    <p className="text-body text-text-muted">
                      {t("reviews.fullTextAtSource", { source: sourceName })}
                    </p>
                    {sourceUrl ? (
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tap-target mt-3 inline-flex items-center gap-1.5 text-body font-medium text-primary-strong outline-none hover:text-primary-hover hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                      >
                        {t("reviews.readFullReview", { source: sourceName })}
                        <ExternalLink
                          className="size-4"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </a>
                    ) : null}
                  </>
                ) : (
                  <p className="text-body text-text-muted">
                    {t("reviews.fullTextPending")}
                  </p>
                )}
              </div>
            )}

            {topics.length ? (
              <ul className="mt-8 flex flex-wrap gap-2 max-sm:gap-y-3">
                {topics.map((tp) => (
                  <li key={tp.slug}>
                    <Link
                      href={`/reviews?topic=${encodeURIComponent(tp.slug)}`}
                      className="tap-target inline-flex h-7 items-center rounded-pill border border-primary px-3 text-chip text-primary-strong outline-none transition-colors max-sm:h-9 hover:bg-[rgb(168_116_55_/_0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    >
                      {tp.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            <hr className="mt-6 border-t border-border" />

            <Link
              href="/reviews"
              className={cn(buttonVariants({ variant: "outline" }), "mt-6 gap-1.5 max-sm:h-12 max-sm:w-full")}
            >
              <ArrowLeft className="size-[18px]" strokeWidth={1.75} aria-hidden />{" "}
              {t("reviews.backToReviews")}
            </Link>
          </div>

          <aside
            className="reveal reveal-2 order-first lg:order-none lg:sticky lg:top-[88px]"
            aria-label={t("reviews.reviewedBook")}
          >
            <ReviewBookAside review={review} locale={locale} />
          </aside>
        </div>
      </div>
    </Section>
  );
}
