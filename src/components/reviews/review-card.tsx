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
 * Sync + free of server-only deps so it is safe in a client component.
 *
 * **Phase 3.01 — the phone card is a compact row.** It used to stack below 420px:
 * a 140×210 cover above a 293px text block inside 20px padding, which made one
 * card 522px tall at 375px and the 20-card Reviews page 12,118px — about fifteen
 * screens. It is now a row at every width, with a 96×144 cover, 16px padding and
 * two-line clamps on the title and excerpt, which brings a card to well under
 * 200px. The topic chips are dropped below `sm`: they are the only element with
 * no height budget left, and the topic filter directly above the list already
 * exposes the same taxonomy. Desktop keeps the 132px cover, 20px padding and the
 * chips exactly as before.
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
      className="group/card flex gap-[18px] card-surface p-5 outline-none transition-[transform,box-shadow] duration-200 max-sm:gap-3.5 max-sm:p-4 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <Cover
        image={coverImage}
        locale={locale}
        decorative
        className="w-[132px] max-sm:w-24"
        sizes="(max-width: 639px) 96px, 132px"
        pixelWidth={288}
        monogram={monogramOf(bookTitle ?? title)}
      />
      <div className="flex min-w-0 flex-col gap-[7px] max-sm:gap-1">
        {/* h2: on the Reviews list + search results the card is the top-level
            item under the page h1 (no intervening h2), so h2 keeps the heading
            order sequential. Styled as h4 — visual size unchanged. */}
        <h2
          lang={contentLang}
          className="font-display text-h4 text-text transition-colors max-sm:line-clamp-2 group-hover/card:text-primary-strong"
        >
          {title}
        </h2>
        {bookAuthor || date ? (
          <p className="text-meta font-medium text-text-muted max-sm:line-clamp-1">
            {bookAuthor}
            {bookAuthor && date ? " · " : ""}
            {date ? (
              <time dateTime={publishedAt ?? undefined}>{date}</time>
            ) : null}
          </p>
        ) : null}
        {excerpt ? (
          <p lang={contentLang} className="line-clamp-2 text-body text-text-muted max-sm:text-meta">
            {excerpt}
          </p>
        ) : null}
        {shownTopics.length ? (
          <ul className="mt-0.5 flex flex-wrap gap-2 max-sm:hidden">
            {shownTopics.map((tp) => (
              <li
                key={tp.slug}
                className="inline-flex h-7 items-center rounded-pill border border-primary px-3 text-chip text-primary-strong"
              >
                {tp.label}
              </li>
            ))}
            {extraTopics > 0 ? (
              <li className="inline-flex h-7 items-center text-chip text-text-muted">
                +{extraTopics}
              </li>
            ) : null}
          </ul>
        ) : null}
        {availableIn ? (
          <p className="text-meta text-text-muted max-sm:line-clamp-1">{availableIn}</p>
        ) : null}
      </div>
    </Link>
  );
}
