import {defineArrayMember, defineField, defineType} from "sanity";

import {requireMk} from "./localized";

/** Dalibor's own book — a singleton (one document, enforced in structure.ts). */
export const book = defineType({
  name: "book",
  title: "Book (Dalibor's own)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localizedString",
      validation: (Rule) => Rule.custom(requireMk),
    }),
    defineField({name: "tagline", title: "Tagline (optional)", type: "localizedString"}),
    defineField({name: "coverImage", title: "Cover image", type: "localizedImage"}),
    defineField({name: "description", title: "Description", type: "localizedBlockContent"}),
    defineField({
      name: "genre",
      title: "Genre",
      type: "localizedString",
      description:
        "Editable — do not hard-code \"novel\" vs \"story collection\" (sources disagree).",
    }),
    defineField({name: "publisher", title: "Publisher", type: "string"}),
    defineField({
      name: "publicationYear",
      title: "Publication year",
      type: "number",
      validation: (Rule) => Rule.integer().min(0).max(2100),
    }),
    defineField({name: "isbn", title: "ISBN (optional)", type: "string"}),
    defineField({
      name: "purchaseLinks",
      title: "Purchase links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "purchaseLink",
          fields: [
            defineField({name: "label", title: "Label", type: "localizedString"}),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) => Rule.uri({scheme: ["http", "https"]}),
            }),
          ],
          preview: {select: {title: "label.mk", subtitle: "url"}},
        }),
      ],
    }),
  ],
  preview: {
    select: {title: "title.mk", subtitle: "publisher", media: "coverImage"},
    prepare: ({title, subtitle, media}) => ({
      title: title || "Book",
      subtitle,
      media,
    }),
  },
});
