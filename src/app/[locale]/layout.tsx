import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lora, Playfair_Display } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { routing } from "@/i18n/routing";
import { previewNoindex, siteUrl } from "@/sanity/env";

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

/**
 * Site-wide metadata defaults (Phase 1.12), localized per request:
 *  - `metadataBase` (from NEXT_PUBLIC_SITE_URL) so every relative URL — notably
 *    the file-convention `opengraph-image` — resolves to an absolute URL;
 *  - a `title.template` ("%s — siteName") that wraps every child page's title,
 *    plus a default title for routes that set none (e.g. error boundaries);
 *  - default description + Open Graph/Twitter, overridden per page by
 *    `buildPageMetadata`.
 * Per-page canonical, hreflang, and og:type are set by each page's
 * `generateMetadata` via `@/lib/seo/metadata`.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  const t = await getTranslations({ locale: resolved, namespace: "metadata" });
  const siteName = t("siteName");

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("default.title"),
      template: `%s — ${siteName}`,
    },
    description: t("default.description"),
    // Preview safety-net (2.05): when PREVIEW_NOINDEX is on, emit a hard
    // site-wide noindex. Set on the root layout so every child page inherits it
    // (no page's `buildPageMetadata` sets `robots`, so none override this).
    ...(previewNoindex
      ? { robots: { index: false, follow: false } }
      : {}),
    openGraph: {
      type: "website",
      siteName,
      title: t("default.title"),
      description: t("default.description"),
    },
    twitter: { card: "summary_large_image" },
  };
}

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
