import {defineArrayMember, defineField, defineType} from "sanity";

/**
 * Shared Portable Text type used by every localized rich-text field
 * (`localizedBlockContent` -> post.body, review.body, book.description,
 * author.bio).
 *
 * Styles: normal + h2–h4 + blockquote · lists: bullet + numbered ·
 * marks: strong / em / link.
 *
 * There is intentionally NO custom drop-cap block. The drop cap is a
 * render-time CSS `::first-letter` treatment applied by the page templates
 * (handover §3.6 / §10), not editor content — see the 1.05 report.
 */
export const blockContent = defineType({
  name: "blockContent",
  title: "Rich text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        {title: "Normal", value: "normal"},
        {title: "Heading 2", value: "h2"},
        {title: "Heading 3", value: "h3"},
        {title: "Heading 4", value: "h4"},
        {title: "Quote", value: "blockquote"},
      ],
      lists: [
        {title: "Bullet", value: "bullet"},
        {title: "Numbered", value: "number"},
      ],
      marks: {
        decorators: [
          {title: "Strong", value: "strong"},
          {title: "Emphasis", value: "em"},
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              defineField({
                name: "href",
                type: "url",
                title: "URL",
                validation: (Rule) =>
                  Rule.uri({scheme: ["http", "https", "mailto", "tel"]}),
              }),
            ],
          }),
        ],
      },
    }),
  ],
});
