import {defineArrayMember, defineField, defineType} from "sanity";

import {requireMk} from "./localized";
import {localizedSlug} from "./slug";

/** Blog post. */
export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localizedString",
      validation: (Rule) => Rule.custom(requireMk),
    }),
    localizedSlug("title"),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "localizedText",
      description: "Short summary used on cards and for SEO.",
    }),
    defineField({name: "coverImage", title: "Cover image", type: "localizedImage"}),
    defineField({
      name: "body",
      title: "Body",
      type: "localizedBlockContent",
      description:
        "Tip: start the first paragraph with a letter (not a quote „ « “ or a dash) — the article's drop-cap only renders correctly on a letter.",
    }),
    defineField({
      name: "topics",
      title: "Topics",
      type: "array",
      of: [defineArrayMember({type: "reference", to: [{type: "topic"}]})],
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {title: "title.mk", subtitle: "slug.current", media: "coverImage"},
    prepare: ({title, subtitle, media}) => ({
      title: title || "(untitled post)",
      subtitle,
      media,
    }),
  },
});
