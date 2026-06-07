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
