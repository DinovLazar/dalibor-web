import { cache } from "react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Section } from "@/components/layout/section";
import { PortableText } from "@/components/portable-text";
import { client } from "@/sanity/lib/client";
import {
  availableInLabel,
  availableLanguages,
  localizedValue,
  resolveTopics,
} from "@/sanity/lib/localize";
import { POST_BY_SLUG_QUERY, POST_SLUGS_QUERY } from "@/sanity/lib/queries";
import { formatFullDate } from "@/lib/datetime";

/**
 * Single blog-post page (§7.6). A single reading column constrained to the
 * prose measure — identical reading pattern to §7.4 (single review) but
 * WITHOUT the reviewed-book sidebar. Shared Portable Text renderer with the
 * §3.6 drop cap (opt-in via `dropCap`). Localizes mk→en→sr via
 * `localizedValue`, with the §6.13 "available in" note when the active locale
 * is missing a translation. Statically rendered via `generateStaticParams`;
 * an unknown slug → `notFound()`. Server component.
 */

/** One post by slug, memoized per request so generateMetadata + the page
 *  component share a single fetch instead of hitting Sanity twice. */
const getPost = cache((slug: string) =>
  client.fetch(POST_BY_SLUG_QUERY, { slug }),
);

export async function generateStaticParams() {
  const slugs = await client.fetch(POST_SLUGS_QUERY);
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
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: `${localizedValue(post.title, locale) ?? ""} · Dalibor Plečić`,
    description: localizedValue(post.excerpt, locale) ?? undefined,
  };
}

export default async function BlogPostPage({
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
  const post = await getPost(slug);
  if (!post) {
    notFound();
  }

  const title = localizedValue(post.title, locale) ?? "";
  const langsLabel = availableInLabel(
    availableLanguages(post.title),
    locale,
  );
  const date = formatFullDate(post.publishedAt, locale);
  const body = localizedValue(post.body, locale);
  const topics = resolveTopics(post.topics, locale);

  return (
    <Section>
      <div className="mx-auto w-full max-w-prose px-5 sm:px-8">
        {/* Head — back link, breadcrumb, title, §6.16 double rule, date / note. */}
        <div className="reveal">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-meta font-medium text-primary-strong outline-none hover:text-primary-hover hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <ArrowLeft className="size-[18px]" strokeWidth={1.75} aria-hidden />{" "}
            {t("blog.backToBlog")}
          </Link>

          <nav
            aria-label={t("blog.breadcrumbLabel")}
            className="mt-3.5 hidden text-meta font-medium sm:block"
          >
            <Link href="/" className="text-primary-strong hover:underline">
              {t("nav.home")}
            </Link>
            <span className="px-2 text-border-strong" aria-hidden>
              /
            </span>
            <Link href="/blog" className="text-primary-strong hover:underline">
              {t("nav.blog")}
            </Link>
            <span className="px-2 text-border-strong" aria-hidden>
              /
            </span>
            <span aria-current="page" className="text-text-muted">
              {title}
            </span>
          </nav>

          <h1 className="mt-4 font-display text-h1 text-text max-sm:text-[2.125rem]">
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
              <time dateTime={post.publishedAt ?? undefined}>{date}</time>
            ) : null}
            {langsLabel ? (
              <span>
                {date ? " · " : ""}
                {t("common.availableIn", { langs: langsLabel })}
              </span>
            ) : null}
          </p>
        </div>

        {/* Body — prose at the reading measure with §3.6 drop cap. */}
        <div className="reveal reveal-2 mt-6">
          <PortableText value={body} dropCap />

          {topics.length ? (
            <ul className="mt-8 flex flex-wrap gap-2">
              {topics.map((tp) => (
                <li key={tp.slug}>
                  <Link
                    href={`/blog?topic=${encodeURIComponent(tp.slug)}`}
                    className="inline-flex h-7 items-center rounded-pill border border-primary px-3 text-eyebrow font-semibold text-primary-strong outline-none transition-colors hover:bg-[rgb(168_116_55_/_0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    {tp.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <hr className="mt-6 border-t border-border" />

          <Link
            href="/blog"
            className="mt-6 inline-flex items-center gap-1.5 text-meta font-medium text-primary-strong outline-none hover:text-primary-hover hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <ArrowLeft className="size-[18px]" strokeWidth={1.75} aria-hidden />{" "}
            {t("blog.backToBlog")}
          </Link>
        </div>
      </div>
    </Section>
  );
}
