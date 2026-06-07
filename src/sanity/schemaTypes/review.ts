import {defineArrayMember, defineField, defineType} from "sanity";

import {requireMk} from "./localized";
import {localizedSlug} from "./slug";

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
      description: "The headline of Dalibor's review.",
      validation: (Rule) => Rule.custom(requireMk),
    }),
    localizedSlug("reviewTitle"),
    defineField({
      name: "coverImage",
      title: "Cover image (of the reviewed book)",
      type: "localizedImage",
      validation: (Rule) =>
        Rule.custom((image) =>
          (image as { asset?: { _ref?: string } } | undefined)?.asset?._ref
            ? true
            : "A cover image of the reviewed book is required.",
        ),
    }),
    // --- Reviewed-book details ---
    defineField({
      name: "bookTitle",
      title: "Reviewed book — title",
      type: "localizedString",
      validation: (Rule) => Rule.custom(requireMk),
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
    defineField({
      name: "source",
      title: "Original source (optional)",
      type: "object",
      description: "Where this review first appeared (e.g. Booksa, Beton).",
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({name: "sourceName", title: "Source name", type: "string"}),
        defineField({
          name: "sourceUrl",
          title: "Source URL",
          type: "url",
          validation: (Rule) => Rule.uri({scheme: ["http", "https"]}),
        }),
      ],
    }),
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
