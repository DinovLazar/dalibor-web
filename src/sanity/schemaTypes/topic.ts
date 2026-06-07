import {defineField, defineType} from "sanity";

import {requireMk} from "./localized";
import {localizedSlug} from "./slug";

/**
 * Shared taxonomy. Reviews carry "topic tags" and posts reuse the same list, so
 * a single referenced `topic` type keeps tags clean across content types.
 */
export const topic = defineType({
  name: "topic",
  title: "Topic",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localizedString",
      validation: (Rule) => Rule.custom(requireMk),
    }),
    localizedSlug("title"),
  ],
  preview: {
    select: {title: "title.mk", subtitle: "title.en"},
    prepare: ({title, subtitle}) => ({
      title: title || "(untitled topic)",
      subtitle,
    }),
  },
});
