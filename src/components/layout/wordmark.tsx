"use client";

import { useReducedMotion } from "framer-motion";

import { Link } from "@/i18n/navigation";
import { ShineOverlay } from "@/components/ui/shiny-button";

/**
 * Header wordmark (§6.3, Phase 2.15). Stays a single locale-aware `<a href="/">`
 * that navigates home in the active locale, with unchanged text, typography and
 * focus ring. On hover / keyboard focus a subtle caramel foil glint sweeps across
 * "Dalibor Plečić"; the glint is a decorative, aria-hidden, pointer-events-none
 * overlay driven by CSS from the link's own `:hover` / `:focus-visible` (the `group`
 * class), so the accessible name and click target are untouched and the effect
 * never fights the focus ring.
 *
 * Under `prefers-reduced-motion` the overlay is dropped entirely — the WCAG 2.2 AA
 * gate (framer's `useReducedMotion()`; the global reduced-motion CSS is a backstop).
 * `text` is passed in from the server header so this island carries no i18n lookup.
 *
 * `relative` + `group` are added to the original class list so the absolutely
 * positioned glint has a containing block and a hover/focus trigger; every other
 * class is preserved verbatim.
 */
const WORDMARK_CLASSES =
  "group relative shrink-0 whitespace-nowrap font-display text-[1.25rem] font-semibold text-text outline-none focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function Wordmark({ text }: { text: string }) {
  const reduce = useReducedMotion();

  return (
    <Link href="/" className={WORDMARK_CLASSES}>
      {text}
      {!reduce && <ShineOverlay>{text}</ShineOverlay>}
    </Link>
  );
}
