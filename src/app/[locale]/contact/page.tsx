import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactLinks } from "@/components/contact/contact-links";
import { routing } from "@/i18n/routing";

/**
 * The real Style A Contact page (§7.8) — replaces the Phase 1.06 stub. A short
 * intro, then two columns ≥ md: the accessible {@link ContactForm} (built now,
 * sent live in 2.02) on the left, {@link ContactLinks} (Dalibor's links, from
 * `site-links.ts`) on the right; stacked form-first on mobile. The one-line link
 * to the Privacy page lives under the form (the form's privacy note).
 *
 * Server component; the form's interactivity is isolated in its `'use client'`
 * child. Localized via the `contact` message namespace; metadata is minimal
 * (hreflang / canonical / schema land in 1.12). The two blocks share the page-load
 * reveal (§8, pure CSS, reduced-motion-gated).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("contact");

  return (
    <Section>
      <Container>
        <PageHeader
          className="reveal"
          title={t("title")}
          description={t("intro")}
        />

        <div className="mt-10 grid gap-10 reveal reveal-2 md:mt-12 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] md:items-start md:gap-12">
          <ContactForm className="max-w-xl" />
          <ContactLinks />
        </div>
      </Container>
    </Section>
  );
}
