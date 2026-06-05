import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";

// Minimal placeholder Home — the real Style A home arrives in 1.07. Its only job
// this phase is to prove each locale resolves its own UI strings.
export default async function HomePage({
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
    <div className="mx-auto w-full max-w-prose px-5 py-12 sm:py-16">
      <p className="text-eyebrow uppercase text-text-muted">{locale}</p>
      <h1 className="mt-2 text-display">{t("common.siteName")}</h1>
      <p className="mt-3 text-body-lg text-text-muted">{t("home.title")}</p>

      {/* Translated nav labels, visible proof the active locale resolves. */}
      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-body">
        <span>{t("nav.home")}</span>
        <span>{t("nav.about")}</span>
        <span>{t("nav.reviews")}</span>
        <span>{t("nav.blog")}</span>
        <span>{t("nav.book")}</span>
        <span>{t("nav.contact")}</span>
      </nav>

      <p className="mt-10 text-meta text-text-muted">
        Placeholder home — the Style A home page is built in 1.07.
      </p>
    </div>
  );
}
