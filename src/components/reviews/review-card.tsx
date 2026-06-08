import { Link } from "@/i18n/navigation";
import { Cover } from "@/components/cover";
import type { LocalizedImage } from "@/sanity/sanity.types";
import { formatMonthYear } from "@/lib/datetime";
import { monogramOf } from "@/lib/strings";

/**
 * Review card (§6.6) — the horizontal "library row": cover left, text right; the
 * whole card is one link to the canonical single-review URL. Presentational and
 * **already-localized**: every text field is passed in resolved to the active
 * locale (mk→en→sr), so this same card renders from the server list AND from the
 * client search results without duplicating cover / monogram / date logic.
 *
 * The cover is decorative (`alt=""`) because the title names the link, and the
 * topic chips are non-interactive `<span>`s (a link can't nest links — §6.8).
 * Stacks below 420px (§6.6). Sync + free of server-only deps so it is safe in a
 * client component.
 */
export function ReviewCard({
  href,
  coverImage,
  locale,
  title,
  bookTitle,
  bookAuthor,
  publishedAt,
  excerpt,
  topics,
  availableIn,
  contentLang,
}: {
  href: string;
  coverImage: LocalizedImage | null;
  locale: string;
  title: string;
  bookTitle?: string;
  bookAuthor?: string;
  publishedAt?: string | null;
  excerpt?: string;
  topics: { slug: string; label: string }[];
  /** Pre-formatted "available in: …" note; shown only when provided (§6.13). */
  availableIn?: string;
  /**
   * BCP-47 language of the card's resolved title/excerpt, set only when it
   * differs from the page locale (WCAG 2.2 AA SC 3.1.2). Pass
   * `contentLang(field, locale)`.
   */
  contentLang?: string;
}) {
  const date = formatMonthYear(publishedAt, locale);
  const shownTopics = topics.slice(0, 3);
  const extraTopics = topics.length - shownTopics.length;

  return (
    <Link
      href={href}
      className="group/card flex gap-[18px] rounded-card border border-border bg-surface p-5 shadow-card outline-none transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus max-xs:flex-col"
    >
      <Cover
        image={coverImage}
        locale={locale}
        decorative
        className="w-[132px] max-sm:w-[104px] max-xs:w-full max-xs:max-w-[140px]"
        sizes="(max-width: 419px) 140px, (max-width: 639px) 104px, 132px"
        pixelWidth={400}
        monogram={monogramOf(bookTitle ?? title)}
      />
      <div className="flex min-w-0 flex-col gap-[7px]">
        {/* h2: on the Reviews list + search results the card is the top-level
            item under the page h1 (no intervening h2), so h2 keeps the heading
            order sequential. Styled as h4 — visual size unchanged. */}
        <h2
          lang={contentLang}
          className="font-display text-h4 text-text transition-colors group-hover/card:text-primary-strong"
        >
          {title}
        </h2>
        {bookAuthor || date ? (
          <p className="text-meta font-medium text-text-muted">
            {bookAuthor}
            {bookAuthor && date ? " · " : ""}
            {date ? (
              <time dateTime={publishedAt ?? undefined}>{date}</time>
            ) : null}
          </p>
        ) : null}
        {excerpt ? (
          <p lang={contentLang} className="line-clamp-2 text-body text-text-muted">
            {excerpt}
          </p>
        ) : null}
        {shownTopics.length ? (
          <ul className="mt-0.5 flex flex-wrap gap-2">
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
          <p className="text-meta text-text-muted">{availableIn}</p>
        ) : null}
      </div>
    </Link>
  );
}
