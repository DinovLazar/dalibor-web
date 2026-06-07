import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { FeaturedBook } from "@/components/home/featured-book";
import { FromTheBlog } from "@/components/home/from-the-blog";
import { Hero } from "@/components/home/hero";
import { LatestReviews } from "@/components/home/latest-reviews";
import { routing } from "@/i18n/routing";
import { client } from "@/sanity/lib/client";
import {
  HOME_FEATURED_BOOK_QUERY,
  HOME_HERO_QUERY,
  HOME_POSTS_QUERY,
  HOME_REVIEWS_QUERY,
} from "@/sanity/lib/queries";

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

  const [hero, book, reviews, posts] = await Promise.all([
    client.fetch(HOME_HERO_QUERY),
    client.fetch(HOME_FEATURED_BOOK_QUERY),
    client.fetch(HOME_REVIEWS_QUERY),
    client.fetch(HOME_POSTS_QUERY),
  ]);

  return (
    <>
      <Hero hero={hero} locale={locale} className="reveal" />
      <FeaturedBook book={book} locale={locale} className="reveal reveal-2" />
      <LatestReviews reviews={reviews} locale={locale} className="reveal reveal-3" />
      <FromTheBlog posts={posts} locale={locale} className="reveal reveal-4" />
    </>
  );
}
