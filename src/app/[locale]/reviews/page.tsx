import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { ListCap } from "@/components/reviews/list-cap";
import { ReviewSearch } from "@/components/reviews/review-search";
import { ReviewsList } from "@/components/reviews/reviews-list";
import { TopicFilter } from "@/components/topic-filter";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { client, clientFresh } from "@/sanity/lib/client";
import { localizedValue } from "@/sanity/lib/localize";
import { REVIEWS_LIST_QUERY, TOPICS_QUERY } from "@/sanity/lib/queries";
import { REVIEW_TAG } from "@/sanity/lib/tags";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, page: "reviews", path: "/reviews" });
}

/**
 * The real Style A Reviews list (§7.3) — replaces the Phase 1.05 connect-to-site
 * stub. A single ~48rem reading column: page head, then the §6.9 search box,
 * then the §6.8 topic-filter chips, then the server-rendered list.
 *
 * Phase 3.01 reordered that head. The filter used to come first and, wrapped,
 * was 312px tall on a phone — the search input did not appear until 615px down
 * and the first review until 737px. Search is the primary tool, so it now leads;
 * the filter is passed into `ReviewSearch` as a node so it can render between
 * the input and the results without becoming a client component.
 *
 * Two complementary filtering paths share one URL contract:
 *  - SSR topic filter — `?topic=<slug>` re-renders the list server-side, so the
 *    chips work with JavaScript disabled.
 *  - Progressively-enhanced search — the box POSTs to `/api/reviews/search`
 *    (scoped by the same active topic) and swaps in client results in place; with
 *    JS off it is inert and the SSR list stays.
 *
 * Server component; localized mk→en→sr via `localizedValue`. The page-load reveal
 * is pure CSS (`reveal` / `reveal-2` / `reveal-3`, reduced-motion-gated).
 */
export default async function ReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ topic?: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const { topic: activeTopic } = await searchParams;
  const t = await getTranslations();

  const [reviews, topics] = await Promise.all([
    clientFresh.fetch(
      REVIEWS_LIST_QUERY,
      {},
      { cache: "force-cache", next: { tags: [REVIEW_TAG] } },
    ),
    client.fetch(TOPICS_QUERY),
  ]);

  // Build a set of topic slugs actually referenced by the fetched reviews so the
  // filter chips reflect only live topics (no dead chips for unused topics) —
  // mirrors the Blog list. Matters now the taxonomy is broader than the content.
  const usedTopicSlugs = new Set(
    reviews.flatMap((r) =>
      (r.topics ?? []).map((tp) => tp.slug).filter(Boolean),
    ),
  );

  const topicChips = topics
    .map((tp) => ({
      slug: tp.slug ?? "",
      label: localizedValue(tp.title, locale) ?? "",
    }))
    .filter((x) => x.slug && x.label && usedTopicSlugs.has(x.slug));

  // Topic filter is purely server-side (works without JS): scope the list by slug.
  const filtered = activeTopic
    ? reviews.filter((r) =>
        (r.topics ?? []).some((tp) => tp.slug === activeTopic),
      )
    : reviews;

  return (
    <Section>
      {/* max-w-3xl (≈48rem) overrides Container's shell width via tailwind-merge —
          the Reviews page is intentionally a single reading column. */}
      <Container className="max-w-3xl">
        <PageHeader
          className="reveal"
          eyebrow={t("reviews.eyebrow")}
          title={t("reviews.title")}
          description={t("reviews.lede")}
        />
        {/* Search first, then the filter, then the results (Phase 3.01). The
            filter is handed to ReviewSearch as a node rather than rendered here
            so it can sit between the input and the list while staying a Server
            Component. */}
        <ReviewSearch
          className="mt-6 reveal reveal-2"
          locale={locale}
          topic={activeTopic ?? null}
          filter={
            <TopicFilter
              basePath="/reviews"
              topics={topicChips}
              activeTopic={activeTopic}
              allLabel={t("reviews.allTopics")}
              ariaLabel={t("reviews.topicsLabel")}
            />
          }
        >
          <ListCap total={filtered.length}>
            <ReviewsList reviews={filtered} locale={locale} />
          </ListCap>
        </ReviewSearch>
      </Container>
    </Section>
  );
}
