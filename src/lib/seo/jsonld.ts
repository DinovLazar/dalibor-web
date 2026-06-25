/**
 * jsonld — pure builders for schema.org JSON-LD structured data.
 *
 * Each function returns a plain JSON-LD object (including `@context`/`@type`)
 * ready to be serialized by the <JsonLd> server component. Builders are pure and
 * side-effect free; absent optional fields are simply omitted (never emitted as
 * `key: undefined`).
 *
 * Confidence guards are deliberate: several biographical and bibliographic facts
 * are unconfirmed in the research dossier, so we never assert them here.
 */
import { siteUrl } from "@/sanity/env";
import { siteLinks } from "@/lib/site-links";

/** The author's canonical home (default-locale page). */
const PERSON_URL = `${siteUrl}/mk`;

/** Reusable author reference embedded in Article/Book schemas. */
const AUTHOR_REF = {
  "@type": "Person",
  name: "Dalibor Plečić",
  url: PERSON_URL,
} as const;

/**
 * Person schema for Dalibor Plečić.
 *
 * GUARD: `birthDate`, `birthPlace`, `nationality`, `address`, and `homeLocation`
 * are intentionally omitted — these facts are unconfirmed in the research and
 * must not be published as guesses.
 */
export function personJsonLd(): Record<string, unknown> {
  // sameAs: only these external profiles, in this order, dropping any empties
  // (site-links is provisional — some slots may be filled in later phases). The
  // `as string[]` widens the `as const` literal types so the runtime filter is
  // well-typed.
  const sameAs = (
    [
      siteLinks.instagram,
      siteLinks.facebook,
      siteLinks.booksa,
      siteLinks.versopolis,
      siteLinks.linkedin,
      siteLinks.partizanska,
    ] as string[]
  ).filter((url) => url.length > 0);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Dalibor Plečić",
    alternateName: ["Далибор Плечиќ", "Далибор Плечић"],
    // Confirmed roles (intake §1 + the tagline ruling). "Journalist" was an
    // unconfirmed dossier attribution and is intentionally dropped.
    jobTitle: ["Writer", "Literary critic", "Literary translator"],
    url: PERSON_URL,
    sameAs,
    knowsLanguage: ["Macedonian", "Serbian", "Croatian", "Bulgarian", "English"],
  };
}

export interface ArticleJsonLdOptions {
  type?: "Article" | "BlogPosting"; // default "Article"
  headline: string;
  url: string; // absolute canonical of the page
  datePublished?: string; // ISO string
  dateModified?: string; // ISO string
  inLanguage: string; // resolved content language code: "mk" | "en" | "sr"
  image?: string; // absolute image URL (cover) — omit when absent
  description?: string; // excerpt
}

/** Article (or BlogPosting) schema for a content page. */
export function articleJsonLd(opts: ArticleJsonLdOptions): Record<string, unknown> {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": opts.type ?? "Article",
    headline: opts.headline,
    author: AUTHOR_REF,
    inLanguage: opts.inLanguage,
    mainEntityOfPage: opts.url,
  };

  if (opts.datePublished !== undefined) data.datePublished = opts.datePublished;
  if (opts.dateModified !== undefined) data.dateModified = opts.dateModified;
  if (opts.image !== undefined) data.image = opts.image;
  if (opts.description !== undefined) data.description = opts.description;

  return data;
}

export interface BookJsonLdOptions {
  name: string;
  url: string; // absolute canonical of the Book page
  publisher?: string;
  datePublished?: string; // year as string, e.g. "2014"
  inLanguage?: string;
  image?: string; // absolute cover URL — omit when absent
}

/**
 * Book schema for a single title.
 *
 * GUARD: `genre` and `bookFormat` are intentionally omitted — sources disagree
 * on novel vs. short-story collection, so we don't commit to either.
 */
export function bookJsonLd(opts: BookJsonLdOptions): Record<string, unknown> {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: opts.name,
    author: AUTHOR_REF,
    url: opts.url,
  };

  if (opts.publisher !== undefined) {
    data.publisher = { "@type": "Organization", name: opts.publisher };
  }
  if (opts.datePublished !== undefined) data.datePublished = opts.datePublished;
  if (opts.inLanguage !== undefined) data.inLanguage = opts.inLanguage;
  if (opts.image !== undefined) data.image = opts.image;

  return data;
}

export interface BreadcrumbItem {
  name: string;
  url: string; // absolute
}

/** BreadcrumbList schema from an ordered list of crumbs. */
export function breadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
