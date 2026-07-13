import {defineArrayMember, defineField, defineType} from "sanity";

import {requireMk} from "./localized";

/**
 * Language options for `translations[]`. Stored as stable ISO-ish codes; the
 * About "Translations" block renders the display name localized (mk/en/sr) via
 * the `about.langNames` message strings — so the language pair reads in the
 * visitor's language without duplicating names in the content.
 */
const TRANSLATION_LANGS = [
  {title: "Macedonian", value: "mk"},
  {title: "Serbian", value: "sr"},
  {title: "Bulgarian", value: "bg"},
  {title: "Croatian", value: "hr"},
  {title: "English", value: "en"},
  {title: "French", value: "fr"},
];

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
      name: "education",
      title: "Education",
      type: "localizedString",
      description:
        "A short qualification line shown quietly on the About page (e.g. degree + field).",
    }),
    defineField({
      name: "translations",
      title: "Published translations",
      type: "array",
      description:
        "Dalibor's published literary translations — rendered in the About page " +
        "\"Translations\" block. Give the title as published (mk/sr keep the " +
        "original); the English slot may add a gloss, e.g. " +
        "\"Između (In Between)\".",
      of: [
        defineArrayMember({
          type: "object",
          name: "translation",
          fields: [
            defineField({
              name: "title",
              title: "Title (as published)",
              type: "localizedString",
              validation: (Rule) =>
                Rule.custom((value) => {
                  const v = value as
                    | {mk?: string; en?: string; sr?: string}
                    | undefined;
                  return v?.mk?.trim() || v?.en?.trim() || v?.sr?.trim()
                    ? true
                    : "A title (in at least one language) is required.";
                }),
            }),
            defineField({
              name: "originalAuthor",
              title: "Original author",
              type: "string",
              description: "Leave blank for an anthology / multi-author selection.",
            }),
            defineField({
              name: "fromLang",
              title: "Translated from",
              type: "string",
              options: {list: TRANSLATION_LANGS},
            }),
            defineField({
              name: "toLang",
              title: "Translated into",
              type: "string",
              options: {list: TRANSLATION_LANGS},
            }),
            defineField({
              name: "publisher",
              title: "Publisher (optional)",
              type: "string",
            }),
            defineField({
              name: "year",
              title: "Year (optional)",
              type: "number",
              validation: (Rule) => Rule.integer().min(0).max(2100),
            }),
            defineField({
              name: "kind",
              title: "Kind",
              type: "string",
              options: {
                list: [
                  {title: "Book", value: "book"},
                  {title: "Play", value: "play"},
                  {title: "Anthology", value: "anthology"},
                ],
                layout: "radio",
              },
              initialValue: "book",
            }),
          ],
          preview: {
            select: {title: "title", author: "originalAuthor", from: "fromLang", to: "toLang"},
            prepare: ({title, author, from, to}) => ({
              title: title || "(untitled translation)",
              subtitle: [author, from && to ? `${from} → ${to}` : null]
                .filter(Boolean)
                .join(" · "),
            }),
          },
        }),
      ],
    }),
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
      description:
        "Shown publicly on the Contact page + footer. The site reads the address " +
        "from src/lib/site-links.ts; this field mirrors it for CMS completeness.",
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
