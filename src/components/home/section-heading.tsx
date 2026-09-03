import { Link } from "@/i18n/navigation";

/**
 * Home section head (§6.15): an eyebrow over an H2, with an optional "see all"
 * link aligned to the H2 baseline on the right. Presentational.
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
    <div className="mb-7 flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow text-eyebrow uppercase text-primary-strong">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-display text-h2 text-text">
          {title}
        </h2>
      </div>
      {link ? (
        <Link
          href={link.href}
          className="shrink-0 whitespace-nowrap text-meta font-medium text-primary-strong outline-none hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {link.label} <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}
