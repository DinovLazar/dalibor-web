import {defineField, defineType} from "sanity";

/**
 * Field-level (per-language) localization is modelled as a plain object with
 * `mk` / `en` / `sr` subfields — deliberately NOT the
 * `sanity-plugin-internationalized-array` plugin.
 *
 * Why (recorded in the 1.05 completion report): this content model localizes
 * rich text (`body`, `description`, `bio`) as well as strings, and the phase
 * rule is "pick ONE localization approach, do not mix". The internationalized
 * -array plugin (v5) only wraps simple field types (string/text/image/…), not
 * Portable Text, so the one uniform mechanism that also covers `body` is this
 * object shape. Graceful fallback (mk -> en -> sr) lives in
 * `src/sanity/lib/localize.ts`.
 */

export type LocalizedStringValue = { mk?: string; en?: string; sr?: string };

/** Validation predicate: the Macedonian (default-locale) value must be present. */
export const requireMk = (value: unknown): true | string =>
  (value as LocalizedStringValue | undefined)?.mk?.trim()
    ? true
    : "A Macedonian (mk) value is required — it is the default language and the fallback source.";

export const localizedString = defineType({
  name: "localizedString",
  title: "Localized string",
  type: "object",
  options: {collapsible: true, collapsed: false},
  fields: [
    defineField({name: "mk", title: "Macedonian (mk)", type: "string"}),
    defineField({name: "en", title: "English (en)", type: "string"}),
    defineField({name: "sr", title: "Serbian (sr)", type: "string"}),
  ],
});

export const localizedText = defineType({
  name: "localizedText",
  title: "Localized text",
  type: "object",
  options: {collapsible: true, collapsed: false},
  fields: [
    defineField({name: "mk", title: "Macedonian (mk)", type: "text", rows: 3}),
    defineField({name: "en", title: "English (en)", type: "text", rows: 3}),
    defineField({name: "sr", title: "Serbian (sr)", type: "text", rows: 3}),
  ],
});

export const localizedBlockContent = defineType({
  name: "localizedBlockContent",
  title: "Localized rich text",
  type: "object",
  options: {collapsible: true, collapsed: false},
  fields: [
    defineField({name: "mk", title: "Macedonian (mk)", type: "blockContent"}),
    defineField({name: "en", title: "English (en)", type: "blockContent"}),
    defineField({name: "sr", title: "Serbian (sr)", type: "blockContent"}),
  ],
});

/**
 * Reusable image with hotspot + a localized `alt` that is required once an image
 * is set (accessibility). One image asset, three alts.
 */
export const localizedImage = defineType({
  name: "localizedImage",
  title: "Image",
  type: "image",
  options: {hotspot: true},
  fields: [
    defineField({
      name: "alt",
      title: "Alternative text (per language)",
      type: "localizedString",
      description:
        "Required once an image is uploaded. Describe the image for screen-reader users and SEO.",
      validation: (Rule) =>
        Rule.custom((alt, context) => {
          const parent = context.parent as { asset?: { _ref?: string } } | undefined;
          if (parent?.asset?._ref) {
            const value = alt as LocalizedStringValue | undefined;
            if (!value?.mk?.trim()) {
              return "Alt text (at least Macedonian) is required when an image is set.";
            }
          }
          return true;
        }),
    }),
  ],
});
