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
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/sanity/env";
import { siteLinks } from "@/lib/site-links";

/**
 * The author's canonical home (default-locale page).
 *
 * Derived from `routing.defaultLocale` rather than hardcoded: the default flipped
 * mk→en on 2026-07-13, which silently left this pointing at `/mk` while every
 * canonical, hreflang x-default and sitemap entry pointed at `/en`. A Person
 * `url` that disagrees with the page's own canonical weakens exactly the
 * "this is the official site of this person" signal the schema exists to send.
 */
const PERSON_URL = `${siteUrl}/${routing.defaultLocale}`;

/**
 * Stable identifier for the Person node. Every schema that mentions Dalibor
 * points at this one `@id`, so the Person on Home, the Person on About, and the
 * `author` of every review, post and book all resolve to a single entity.
 */
const PERSON_ID = `${PERSON_URL}#person`;

/**
 * Reusable author reference embedded in Article/Book schemas. Carries `@id` so
 * it merges into the full Person node rather than standing as a separate stub.
 */
const AUTHOR_REF = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Dalibor Plečić",
  url: PERSON_URL,
} as const;

export interface PersonJsonLdOptions {
  /** Absolute URL of his portrait — pass when the page already has it (About). */
  image?: string;
  /**
   * Emit the identity-anchoring fields (`@id`, `mainEntityOfPage`, `description`,
   * `subjectOf`). Default true. The Person is repeated on Home and About; both
   * carry the same `@id`, which is what lets Google merge them into one entity
   * rather than reading two similar-looking people.
   */
  anchored?: boolean;
}

/**
 * Person schema for Dalibor Plečić — the site's central entity.
 *
 * The stable `@id` (`${PERSON_URL}#person`) is the load-bearing part: every other
 * schema on the site (Article author, Book author, WebSite author, ProfilePage
 * mainEntity) references that same node, so crawlers and LLMs resolve one
 * consistent person rather than several loose name strings.
 *
 * GUARD: `birthDate`, `birthPlace`, `nationality`, `address`, `homeLocation` and
 * `worksFor` are intentionally omitted — these facts are unconfirmed in the
 * research and must not be published as guesses.
 */
export function personJsonLd(
  opts: PersonJsonLdOptions = {},
): Record<string, unknown> {
  const { image, anchored = true } = opts;

  // sameAs: identity profiles only — accounts and author pages that ARE him.
  // Individual interview videos are deliberately NOT here (they are *about* him,
  // not profiles of him); they go in `subjectOf` below. Empty slots are dropped;
  // the `as string[]` widens the `as const` literal types so the filter is typed.
  const sameAs = (
    [
      siteLinks.instagram,
      siteLinks.facebook,
      siteLinks.booksa,
      siteLinks.versopolis,
      siteLinks.linkedin,
      siteLinks.partizanska,
      siteLinks.mqWien,
    ] as string[]
  ).filter((url) => url.length > 0);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Dalibor Plečić",
    alternateName: ["Далибор Плечиќ", "Далибор Плечић"],
    // Confirmed roles. "Journalist" was an unconfirmed dossier attribution and
    // stays dropped; "Professor of literature" is NOT a guess — it is stated in
    // his own published About-page bio, in both Macedonian and English
    // ("професор по книжевност" / "professor of literature").
    jobTitle: [
      "Writer",
      "Literary critic",
      "Literary translator",
      "Professor of literature",
    ],
    url: PERSON_URL,
    sameAs,
    knowsLanguage: ["Macedonian", "Serbian", "Croatian", "Bulgarian", "English"],
  };

  if (image !== undefined) data.image = image;

  if (anchored) {
    // Grounded in what this site actually publishes (reviews, essays on reading
    // and translation, his own book) — no claim that isn't visible on the site.
    data.description =
      "Dalibor Plečić is a writer, literary critic and literary translator. " +
      "He publishes book reviews and essays on reading and translation, and is " +
      "the author of the book Bunike (PNV Publications, 2022). He writes in " +
      "Macedonian, English and Serbian.";
    data.knowsAbout = [
      "Literary criticism",
      "Literary translation",
      "Contemporary fiction",
      "Macedonian literature",
      "Science fiction in literature",
    ];
    data.mainEntityOfPage = PERSON_URL;

    // Editorship and the outlets he writes for regularly. Every one of these is
    // stated in his own About-page bio (mk + en), which is why they are asserted
    // here where the dossier-sourced facts above are not. These are high-value
    // AEO signals: they are the specific, checkable affiliations an answer engine
    // uses to confirm which "Dalibor Plečić" is meant.
    data.worksFor = {
      "@type": "Organization",
      name: "Zenit",
      description: "Culture magazine, Strumica",
    };
    data.affiliation = [
      { "@type": "Organization", name: "Booksa", description: "Literary portal, Zagreb" },
      {
        "@type": "Organization",
        name: "The Literary Review",
        description: "Literary magazine, New Jersey",
      },
      { "@type": "Organization", name: "Beton", description: "Literary portal, Belgrade" },
    ];

    // subjectOf: the three interviews Dalibor supplied in intake §8 — media
    // *about* him. Modelled as VideoObject so the relation is explicit.
    const interviews = (siteLinks.interviews as readonly string[]).filter(
      (url) => url.length > 0,
    );
    if (interviews.length > 0) {
      data.subjectOf = interviews.map((url) => ({
        "@type": "VideoObject",
        url,
        about: { "@id": PERSON_ID },
      }));
    }
  }

  return data;
}

