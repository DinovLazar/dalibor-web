import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";

/**
 * The real Style A Privacy page (§7.9) — replaces the Phase 1.06 stub. A calm,
 * plain-language policy covering what the contact form collects and how it is
 * handled, rendered as semantic HTML (NOT Sanity Portable Text — this is
 * infrastructure copy, not CMS content): an <h1> + §6.16 double rule, a lede, then
 * six <h2>+<p> sections in a `max-w-prose` reading column with Style A typography
 * (Playfair headings, Lora body). No drop cap.
 *
 * The copy is a plain-language placeholder pending Dalibor's review at launch; sr
 * is in Latin script to match the locale's current behaviour. No "effective date"
 * is shown — a real one lands at launch QA. Metadata is minimal (full SEO → 1.12).
 */

// Render order of the six sections (§4). Each maps to `sections.<key>.title|body`.
const SECTIONS = [
  "collect",
  "handle",
  "retention",
  "cookies",
  "choices",
  "changes",
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, page: "privacy", path: "/privacy" });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("privacy");

  return (
    <Section>
      <Container className="max-w-prose">
        <div className="reveal">
          <h1 className="font-display text-h1 text-text max-sm:text-[2.125rem]">
            {t("title")}
          </h1>

          {/* Title-page double rule (§6.16): 2px caramel + 1px hairline. */}
          <div
            aria-hidden
            className="relative my-[18px] h-0 border-t-2 border-primary"
          >
            <span className="absolute inset-x-0 top-[3px] block border-t border-border" />
          </div>

          <p className="text-body-lg text-text-muted">{t("intro")}</p>
        </div>

        <div className="reveal reveal-2 mt-10 space-y-8">
          {SECTIONS.map((key) => (
            <section key={key}>
              <h2 className="font-display text-h3 text-text">
                {t(`sections.${key}.title`)}
              </h2>
              <p className="mt-2 text-body text-text">
                {t(`sections.${key}.body`)}
              </p>
            </section>
          ))}
        </div>
      </Container>
    </Section>
  );
}
