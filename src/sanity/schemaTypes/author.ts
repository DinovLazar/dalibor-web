import {defineArrayMember, defineField, defineType} from "sanity";

import {requireMk} from "./localized";

/** Dalibor's profile / bio — a singleton (one document, enforced in structure.ts). */
export const author = defineType({
  name: "author",
  title: "Author profile",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "localizedString",
      description:
        "Covers the script differences (Далибор Плечиќ / Dalibor Plečić / Далибор Плечић).",
      validation: (Rule) => Rule.custom(requireMk),
    }),
    defineField({
      name: "roles",
      title: "Roles",
      type: "localizedString",
      description: "e.g. journalist, writer, literary translator.",
    }),
    defineField({
      name: "tagline",
      title: "Hero tagline",
      type: "localizedString",
      description:
        "The Home hero's one-line intro (under the name). Keep it short and literary.",
      validation: (Rule) => Rule.custom(requireMk),
    }),
    defineField({
      name: "heroIntro",
      title: "Hero intro (optional)",
      type: "localizedText",
      description:
        "A 1–2 sentence supporting line under the Home hero tagline. Optional.",
    }),
    defineField({name: "photo", title: "Photo", type: "localizedImage"}),
    defineField({
      name: "shortBio",
      title: "Short bio",
      type: "localizedText",
      description: "For Home / footer.",
    }),
    defineField({name: "bio", title: "Full biography", type: "localizedBlockContent"}),
    defineField({
      name: "socialLinks",
      title: "Social & profile links",
      type: "array",
      description:
        "Booksa, Versopolis, Partizanska, LinkedIn, Instagram, Facebook, … — reused by header/footer/contact.",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          fields: [
            defineField({name: "platform", title: "Platform", type: "string"}),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) => Rule.uri({scheme: ["http", "https"]}),
            }),
          ],
          preview: {select: {title: "platform", subtitle: "url"}},
        }),
      ],
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "Left blank — supplied in phase 2.02.",
    }),
  ],
  preview: {
    select: {title: "name.mk", subtitle: "roles.mk", media: "photo"},
    prepare: ({title, subtitle, media}) => ({
      title: title || "Author",
      subtitle,
      media,
    }),
  },
});
