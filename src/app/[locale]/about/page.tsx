import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookOpen } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { PortableText } from "@/components/portable-text";
import { Translations } from "@/components/about/translations";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { personJsonLd } from "@/lib/seo/jsonld";
import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { contentLang, localizedValue } from "@/sanity/lib/localize";
import { ABOUT_QUERY } from "@/sanity/lib/queries";
import { monogramOf } from "@/lib/strings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, page: "about", path: "/about" });
}

/**
 * The Style A About page (§7.2). Reads the `author` singleton from Sanity and
 * renders it localized (mk→en→sr fallback) at request time:
 *  - a {@link PageHeader} whose single <h1> is the author's name, with the
 *    localized roles as eyebrow and the tagline as description;
 *  - a two-column body mirroring the home hero — a 4:5 portrait (or the graceful
 *    parchment placeholder when no photo is set) beside the Portable Text bio at
 *    the reading measure;
 *  - a quiet link through to Contact.
 * The three top-level blocks share the page-load reveal (§8), which is pure CSS
 * and reduced-motion-gated in globals.css. Server component.
 *
 * Missing-singleton handling: if the `author` document is absent the page still
 * renders (name falls back to the site name, portrait to its placeholder, bio is
 * omitted) rather than 404-ing — unlike Book, where no book document is
 * meaningless and we `notFound()`.
 */
export default async function AboutPage({
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
  const author = await client.fetch(ABOUT_QUERY);

  // The name is the page's single <h1>; fall back to the site name if missing.
  const name = localizedValue(author?.name, locale) ?? t("common.siteName");
  const roles = localizedValue(author?.roles, locale);
  const tagline = localizedValue(author?.tagline, locale);
  const bio = localizedValue(author?.bio, locale);
  const education = localizedValue(author?.education, locale);
  const photo = author?.photo?.asset ? author.photo : null;
  const monogram = monogramOf(name);

  return (
    <Section>
      {/* Person structured data — About is a canonical entity page (also on Home). */}
      <JsonLd data={personJsonLd()} />
      <Container>
        {/* 1 · Page head — name (h1) over roles (eyebrow) + tagline (description). */}
        <PageHeader
          title={name}
          eyebrow={roles}
          description={tagline}
          className="reveal"
        />

        {/* 2 · Two-column body: portrait first (stacks on top of mobile, sits
            beside the bio on desktop), mirroring the home hero's grid. */}
        <div className="mt-10 grid gap-10 reveal reveal-2 md:grid-cols-[minmax(240px,300px)_1fr] md:items-start">
          {/* Portrait — 4:5 framed image, or the graceful no-photo placeholder. */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-image shadow-cover">
            {photo ? (
              <Image
                src={urlForImage(photo)
                  .width(640)
                  .height(800)
                  .auto("format")
                  .url()}
                alt={localizedValue(photo.alt, locale) ?? name}
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
              />
            ) : (
              // Purely decorative parchment placeholder (§6.11), mirroring cover.tsx
              // at 4:5: an inset hairline frame, a book-open glyph + the monogram.
              <div
                aria-hidden
                className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-image border border-border bg-surface text-text-muted"
              >
                <BookOpen className="size-7" strokeWidth={1.75} />
                {monogram ? (
                  <span className="font-display text-h3 leading-none">
                    {monogram}
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* Bio — Portable Text already constrains to the reading measure and
              returns null when empty, so a missing bio degrades gracefully. The
              `lang` is set only when the bio falls back to another language
              (SC 3.1.2). A quiet education line sits beneath it. */}
          <div>
            <PortableText value={bio} lang={contentLang(author?.bio, locale)} />
            {education ? (
              <p className="mt-6 text-meta text-text-muted">
                <span className="font-medium text-text">
                  {t("about.education")}:
                </span>{" "}
                {education}
              </p>
            ) : null}
          </div>
        </div>

        {/* 3 · Translations block (§2.01b) — quiet Style A list of his published
            translations; renders nothing when the array is empty. */}
        <Translations
          translations={author?.translations}
          locale={locale}
          className="mt-14 reveal reveal-3"
        />

        {/* 4 · Quiet link to Contact (§7.2). */}
        <div className="mt-10 reveal reveal-4">
          <Link
            href="/contact"
            className={buttonVariants({ variant: "ghost" })}
          >
            {t("nav.contact")} <span aria-hidden>→</span>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
