import {defineQuery} from "next-sanity";

/**
 * Typed GROQ queries (via `defineQuery`, so Sanity TypeGen can infer result
 * types for every later phase). Localized fields are fetched as whole
 * `{mk, en, sr}` objects and resolved on the server with `localizedValue`.
 */

/* ---------------------------------------------------------------------------
 * Reviews — list, search source, single, and slug projections (Phase 1.09).
 *
 * These supersede the thin 1.05 proof-route `REVIEWS_QUERY`. Localized fields
 * are fetched whole ({mk,en,sr}) and resolved with `localizedValue` at render
 * time; topic references are dereferenced to `{ slug, title }` so cards can
 * render chips and the page can filter by topic slug server-side.
 * ------------------------------------------------------------------------- */

/** Every published review with the fields the Style A list card needs. */
export const REVIEWS_LIST_QUERY = defineQuery(`
  *[_type == "review" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    "slug": slug.current,
    reviewTitle,
    bookTitle,
    bookAuthor,
    excerpt,
    coverImage,
    publishedAt,
    "topics": topics[]->{ _id, "slug": slug.current, title }
  }
`);

/**
 * Search source — the list-card fields plus the localized `body` so the keyword
 * fallback can match against a plain-text flattening of the review. One fetch is
 * reused by both the keyword path and (to hydrate matched slugs) the semantic
 * path in `src/lib/search/reviews-search.ts`.
 */
export const REVIEWS_SEARCH_QUERY = defineQuery(`
  *[_type == "review" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    "slug": slug.current,
    reviewTitle,
    bookTitle,
    bookAuthor,
    excerpt,
    coverImage,
    publishedAt,
    body,
    "topics": topics[]->{ _id, "slug": slug.current, title }
  }
`);

/** One review by its language-neutral slug — the full single-review page. */
export const REVIEW_BY_SLUG_QUERY = defineQuery(`
  *[_type == "review" && slug.current == $slug][0]{
    _id,
    _updatedAt,
    "slug": slug.current,
    reviewTitle,
    bookTitle,
    bookAuthor,
    publisher,
    publicationYear,
    excerpt,
    body,
    coverImage,
    publishedAt,
    source,
    "topics": topics[]->{ _id, "slug": slug.current, title }
  }
`);

/** Just the slugs — for `generateStaticParams` on the single-review route. */
export const REVIEW_SLUGS_QUERY = defineQuery(`
  *[_type == "review" && defined(slug.current)]{ "slug": slug.current }
`);

/** All topics (slug + localized label) for the Reviews filter chips. */
export const TOPICS_QUERY = defineQuery(`
  *[_type == "topic" && defined(slug.current)] | order(title.mk asc){
    _id,
    "slug": slug.current,
    title
  }
`);

/* ---------------------------------------------------------------------------
 * Blog — list, single, and slug projections (Phase 1.10).
 *
 * These supersede the thin 1.05 proof-route `POSTS_QUERY` (only that stub used
 * it), mirroring the Reviews set: localized fields are fetched whole ({mk,en,sr})
 * and resolved with `localizedValue` at render time; topic references are
 * dereferenced to `{ slug, title }` so cards can render chips and the list can
 * filter by topic slug server-side. The single post adds the localized `body`.
 * ------------------------------------------------------------------------- */

/** Every published post with the fields the Style A blog card needs. */
export const POSTS_LIST_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    "slug": slug.current,
    title,
    excerpt,
    coverImage,
    publishedAt,
    "topics": topics[]->{ _id, "slug": slug.current, title }
  }
`);

/** One post by its language-neutral slug — the full single-post page. */
export const POST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    _updatedAt,
    "slug": slug.current,
    title,
    excerpt,
    body,
    coverImage,
    publishedAt,
    "topics": topics[]->{ _id, "slug": slug.current, title }
  }
`);

/** Just the slugs — for `generateStaticParams` on the single-post route. */
export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]{ "slug": slug.current }
`);

/**
 * The Book page (Phase 1.08). The book singleton + the author's localized name
 * (via a cross-document sub-query) for the "by …" credit, in one fetch. No
 * `genre`: sources disagree (novel vs. story collection) and it is resolved with
 * Dalibor in 2.01, so the page asserts no genre/format.
 */
export const BOOK_QUERY = defineQuery(`
  *[_type == "book"][0]{
    _id,
    title,
    coverImage,
    description,
    purchaseLinks,
    publisher,
    publicationYear,
    "authorName": *[_type == "author"][0].name
  }
`);

/** The About page (Phase 1.08): the author singleton — name, roles, tagline (the
 * page header) + the long-form bio (Portable Text) + portrait (`photo`). */
export const ABOUT_QUERY = defineQuery(`
  *[_type == "author"][0]{
    _id,
    name,
    roles,
    tagline,
    bio,
    photo
  }
`);

/* ---------------------------------------------------------------------------
 * Home-page queries (Phase 1.07)
 *
 * Home-scoped projections, kept separate from the generic queries above so the
 * Home page's data needs are self-documenting and decoupled from the list/detail
 * pages built in 1.08–1.10. Localized fields are still fetched whole and resolved
 * with `localizedValue` at render time.
 * ------------------------------------------------------------------------- */

/** The 3 most recent reviews, newest first — for the Home "Latest reviews" stack. */
export const HOME_REVIEWS_QUERY = defineQuery(`
  *[_type == "review" && defined(slug.current)]
    | order(coalesce(publishedAt, _createdAt) desc)[0...3]{
    _id,
    "slug": slug.current,
    reviewTitle,
    bookTitle,
    bookAuthor,
    excerpt,
    coverImage,
    publishedAt,
    "topics": topics[]->{ _id, title }
  }
`);

/** The 3 most recent blog posts, newest first — for the Home "From the blog" grid. */
export const HOME_POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]
    | order(coalesce(publishedAt, _createdAt) desc)[0...3]{
    _id,
    "slug": slug.current,
    title,
    excerpt,
    publishedAt
  }
`);

/** The book singleton — for the Home "Featured book" band (cover + title + short blurb). */
export const HOME_FEATURED_BOOK_QUERY = defineQuery(`
  *[_type == "book"][0]{
    _id,
    title,
    tagline,
    coverImage,
    publisher,
    publicationYear
  }
`);

/** The author singleton's hero fields — name, tagline, intro, and (future) photo. */
export const HOME_HERO_QUERY = defineQuery(`
  *[_type == "author"][0]{
    _id,
    name,
    tagline,
    heroIntro,
    photo
  }
`);
