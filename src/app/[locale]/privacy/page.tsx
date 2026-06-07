import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { routing } from "@/i18n/routing";

/**
 * TEMPORARY stub (1.06) — gives the footer Privacy link a real page inside the new
 * chrome. The real long-form Privacy page (§7.9) is written in 1.11.
 */
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

  const t = await getTranslations();

  return (
    <Container>
      <Section>
        <PageHeader title={t("privacy.title")} />
        <p className="mt-4 max-w-prose text-body text-text-muted">
          {t("common.comingSoon")}
        </p>
      </Section>
    </Container>
  );
}
