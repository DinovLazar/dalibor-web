import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { Cover } from "@/components/cover";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { PortableText } from "@/components/portable-text";
import { buttonVariants } from "@/components/ui/button";
import { routing } from "@/i18n/routing";
import { client } from "@/sanity/lib/client";
import { localizedValue } from "@/sanity/lib/localize";
import { BOOK_QUERY } from "@/sanity/lib/queries";
import { monogramOf } from "@/lib/strings";

/**
 * The Style A Book page (§7.7, Phase 1.08 steps 11–13). Reads the `book`
 * singleton from Sanity and composes — mirroring the §7.1.2 featured-book band —
 * a header zone (2:3 `Cover` beside the title, the §6.16 title-page double rule,
 * "by …" credit, neutral publisher · year, and "Where to find it" purchase
 * buttons) over the long-form description (shared Portable Text renderer at the
 * reading measure). Localized mk→en→sr via `localizedValue`; page-load reveal is
 * pure CSS (`reveal` / `reveal-2`, reduced-motion-gated in globals.css).
 *
 * DISCREPANCY GUARD: this page renders NO genre and NO format label anywhere —
 * the `genre` field is intentionally not fetched and must not be reintroduced.
 *
 * Missing-singleton handling: a Book page with no `book` document is meaningless,
 * so we `notFound()` (unlike About, which degrades gracefully to the site name).
 */
export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations();
  const book = await client.fetch(BOOK_QUERY);
  if (!book) {
    notFound();
  }

  const title = localizedValue(book.title, locale) ?? t("book.title");
  // Neutral publication line — only rendered when at least one part exists.
  const pub = [book.publisher, book.publicationYear].filter(Boolean).join(" · ");
  // Purchase links are optional and may be url-less; keep only the actionable ones.
  const links = book.purchaseLinks?.filter((l) => l.url) ?? [];

  return (
    <Section>
      <Container>
        {/* Header zone — cover left (desktop) / on top (mobile), details right. */}
        <div className="reveal grid gap-10 md:grid-cols-[220px_1fr] md:items-start">
          <Cover
            image={book.coverImage}
            locale={locale}
            className="w-[220px] max-md:w-[170px]"
            sizes="(max-width: 768px) 170px, 220px"
            pixelWidth={600}
            monogram={monogramOf(title)}
          />

          <div>
            {/* The single <h1>. */}
            <PageHeader title={title} />

            {/* Title-page double rule (§6.16), left-aligned: 2px caramel + 1px hairline. */}
            <div
              aria-hidden
              className="relative my-5 h-0 w-24 border-t-2 border-primary"
            >
              <span className="absolute inset-x-0 top-[3px] block border-t border-border" />
            </div>

            {/* "by …" author credit. */}
            <p className="text-meta font-medium text-text-muted">
              {t("book.byline", {
                name:
                  localizedValue(book.authorName, locale) ??
                  t("common.siteName"),
              })}
            </p>

            {/* Neutral publication details (publisher · year). */}
            {pub ? (
              <p className="mt-1.5 text-meta text-text-muted">{pub}</p>
            ) : null}

            {/* "Where to find it" — only when there's at least one usable link. */}
            {links.length ? (
              <div className="mt-6">
                <h2 className="font-display text-h4 text-text">
                  {t("book.whereToFind")}
                </h2>
                <div className="mt-3 flex flex-wrap gap-3">
                  {links.map((link) => (
                    <a
                      key={link._key}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "outline" })}
                    >
                      {localizedValue(link.label, locale) ?? t("book.findIt")}
                      <ExternalLink aria-hidden className="size-4" strokeWidth={1.75} />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Description zone — long-form prose at the reading measure. */}
        <div className="reveal reveal-2 mt-10">
          <PortableText value={localizedValue(book.description, locale)} />
        </div>
      </Container>
    </Section>
  );
}
