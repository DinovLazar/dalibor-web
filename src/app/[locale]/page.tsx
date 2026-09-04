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
import { buildPageMetadata, getMetadataCopy } from "@/lib/seo/metadata";
import { personJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
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

  // Localized site name + description for the WebSite JSON-LD, read from the same
  // `metadata` namespace the page's own <head> copy comes from (never duplicated).
  const { siteName, description } = await getMetadataCopy(locale, "home");

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
      {/* Structured data — Home carries both the WebSite node (this site is his,
          in three languages) and the Person node (who he is). They share one
          `@id` for the Person, so crawlers resolve a single entity across the
          site rather than a separate person per page. */}
      <JsonLd
        data={[
          websiteJsonLd({ name: siteName, description }),
          personJsonLd(),
        ]}
      />
      {/* Phone band rhythm (Phase 3.01). Below `sm` the page is built from
          alternating full-width cream/parchment bands so the sections read as
          separate objects instead of one flat cream field: the full-bleed
          portrait, then parchment (name + CTAs), cream (the book), parchment
          (latest reviews), cream (the blog), and the walnut footer terminating
          it. Cards follow automatically — `--band-card` makes a card on a
          parchment band cream and vice versa, so a card never sits on a ground
          of its own value. Every `band-*` class is inert at `sm` and up, so the
          desktop page is unchanged (the featured book keeps its parchment there).
          The hero band lives inside <Hero>, which owns the photo/words split. */}
      <Hero hero={hero} locale={locale} className="reveal" />
      <FeaturedBook book={book} locale={locale} className="reveal reveal-2 band-cream" />
      <LatestReviews reviews={reviews} locale={locale} className="reveal reveal-3 band-parchment" />
      <FromTheBlog posts={posts} locale={locale} className="reveal reveal-4 band-cream" />
    </>
  );
}
