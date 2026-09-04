"use client";

import * as React from "react";

/**
 * The scrolling shell around the topic chips (Phase 3.01, §6.8).
 *
 * Below `sm` the chip row stops wrapping and becomes a single snap-scrolling
 * rail (`.chip-rail` in globals.css). That is pure CSS — this island exists for
 * one reason only: when the reader arrives on `/reviews?topic=…` the active chip
 * can be anywhere along a row that is several screens wide, so it has to be
 * brought into view or the page looks unfiltered.
 *
 * `inline: "center"` centres it in the rail; `block: "nearest"` is what stops the
 * browser from also scrolling the *page* to reach it — without that, landing on a
 * filtered URL would jump you past the heading. `behavior: "auto"` because this
 * is a starting position, not a transition: animating it would be motion the
 * reader did not ask for, which is also why there is nothing here for
 * `prefers-reduced-motion` to disable.
 *
 * A Server Component renders the chips; only this wrapper is client code, so the
 * filter still works with JavaScript off — the chips are plain links and the
 * rail is still scrollable by touch.
 */
export function TopicRail({
  ariaLabel,
  className,
  children,
}: {
  ariaLabel: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    // Only when the rail actually scrolls — at `sm` and up it is a wrapped row
    // and scrolling it would be meaningless.
    if (rail.scrollWidth <= rail.clientWidth) return;
    rail
      .querySelector<HTMLElement>('[aria-current]')
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "auto" });
  }, []);

  return (
    <nav ref={ref} aria-label={ariaLabel} className={className}>
      {children}
    </nav>
  );
}
