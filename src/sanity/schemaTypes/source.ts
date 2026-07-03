import {defineField} from "sanity";

/**
 * The shared "first published on …" attribution field. Reviews and blog posts
 * both originate from a third-party outlet (Booksa, Beton, The Literary Review,
 * …); this object carries the outlet name + a link to the original piece so the
 * site can render a quiet "first published on <outlet>" credit.
 *
 * Factored out (like `localizedSlug()`) so `review` and `post` share ONE
 * definition and can never drift. `sourceName` + `sourceUrl` are both optional;
 * the UI only renders the credit when at least one is set.
 */
export function sourceField() {
  return defineField({
    name: "source",
    title: "First published on (attribution)",
    type: "object",
    description:
      "The \"first published on …\" credit + link to the original. `sourceName` is " +
      "the outlet (e.g. Booksa, Beton, The Literary Review); `sourceUrl` links the " +
      "original. This is the firstPublished attribution — there is no separate field.",
    options: {collapsible: true, collapsed: true},
    fields: [
      defineField({
        name: "sourceName",
        title: "Outlet (publication name)",
        type: "string",
        description: "e.g. Booksa, Beton, The Literary Review.",
      }),
      defineField({
        name: "sourceUrl",
        title: "Original URL",
        type: "url",
        validation: (Rule) => Rule.uri({scheme: ["http", "https"]}),
      }),
    ],
  });
}
