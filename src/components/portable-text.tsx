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
      <h2 className="mt-10 font-display text-h2 text-text first:mt-0 max-sm:text-[1.625rem]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 font-display text-h3 text-text first:mt-0">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-6 font-display text-h4 text-text first:mt-0">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-[3px] border-primary pl-6 font-display text-h3 font-medium italic text-text first:mt-0">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-[1em] list-disc space-y-[0.4em] pl-5 text-body text-text marker:text-primary">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-[1em] list-decimal space-y-[0.4em] pl-5 text-body text-text marker:font-medium marker:text-text-muted">
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
  className,
}: {
  value?: PortableTextValue | null;
  className?: string;
}) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  return (
    <div className={cn("max-w-prose text-body text-text", className)}>
      <PortableTextReact value={value} components={components} />
    </div>
  );
}
