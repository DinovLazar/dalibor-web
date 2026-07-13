import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { Cover } from "@/components/cover";
import { buttonVariants } from "@/components/ui/button";
import { localizedValue } from "@/sanity/lib/localize";
import type { HOME_FEATURED_BOOK_QUERY_RESULT } from "@/sanity/sanity.types";
import { monogramOf } from "@/lib/strings";
import { cn } from "@/lib/utils";

/**
 * Featured-book band (§7.1.2) — a full-bleed parchment band (hairlines top and
 * bottom): the book cover (2:3) beside an eyebrow, title, publisher · year, a
 * short blurb, and a quiet link through to the Book page. "Where to find / buy
 * it" stays on the Book page (1.08); this block stays simple.
 */
export async function FeaturedBook({
  book,
  locale,
  className,
}: {
  book: HOME_FEATURED_BOOK_QUERY_RESULT;
  locale: string;
  className?: string;
}) {
  if (!book) return null;

  const t = await getTranslations("home");
  const title = localizedValue(book.title, locale);
  const blurb = localizedValue(book.tagline, locale);
  const sub = [localizedValue(book.publisher, locale), book.publicationYear]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className={cn("border-y border-border bg-surface", className)}>
      <Container className="grid items-center gap-10 py-14 max-sm:py-12 md:grid-cols-[200px_1fr]">
        <Cover
          image={book.coverImage}
          locale={locale}
          className="w-[200px] max-md:w-[160px]"
          sizes="(max-width: 768px) 160px, 200px"
          pixelWidth={600}
          monogram={monogramOf(title)}
        />
        <div>
          <p className="eyebrow text-eyebrow uppercase text-primary-strong">
            {t("featuredEyebrow")}
          </p>
          {title ? (
            <h2 className="mt-1 font-display text-h2 text-text max-sm:text-[1.625rem]">
              {title}
            </h2>
          ) : null}
          {sub ? (
            <p className="mt-1.5 text-meta font-medium text-text-muted">{sub}</p>
          ) : null}
          {blurb ? (
            <p className="mt-3.5 max-w-[40rem] text-body text-text">{blurb}</p>
          ) : null}
          <Link
            href="/book"
            className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
          >
            {t("featuredCta")} <span aria-hidden>→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
