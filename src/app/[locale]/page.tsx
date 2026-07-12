import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { FeaturedBook } from "@/components/home/featured-book";
import { FromTheBlog } from "@/components/home/from-the-blog";
import { Hero } from "@/components/home/hero";
import { LatestReviews } from "@/components/home/latest-reviews";
import { JsonLd } from "@/components/seo/json-ld";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { personJsonLd } from "@/lib/seo/jsonld";
import { client, clientFresh } from "@/sanity/lib/client";
import {
  HOME_FEATURED_BOOK_QUERY,
  HOME_HERO_QUERY,
  HOME_POSTS_QUERY,
  HOME_REVIEWS_QUERY,
} from "@/sanity/lib/queries";
import { POST_TAG, REVIEW_TAG } from "@/sanity/lib/tags";

/** Home metadata: the title is used verbatim (absolute) — it already carries the
 *  full brand + role line, so it is not wrapped by the layout's title template. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    page: "home",
    path: "/",
    absoluteTitle: true,
  });
}

/**
 * The Style A Home page (Phase 1.07): hero → featured book → latest reviews →
 * from the blog, all pulling live from Sanity and localized (mk→en→sr fallback)
 * at render time. Sits inside the 1.06 chrome (header/footer mounted by the
 * locale layout). The four blocks share a single page-load reveal (§8),
 * reduced-motion-gated in globals.css.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  // The two content grids carry cache tags so a publish can refresh them via
  // the revalidate webhook (Phase 2.14); hero + book stay plain (out of scope).
  const [hero, book, reviews, posts] = await Promise.all([
    client.fetch(HOME_HERO_QUERY),
    client.fetch(HOME_FEATURED_BOOK_QUERY),
    clientFresh.fetch(
      HOME_REVIEWS_QUERY,
      {},
      { cache: "force-cache", next: { tags: [REVIEW_TAG] } },
    ),
    clientFresh.fetch(
      HOME_POSTS_QUERY,
      {},
      { cache: "force-cache", next: { tags: [POST_TAG] } },
    ),
  ]);

  return (
    <>
      {/* Person structured data — Home is the canonical entity page (also on About). */}
      <JsonLd data={personJsonLd()} />
      <Hero hero={hero} locale={locale} className="reveal" />
      <FeaturedBook book={book} locale={locale} className="reveal reveal-2" />
      <LatestReviews reviews={reviews} locale={locale} className="reveal reveal-3" />
      <FromTheBlog posts={posts} locale={locale} className="reveal reveal-4" />
    </>
  );
}
