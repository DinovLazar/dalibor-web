import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Home section head (§6.15): an eyebrow over an H2, with an optional "see all"
 * link aligned to the H2 baseline on the right. Presentational.
 *
 * Phase 3.01: below `sm` the inline link is dropped and the head stacks. At 375px
 * it was a 127×23 target — under half the WCAG 2.2 target size, and competing
 * with the H2 for one row while both were being squeezed. On a phone the section
 * ends with a full-width 48px button instead (rendered by the list that owns it,
 * so the control sits after the content it continues, which is where a thumb
 * already is). The desktop head is unchanged.
 */
export function SectionHeading({
  eyebrow,
  title,
  link,
}: {
  eyebrow: string;
  title: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4 max-sm:mb-5">
      <div>
        <p className="eyebrow text-eyebrow uppercase text-primary-strong">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-display text-h2 text-text">{title}</h2>
      </div>
      {link ? (
        <Link
          href={link.href}
          className={cn(
            "shrink-0 whitespace-nowrap text-meta font-medium text-primary-strong outline-none",
            "max-sm:hidden hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          )}
        >
          {link.label} <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}
