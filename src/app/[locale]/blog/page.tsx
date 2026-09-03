import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { PostCard } from "@/components/blog/post-card";
import { TopicFilter } from "@/components/topic-filter";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { client, clientFresh } from "@/sanity/lib/client";
import { localizedValue } from "@/sanity/lib/localize";
import { POSTS_LIST_QUERY, TOPICS_QUERY } from "@/sanity/lib/queries";
import { POST_TAG } from "@/sanity/lib/tags";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, page: "blog", path: "/blog" });
}

/**
 * The real Style A Blog list (§7.5) — replaces the Phase 1.05 temporary proof
 * route. A single ~48rem reading column: page head, then the §6.8 topic-filter
 * chips, then the server-rendered §6.7 PostCard stack.
 *
 * Topic filtering is purely server-side (`?topic=<slug>` re-renders the list
 * from the URL, working without JavaScript). Unlike the Reviews page there is no
 * keyword search box on the Blog list. Dead-topic chips are suppressed: only
 * topics actually used by at least one post appear in the filter row.
 *
 * Server component; localized mk→en→sr via `localizedValue`. Page-load reveal is
 * pure CSS (`reveal` / `reveal-2` / `reveal-3`, reduced-motion-gated).
 */
export default async function BlogPage({
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

  const [posts, topics] = await Promise.all([
    clientFresh.fetch(
      POSTS_LIST_QUERY,
      {},
      { cache: "force-cache", next: { tags: [POST_TAG] } },
    ),
    client.fetch(TOPICS_QUERY),
  ]);

  // Build a set of topic slugs actually referenced by the fetched posts so the
  // filter chips reflect only live topics (no dead chips for unused topics).
  const usedTopicSlugs = new Set(
    posts.flatMap((p) =>
      (p.topics ?? []).map((tp) => tp.slug).filter(Boolean),
    ),
  );

  const topicChips = topics
    .map((tp) => ({ slug: tp.slug ?? "", label: localizedValue(tp.title, locale) ?? "" }))
    .filter((x) => x.slug && x.label && usedTopicSlugs.has(x.slug));

  // Topic filter is purely server-side (works without JS): scope the list by slug.
  const filtered = activeTopic
    ? posts.filter((p) =>
        (p.topics ?? []).some((tp) => tp.slug === activeTopic),
      )
    : posts;

  return (
    <Section>
      {/* max-w-3xl (≈48rem) overrides Container's shell width via tailwind-merge —
          the Blog list is intentionally a single reading column. */}
      <Container className="max-w-3xl">
        <PageHeader
          className="reveal"
          eyebrow={t("blog.eyebrow")}
          title={t("blog.title")}
          description={t("blog.lede")}
        />
        <TopicFilter
          basePath="/blog"
          className="mt-8 reveal reveal-2"
          topics={topicChips}
          activeTopic={activeTopic}
          allLabel={t("blog.allTopics")}
          ariaLabel={t("blog.topicsLabel")}
        />
        {filtered.length === 0 ? (
          <div className="mt-6 card-flat px-6 py-12 text-center reveal reveal-3">
            <BookOpen
              aria-hidden
              className="mx-auto size-10 text-text-muted"
              strokeWidth={1.75}
            />
            <p className="mt-4 text-body text-text-muted">{t("blog.empty")}</p>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-4 reveal reveal-3">
            {filtered.map((post) => (
              <li key={post._id}>
                <PostCard post={post} locale={locale} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
