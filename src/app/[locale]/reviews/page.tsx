import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { ReviewSearch } from "@/components/reviews/review-search";
import { ReviewsList } from "@/components/reviews/reviews-list";
import { TopicFilter } from "@/components/topic-filter";
import { routing } from "@/i18n/routing";
import { client } from "@/sanity/lib/client";
import { localizedValue } from "@/sanity/lib/localize";
import { REVIEWS_LIST_QUERY, TOPICS_QUERY } from "@/sanity/lib/queries";

/**
 * The real Style A Reviews list (§7.3) — replaces the Phase 1.05 connect-to-site
 * stub. A single ~48rem reading column: page head, then the §6.8 topic-filter
 * chips, then the §6.9 search box wrapping the server-rendered list.
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
    client.fetch(REVIEWS_LIST_QUERY),
    client.fetch(TOPICS_QUERY),
  ]);

  const topicChips = topics
    .map((tp) => ({
      slug: tp.slug ?? "",
      label: localizedValue(tp.title, locale) ?? "",
    }))
    .filter((x) => x.slug && x.label);

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
        <TopicFilter
          basePath="/reviews"
          className="mt-8 reveal reveal-2"
          topics={topicChips}
          activeTopic={activeTopic}
          allLabel={t("reviews.allTopics")}
          ariaLabel={t("reviews.topicsLabel")}
        />
        <ReviewSearch
          className="mt-6 reveal reveal-3"
          locale={locale}
          topic={activeTopic ?? null}
        >
          <ReviewsList reviews={filtered} locale={locale} />
        </ReviewSearch>
      </Container>
    </Section>
  );
}
