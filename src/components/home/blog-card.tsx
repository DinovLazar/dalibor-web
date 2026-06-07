import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { availableLanguages, localizedValue } from "@/sanity/lib/localize";
import type { AppLocale } from "@/sanity/lib/localize";
import type { HOME_POSTS_QUERY_RESULT } from "@/sanity/sanity.types";
import { formatFullDate } from "@/lib/datetime";

type PostItem = HOME_POSTS_QUERY_RESULT[number];

/**
 * Blog card (§6.7) — a date-ordered text row (no cover by default): title, a
 * date meta line, and a 2-line excerpt. The whole card links to the canonical
 * single-post URL (`/[locale]/blog/[slug]`, which 404s locally until 1.10).
 * Falls back (mk→en→sr) with the "available in" note when a translation is
 * missing (§6.13).
 */
export async function BlogCard({
  post,
  locale,
}: {
  post: PostItem;
  locale: string;
}) {
  const t = await getTranslations("common");

  const title = localizedValue(post.title, locale) ?? "";
  const langs = availableLanguages(post.title);
  const missing = !langs.includes(locale as AppLocale);
  const date = formatFullDate(post.publishedAt, locale);
  const excerpt = localizedValue(post.excerpt, locale);

  const href = post.slug ? `/blog/${post.slug}` : "/blog";

  return (
    <Link
      href={href}
      className="group/card block rounded-card border border-border bg-surface p-5 shadow-card outline-none transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <h3 className="font-display text-h4 text-text transition-colors group-hover/card:text-primary-strong">
        {title}
      </h3>
      {date ? (
        <p className="mt-1.5 text-meta font-medium text-text-muted">
          <time dateTime={post.publishedAt ?? undefined}>{date}</time>
        </p>
      ) : null}
      {excerpt ? (
        <p className="mt-2 line-clamp-2 text-body text-text-muted">{excerpt}</p>
      ) : null}
      {missing && langs.length ? (
        <p className="mt-1.5 text-meta text-text-muted">
          {t("availableIn", {
            langs: langs.map((l) => l.toUpperCase()).join(" · "),
          })}
        </p>
      ) : null}
    </Link>
  );
}
