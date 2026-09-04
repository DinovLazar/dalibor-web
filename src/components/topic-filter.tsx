import { Link } from "@/i18n/navigation";
import { TopicRail } from "@/components/topic-rail";
import { cn } from "@/lib/utils";

/**
 * Shared topic filter (§6.8) — the row of pill chips above a list page (Reviews
 * and Blog). The first chip is always "All"; each topic chip narrows the list via
 * the SSR `?topic=<slug>` param, so filtering works with JavaScript disabled (the
 * page re-renders server-side from the URL). The active chip is derived purely
 * from `activeTopic`.
 *
 * `basePath` is the locale-relative list route the chips point at (e.g.
 * `/reviews` or `/blog`), so the same component drives both archives. Chips are
 * real links (not buttons) because they navigate; the active one gets
 * `aria-current` for assistive tech, mirroring the caramel-wash active state.
 *
 * **Phase 3.01 — the row becomes a rail on a phone.** Wrapped, this block was
 * 312px tall at 375px (12 chips, and "Постјугословенска книжевност" alone is
 * 277px wide), which pushed the first review 737px down the page — past the fold,
 * twice over. Below `sm` the `.chip-rail` class turns it into a single
 * snap-scrolling row with a right-edge fade, taking ~56px instead. At `sm` and up
 * `.chip-rail` is exactly `flex flex-wrap gap-2`, so the desktop row is unchanged.
 *
 * The chips are 36px tall on a phone (the label grew to 14px via `text-chip`) and
 * carry `tap-target`, which grows the *hit* area to 44×44 under `pointer: coarse`
 * without changing the painted pill. Horizontally they are separated by the 8px
 * rail gap plus 24px of pill padding, so neighbouring hit areas do not overlap.
 *
 * Only the `<nav>` wrapper is a client island ({@link TopicRail}), and only so
 * that the active chip can be scrolled into view on arrival; the chips themselves
 * stay server-rendered.
 */
export function TopicFilter({
  /** Locale-relative list route the chips link to, e.g. `/reviews` or `/blog`. */
  basePath,
  topics,
  activeTopic,
  allLabel,
  ariaLabel,
  className,
}: {
  basePath: string;
  topics: { slug: string; label: string }[];
  activeTopic?: string;
  allLabel: string;
  ariaLabel: string;
  className?: string;
}) {
  const base =
    "tap-target inline-flex h-8 shrink-0 items-center rounded-pill border px-3 text-chip whitespace-nowrap outline-none transition-colors max-sm:h-9 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
  const inactive =
    "border-primary text-primary-strong hover:bg-[rgb(168_116_55_/_0.12)]";
  const active =
    "border-primary-strong bg-[rgb(168_116_55_/_0.14)] text-primary-strong";

  return (
    <TopicRail ariaLabel={ariaLabel} className={cn("chip-rail", className)}>
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
    </TopicRail>
  );
}
