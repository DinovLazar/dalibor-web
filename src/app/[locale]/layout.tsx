import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lora, Playfair_Display } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { routing } from "@/i18n/routing";

import "../globals.css";

// Display family — Playfair Display, latin + cyrillic, weights/styles per the
// 1.03 handover (Appendix C). Exposed as `--font-playfair`, which `--font-display`
// in globals.css points at.
const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

// Body / UI family — Lora, latin + cyrillic, wired to `--font-lora` / `--font-body`.
const lora = Lora({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

// Minimal per-locale metadata only. hreflang / full metadata system land in 1.12.
export const metadata: Metadata = {
  title: "Dalibor Plečić",
};

// Prerender all three locale roots.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Opt this locale into static rendering.
  setRequestLocale(locale);

  const t = await getTranslations("common");

  return (
    <html lang={locale} className={`${playfair.variable} ${lora.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          {/* First focusable element — jumps keyboard users straight to <main>. */}
          <SkipToContent>{t("skipToContent")}</SkipToContent>
          <SiteHeader />
          <main id="content" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
