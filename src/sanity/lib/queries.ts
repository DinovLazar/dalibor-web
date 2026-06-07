import {defineQuery} from "next-sanity";

/**
 * Typed GROQ queries (via `defineQuery`, so Sanity TypeGen can infer result
 * types for every later phase). Localized fields are fetched as whole
 * `{mk, en, sr}` objects and resolved on the server with `localizedValue`.
 */

export const REVIEWS_QUERY = defineQuery(`
  *[_type == "review" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    "slug": slug.current,
    reviewTitle,
    excerpt,
    coverImage,
    bookAuthor,
    publishedAt
  }
`);

export const POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    "slug": slug.current,
    title,
    excerpt,
    publishedAt
  }
`);

export const BOOK_QUERY = defineQuery(`
  *[_type == "book"][0]{
    _id,
    title,
    tagline,
    genre,
    coverImage,
    publisher,
    publicationYear
  }
`);

export const AUTHOR_QUERY = defineQuery(`
  *[_type == "author"][0]{
    _id,
    name,
    roles,
    shortBio,
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
