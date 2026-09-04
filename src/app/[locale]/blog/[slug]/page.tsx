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
import { buildPageMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
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
import { POST_BY_SLUG_QUERY, POST_SLUGS_QUERY } from "@/sanity/lib/queries";
import { postSlugTag } from "@/sanity/lib/tags";
import { formatFullDate } from "@/lib/datetime";
import { cn } from "@/lib/utils";

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
  clientFresh.fetch(
    POST_BY_SLUG_QUERY,
    { slug },
    { cache: "force-cache", next: { tags: [postSlugTag(slug)] } },
  ),
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

  return buildPageMetadata({
    locale,
    page: "blog",
    path: `/blog/${slug}`,
    title: localizedValue(post.title, locale) ?? "",
    description: localizedValue(post.excerpt, locale) ?? undefined,
    ogType: "article",
  });
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
  const sourceName = post.source?.sourceName;
  const sourceUrl = post.source?.sourceUrl;

  // Structured data: BlogPosting (the post) + BreadcrumbList (Home › Blog › title).
  const canonical = `${siteUrl}/${locale}/blog/${slug}`;
  const articleSchema = articleJsonLd({
    type: "BlogPosting",
    headline: title,
    url: canonical,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post._updatedAt ?? undefined,
    inLanguage: resolvedLanguage(post.body, locale) ?? locale,
    image: post.coverImage?.asset
      ? urlForImage(post.coverImage).width(1200).url()
      : undefined,
    description: localizedValue(post.excerpt, locale) ?? undefined,
  });
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: t("nav.home"), url: `${siteUrl}/${locale}` },
    { name: t("nav.blog"), url: `${siteUrl}/${locale}/blog` },
    { name: title, url: canonical },
  ]);

  return (
    <Section>
      <JsonLd data={[articleSchema, breadcrumbSchema]} />
      <BackToTop />
      <div className="mx-auto w-full max-w-prose page-gutter lg:px-8">
        {/* Head — back link, breadcrumb, title, §6.16 double rule, date / note. */}
        <div className="reveal">
          <Link
            href="/blog"
            className="tap-target inline-flex min-h-[24px] items-center gap-1.5 text-meta font-medium text-primary-strong outline-none hover:text-primary-hover hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
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

          <h1
            lang={contentLang(post.title, locale)}
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
          <PortableText value={body} dropCap lang={contentLang(post.body, locale)} />

          {topics.length ? (
            <ul className="mt-8 flex flex-wrap gap-2 max-sm:gap-y-3">
              {topics.map((tp) => (
                <li key={tp.slug}>
                  <Link
                    href={`/blog?topic=${encodeURIComponent(tp.slug)}`}
                    className="tap-target inline-flex h-7 items-center rounded-pill border border-primary px-3 text-chip text-primary-strong outline-none transition-colors max-sm:h-9 hover:bg-[rgb(168_116_55_/_0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    {tp.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {/* Quiet "first published on …" attribution (§ same treatment as the
              single-review reviewed-book aside): eyebrow + outlet link. */}
          {sourceUrl || sourceName ? (
            <div className="mt-8">
              <p className="eyebrow text-eyebrow uppercase text-text-muted">
                {t("blog.source")}
              </p>
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target mt-1 inline-flex items-center gap-1.5 text-meta font-medium text-primary-strong outline-none hover:text-primary-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  {sourceName || sourceUrl}
                  <ExternalLink className="size-4" strokeWidth={1.75} aria-hidden />
                </a>
              ) : (
                <p className="mt-1 text-meta text-text-muted">{sourceName}</p>
              )}
            </div>
          ) : null}

          <hr className="mt-6 border-t border-border" />

          <Link
            href="/blog"
            className={cn(buttonVariants({ variant: "outline" }), "mt-6 gap-1.5 max-sm:h-12 max-sm:w-full")}
          >
            <ArrowLeft className="size-[18px]" strokeWidth={1.75} aria-hidden />{" "}
            {t("blog.backToBlog")}
          </Link>
        </div>
      </div>
    </Section>
  );
}
