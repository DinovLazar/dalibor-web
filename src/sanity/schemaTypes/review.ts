import {defineArrayMember, defineField, defineType} from "sanity";

import {localizedSlug} from "./slug";
import {sourceField} from "./source";

/** A review of someone else's book (verdict-driven prose — no star rating). */
export const review = defineType({
  name: "review",
  title: "Review",
  type: "document",
  fields: [
    defineField({
      name: "reviewTitle",
      title: "Review title",
      type: "localizedString",
      description:
        "The headline of Dalibor's review. Macedonian is OPTIONAL — most reviews " +
        "exist only in hr/sr/en, and the site falls back mk→en→sr (the slug is the " +
        "required, language-neutral identifier).",
    }),
    localizedSlug("reviewTitle"),
    defineField({
      name: "coverImage",
      title: "Cover image (of the reviewed book)",
      type: "localizedImage",
      description:
        "Optional — most reviews have no cover; the graceful Style A placeholder " +
        "renders when unset. Alt text is still required once an image is added.",
    }),
    // --- Reviewed-book details ---
    defineField({
      name: "bookTitle",
      title: "Reviewed book — title",
      type: "localizedString",
      description: "Macedonian optional — falls back mk→en→sr like the review title.",
    }),
    defineField({name: "bookAuthor", title: "Reviewed book — author", type: "string"}),
    defineField({name: "publisher", title: "Reviewed book — publisher", type: "string"}),
    defineField({
      name: "publicationYear",
      title: "Reviewed book — publication year",
      type: "number",
      validation: (Rule) => Rule.integer().min(0).max(2100),
    }),
    defineField({
      name: "isbn",
      title: "Reviewed book — ISBN (optional)",
      type: "string",
    }),
    // --- The review itself ---
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "localizedText",
      description: "Short summary used on the list / cards.",
    }),
    defineField({
      name: "body",
      title: "Review body",
      type: "localizedBlockContent",
      description:
        "Tip: start the first paragraph with a letter (not a quote or dash) — the drop-cap only renders correctly on a letter.",
    }),
    defineField({
      name: "topics",
      title: "Topics (tags)",
      type: "array",
      of: [defineArrayMember({type: "reference", to: [{type: "topic"}]})],
    }),
    sourceField(),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "reviewTitle.mk",
      book: "bookTitle.mk",
      author: "bookAuthor",
      media: "coverImage",
    },
    prepare: ({title, book, author, media}) => ({
      title: title || "(untitled review)",
      subtitle: [book, author].filter(Boolean).join(" · "),
      media,
    }),
  },
});
