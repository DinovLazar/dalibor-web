import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { siteUrl } from "@/sanity/env";

/**
 * `buildPageMetadata` — the single helper every page's `generateMetadata` calls
 * to produce its Next.js {@link Metadata}. It centralises the project's SEO
 * contract so each page only declares *what* it is (page key, path, optional
 * doc title), never the boilerplate of canonical / hreflang / Open Graph.
 *
 * Two deliberate omissions, each to avoid a duplicate tag:
 *
 *  - **No images.** The file-convention `opengraph-image` route injects both
 *    `og:image` and `twitter:image` for us; setting `openGraph.images` /
 *    `twitter.images` here would emit them a second time. So we never touch
 *    image fields.
 *  - **No `metadataBase`.** The root layout sets it once; absolute URLs we build
 *    here are already fully-qualified from {@link siteUrl}.
 *
 * Title handling is template-aware. For normal pages we return `title` as a
 * plain string so the root layout's `title.template` ("%s — siteName") wraps it
 * for the page `<title>`; the OG/Twitter title, by contrast, is the *full*
 * branded "Title — siteName" so social cards read well standalone. The Home page
 * passes `absoluteTitle` to bypass the template (it returns `{ absolute }`) and
 * uses its title verbatim everywhere.
 *
 * Locale/URL facts (see `@/i18n/routing`, `@/sanity/env`): locales are
 * `mk` (default) / `en` / `sr`, every URL carries its prefix, and `siteUrl` has
 * no trailing slash, so an absolute page URL is `${siteUrl}/${locale}${path}`
 * (home is just `${siteUrl}/${locale}`).
 */
export interface BuildPageMetadataOptions {
  locale: string;
  /** Key into the `metadata` namespace, e.g. "home" | "about" | … | "default". Used to look up title/description when not passed explicitly. */
  page: string;
  /** Locale-RELATIVE path, beginning with "/", WITHOUT the locale prefix. Home is "/". e.g. "/reviews", "/reviews/some-slug". */
  path: string;
  /** Explicit title override (content pages pass the localized doc title). When omitted, falls back to the namespace `${page}.title`. */
  title?: string;
  /** Explicit description override. When omitted, falls back to the namespace `${page}.description`. */
  description?: string;
  /** When true the title is used verbatim with no "— siteName" template suffix (use for the Home page). Default false. */
  absoluteTitle?: boolean;
  /** og:type. Default "website"; pass "article" for blog posts / reviews. */
  ogType?: "website" | "article";
}

/** Our app locales → BCP-47 region codes for `og:locale` / `og:locale:alternate`. */
const OG_LOCALE: Record<string, string> = {
  mk: "mk_MK",
  en: "en_US",
  sr: "sr_RS",
};

/**
 * Minimal view of a next-intl translator: a key → string lookup. The SEO copy
 * lives in a `metadata` message namespace added by a separate stream, so it is
 * not yet part of the strictly-typed `Messages` (`AppConfig`) and cannot satisfy
 * the namespaced key/namespace generics. We therefore read it through this
 * narrow, dynamic-key surface — precise (no `any`), and isolated to the single
 * bridge below so the rest of the module stays fully typed.
 */
type MetadataTranslator = (key: string) => string;

type MetadataTranslatorFactory = (opts: {
  locale: (typeof routing.locales)[number];
  namespace: "metadata";
}) => Promise<MetadataTranslator>;

const getMetadataTranslations =
  getTranslations as unknown as MetadataTranslatorFactory;

export async function buildPageMetadata(
  opts: BuildPageMetadataOptions,
): Promise<Metadata> {
  // Narrow to a branded locale for next-intl; callers already validate, but this
  // keeps the helper sound on its own and falls back to the default if not.
  const locale = hasLocale(routing.locales, opts.locale)
    ? opts.locale
    : routing.defaultLocale;

  const t = await getMetadataTranslations({ locale, namespace: "metadata" });

  const siteName = t("siteName");
  const pageTitle = opts.title ?? t(`${opts.page}.title`);
  const description = opts.description ?? t(`${opts.page}.description`);

  // Absolute URL for this path under a given locale; home ("/") gets no
  // trailing slash, everything else appends the locale-relative path verbatim.
  const urlFor = (loc: string): string =>
    opts.path === "/"
      ? `${siteUrl}/${loc}`
      : `${siteUrl}/${loc}${opts.path}`;

  const canonical = urlFor(locale);

  // hreflang alternates: one per locale plus x-default → the default (mk) URL.
  const languages: Record<string, string> = {
    "x-default": urlFor(routing.defaultLocale),
  };
  for (const loc of routing.locales) {
    languages[loc] = urlFor(loc);
  }

  // og:locale:alternate — the OG-locale strings for the *other* two locales.
  const alternateLocale = routing.locales
    .filter((loc) => loc !== locale)
    .map((loc) => OG_LOCALE[loc]);

  // Social cards carry the fully-branded title; the page <title> stays
  // template-composed (or absolute for Home).
  const fullTitle = opts.absoluteTitle
    ? pageTitle
    : `${pageTitle} — ${siteName}`;

  // Open Graph / Twitter image. The file-convention `opengraph-image` /
  // `twitter-image` routes only auto-inject on the [locale]-segment page (Home,
  // path "/"); any deeper page returns its own `openGraph`, which overrides — and
  // so drops — that inherited image. We therefore reference the same branded
  // image routes explicitly for non-root pages. Net result: exactly one og:image
  // + one twitter:image on every page (the file convention on Home, the explicit
  // reference elsewhere) — never a duplicate.
  const isRootSegment = opts.path === "/";
  const ogImages = isRootSegment
    ? undefined
    : [{ url: `${siteUrl}/${locale}/opengraph-image`, width: 1200, height: 630, alt: siteName }];
  const twitterImages = isRootSegment
    ? undefined
    : [`${siteUrl}/${locale}/twitter-image`];

  return {
    title: opts.absoluteTitle ? { absolute: pageTitle } : pageTitle,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: opts.ogType ?? "website",
      siteName,
      locale: OG_LOCALE[locale] ?? OG_LOCALE[routing.defaultLocale],
      alternateLocale,
      title: fullTitle,
      description,
      url: canonical,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(twitterImages ? { images: twitterImages } : {}),
    },
  };
}
