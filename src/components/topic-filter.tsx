import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Shared topic filter (§6.8) — the horizontal row of pill chips above a list
 * page (Reviews and Blog). The first chip is always "All"; each topic chip
 * narrows the list via the SSR `?topic=<slug>` param, so filtering works with
 * JavaScript disabled (the page re-renders server-side from the URL).
 * Presentational and sync: the active chip is derived purely from `activeTopic`.
 * Server component.
 *
 * `basePath` is the locale-relative list route the chips point at (e.g.
 * `/reviews` or `/blog`), so the same component drives both archives. Chips are
 * real links (not buttons) because they navigate; the active one gets
 * `aria-current` for assistive tech, mirroring the caramel-wash active state.
 */
export function TopicFilter({
  basePath,
  topics,
  activeTopic,
  allLabel,
  ariaLabel,
  className,
}: {
  /** Locale-relative list route the chips link to, e.g. `/reviews` or `/blog`. */
  basePath: string;
  topics: { slug: string; label: string }[];
  activeTopic?: string;
  allLabel: string;
  ariaLabel: string;
  className?: string;
}) {
  const base =
    "inline-flex h-8 items-center rounded-pill border px-3 text-eyebrow font-semibold outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
  const inactive =
    "border-primary text-primary-strong hover:bg-[rgb(168_116_55_/_0.12)]";
  const active =
    "border-primary-strong bg-[rgb(168_116_55_/_0.14)] text-primary-strong";

  return (
    <nav aria-label={ariaLabel} className={cn("flex flex-wrap gap-2", className)}>
      <Link
        href={basePath}
        aria-current={!activeTopic ? "true" : undefined}
        className={cn(base, !activeTopic ? active : inactive)}
      >
        {allLabel}
      </Link>
      {topics.map((topic) => {
        const isActive = topic.slug === activeTopic;
        return (
          <Link
            key={topic.slug}
            href={`${basePath}?topic=${encodeURIComponent(topic.slug)}`}
            aria-current={isActive ? "true" : undefined}
            className={cn(base, isActive ? active : inactive)}
          >
            {topic.label}
          </Link>
        );
      })}
    </nav>
  );
}
