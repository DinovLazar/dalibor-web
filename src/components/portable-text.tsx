import {
  PortableText as PortableTextReact,
  type PortableTextComponents,
} from "@portabletext/react";
import { ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Shared Style A Portable Text renderer (§3.5, §6.10, §2.2). Locale-agnostic:
 * hand it a single localized block array (resolve the locale with
 * `localizedValue` first) and it renders Style A prose — Playfair headings,
 * Lora body/lists/blockquote at the ~66–72ch reading measure (§3.3), caramel
 * links with a visible focus ring. Server component (no hooks).
 *
 * Reused by About + Book now and by single review / blog / book pages later, so
 * it stays self-contained and styles every block type the `blockContent` schema
 * allows (normal · h2–h4 · blockquote · bullet/number lists · strong/em/link).
 *
 * Opt-in `dropCap` adds the `article-body` class so the first paragraph gets the
 * §3.6 Playfair caramel initial (CSS lives in globals.css); off by default, so
 * About + Book stay unchanged.
 *
 * There is deliberately **no figure / image renderer**: `blockContent` allows a
 * single array member, `type: "block"`, so an editor cannot place an image in a
 * body at all. Adding one would be a renderer for a block type that can never
 * occur. In-article imagery that does exist (the About portrait) is handled by
 * its own page (Phase 3.01).
 *
 * Phase 3.01 tunes the phone rhythm only: heading lead-in tightens (the mobile
 * type scale already grew h2 to 28px, so the old 40px gap over-separated), and
 * the pull-quote and list indents halve — at 375px the container is 335px wide
 * and a 24px indent is measure we cannot spare. Paragraph spacing stays at the
 * §4.1 1em, and body prose stays 18px/1.7 (§3.3) at every width.
 */

/** The value shape `@portabletext/react` accepts (a single block or an array). */
type PortableTextValue = React.ComponentProps<typeof PortableTextReact>["value"];

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-body text-text [&:not(:first-child)]:mt-[1em]">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 font-display text-h2 text-text first:mt-0 max-sm:mt-8">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 font-display text-h3 text-text first:mt-0 max-sm:mt-7">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-6 font-display text-h4 text-text first:mt-0">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-[3px] border-primary pl-6 font-display text-h3 font-medium italic text-text first:mt-0 max-sm:pl-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-[1em] list-disc space-y-[0.4em] pl-5 max-sm:pl-4 text-body text-text marker:text-primary">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-[1em] list-decimal space-y-[0.4em] pl-5 max-sm:pl-4 text-body text-text marker:font-medium marker:text-text-muted">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-1">{children}</li>,
    number: ({ children }) => <li className="pl-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => {
      const href = typeof value?.href === "string" ? value.href : "";
      const external = /^https?:\/\//i.test(href);
      return (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="font-medium text-primary-strong underline decoration-1 underline-offset-2 transition-colors hover:text-primary-hover hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {children}
          {external ? (
            <ExternalLink
              aria-hidden
              className="ml-0.5 inline-block size-4 align-[-0.125em]"
              strokeWidth={1.75}
            />
          ) : null}
        </a>
      );
    },
  },
};

export function PortableText({
  value,
  dropCap = false,
  className,
  lang,
}: {
  value?: PortableTextValue | null;
  /** Opt-in §3.6 drop cap on the first paragraph (adds `.article-body`). */
  dropCap?: boolean;
  className?: string;
  /**
   * BCP-47 language of this content (WCAG 2.2 AA SC 3.1.2). Pass
   * `contentLang(field, locale)` so the attribute is set only when the body is
   * a fallback translation in a language other than the surrounding page.
   */
  lang?: string;
}) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  return (
    <div
      lang={lang}
      className={cn(
        "max-w-prose text-body text-text",
        dropCap && "article-body",
        className,
      )}
    >
      <PortableTextReact value={value} components={components} />
    </div>
  );
}