/**
 * ProfilePage wrapper for the About page.
 *
 * Google's documented pattern for "this page is the authoritative profile of a
 * person" is a ProfilePage whose `mainEntity` is the Person — stronger than a
 * bare Person node, because it says the *page* is the profile, not merely that a
 * person is mentioned on it.
 */
export function profilePageJsonLd(
  opts: { url: string; inLanguage: string } & PersonJsonLdOptions,
): Record<string, unknown> {
  const { url, inLanguage, ...personOpts } = opts;
  const person = personJsonLd(personOpts);
  // The Person is nested here, so it must not re-declare the document context.
  delete person["@context"];

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    inLanguage,
    mainEntity: person,
  };
}

/**
 * WebSite schema — declares the site itself as Dalibor's, in three languages.
 *
 * GUARD: no `potentialAction`/SearchAction. The review topic-search is a POST-only
 * API with no crawlable `?q=` URL, so advertising a search endpoint would point
 * crawlers at something that doesn't exist.
 */
export function websiteJsonLd(opts: {
  name: string;
  description: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    name: opts.name,
    alternateName: "Dalibor Plečić — Writer, Critic & Translator",
    url: siteUrl,
    description: opts.description,
    inLanguage: [...routing.locales],
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    copyrightHolder: { "@id": PERSON_ID },
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

export interface ReviewJsonLdOptions {
  headline: string;
  url: string; // absolute canonical of the review page
  inLanguage: string;
  datePublished?: string;
  dateModified?: string;
  description?: string; // excerpt
  image?: string; // absolute cover URL
  /** The book being reviewed — NOT Dalibor's own book. */
  book: {
    name: string;
    author?: string; // the reviewed book's author (a different person)
    publisher?: string;
    datePublished?: string; // publication year as string
    image?: string;
  };
}

/**
 * Review schema for a single book review.
 *
 * Why this and not `Article`: these pages *are* reviews, and schema.org has an
 * exact type for that. `Review` + `itemReviewed` states the relationship a
 * generic Article cannot — that this text is Dalibor's assessment of a specific
 * book by a specific author. That is what lets a search or answer engine respond
 * to "what did Dalibor Plečić write about <book>?" instead of merely finding a
 * page where both names happen to appear, and it reinforces the "literary critic"
 * claim in his Person schema with evidence.
 *
 * GUARD: no `reviewRating`. Dalibor writes criticism, not scored reviews, and
 * inventing a rating to unlock Google's review rich-result would be a fabrication.
 * The schema stays honest and simply doesn't qualify for the star snippet.
 *
 * NOTE: `itemReviewed.author` is the *reviewed book's* author — deliberately a
 * plain Person with no `@id`, so it can never be conflated with AUTHOR_REF.
 */
export function reviewJsonLd(opts: ReviewJsonLdOptions): Record<string, unknown> {
  const book: Record<string, unknown> = {
    "@type": "Book",
    name: opts.book.name,
  };

  if (opts.book.author !== undefined) {
    book.author = { "@type": "Person", name: opts.book.author };
  }
  if (opts.book.publisher !== undefined) {
    book.publisher = { "@type": "Organization", name: opts.book.publisher };
  }
  if (opts.book.datePublished !== undefined) {
    book.datePublished = opts.book.datePublished;
  }
  if (opts.book.image !== undefined) book.image = opts.book.image;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Review",
    headline: opts.headline,
    name: opts.headline,
    url: opts.url,
    author: AUTHOR_REF,
    inLanguage: opts.inLanguage,
    itemReviewed: book,
    mainEntityOfPage: opts.url,
  };

  if (opts.datePublished !== undefined) data.datePublished = opts.datePublished;
  if (opts.dateModified !== undefined) data.dateModified = opts.dateModified;
  if (opts.description !== undefined) data.description = opts.description;
  if (opts.image !== undefined) data.image = opts.image;

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
