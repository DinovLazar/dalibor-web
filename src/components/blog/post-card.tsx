import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import {
  availableInLabel,
  availableLanguages,
  localizedValue,
  resolveTopics,
} from "@/sanity/lib/localize";
import { urlForImage } from "@/sanity/lib/image";
import { formatFullDate } from "@/lib/datetime";
import type { POSTS_LIST_QUERY_RESULT } from "@/sanity/sanity.types";

/**
 * Blog post card (§6.7 blog card, §7.5 blog list) — the richer list variant of
 * the home `BlogCard`. A single `<Link>` wrapping the whole card surface (Style A
 * hover-lift + focus ring). Optionally shows a small 72×72 square thumbnail on
 * the left when a `coverImage` is present; otherwise renders text-only. Topic
 * chips (up to 3 + overflow) and the "available in" note complete the row.
 * Async server component (awaits translations). Non-interactive chips throughout
 * (link cannot nest links — §6.8).
 */
export async function PostCard({
  post,
  locale,
}: {
  post: POSTS_LIST_QUERY_RESULT[number];
  locale: string;
}) {
  const t = await getTranslations();

  const title = localizedValue(post.title, locale) ?? "";
  const date = formatFullDate(post.publishedAt, locale);
  const excerpt = localizedValue(post.excerpt, locale);
  const topics = resolveTopics(post.topics, locale);
  const availableIn = availableInLabel(availableLanguages(post.title), locale);

  const href = post.slug ? `/blog/${post.slug}` : "/blog";
  const hasThumb = Boolean(post.coverImage?.asset);

  const shownTopics = topics.slice(0, 3);
  const extraTopics = topics.length - shownTopics.length;

  return (
    <Link
      href={href}
      className="group/card block rounded-card border border-border bg-surface p-5 shadow-card outline-none transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <div className={hasThumb ? "flex gap-4" : undefined}>
        {hasThumb ? (
          <div className="relative size-[72px] shrink-0 overflow-hidden rounded-image">
            <Image
              src={urlForImage(post.coverImage!)
                .width(144)
                .height(144)
                .auto("format")
                .url()}
              alt=""
              fill
              sizes="72px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-h4 text-text transition-colors group-hover/card:text-primary-strong">
            {title}
          </h3>
          {date ? (
            <p className="mt-1.5 text-meta font-medium text-text-muted">
              <time dateTime={post.publishedAt ?? undefined}>{date}</time>
            </p>
          ) : null}
          {excerpt ? (
            <p className="mt-2 line-clamp-2 text-body text-text-muted">
              {excerpt}
            </p>
          ) : null}
          {shownTopics.length ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {shownTopics.map((tp) => (
                <li
                  key={tp.slug}
                  className="inline-flex h-7 items-center rounded-pill border border-primary px-3 text-eyebrow font-semibold text-primary-strong"
                >
                  {tp.label}
                </li>
              ))}
              {extraTopics > 0 ? (
                <li className="inline-flex h-7 items-center text-eyebrow font-semibold text-text-muted">
                  +{extraTopics}
                </li>
              ) : null}
            </ul>
          ) : null}
          {availableIn ? (
            <p className="mt-1.5 text-meta text-text-muted">
              {t("common.availableIn", { langs: availableIn })}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
