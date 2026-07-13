"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Style A "gold-foil" shimmer, adapted from the 21st.dev ShinyButton (Phase 2.15).
 * Departures from the original: no dark-mode variants, the shine is our caramel
 * accent (`var(--color-primary)`) rather than a themed HSL primary, and it plays a
 * single hover / keyboard-focus sweep instead of an infinite loop.
 *
 * The sweep is a one-shot CSS keyframe (`wordmark-shine`, in globals.css) driven by
 * the parent's `:hover` / `:focus-visible` via Tailwind's `group-*` variants —
 * chosen over framer's value animation, which did not reliably tween here. framer's
 * `useReducedMotion()` is still the accessibility gate: under reduced motion the
 * consumer drops the overlay entirely (and the global reduced-motion CSS would
 * disable the keyframe anyway).
 */

// Warm caramel → soft-gold → caramel band, positioned by the registered
// `--wordmark-shine-x` custom property. `#EAD1A0` is a muted gold, not white, so the
// peak reads as foil rather than a flash (Style A stays restrained).
const shineImage =
  "linear-gradient(-75deg," +
  "transparent calc(var(--wordmark-shine-x) + 22%)," +
  "var(--color-primary) calc(var(--wordmark-shine-x) + 44%)," +
  "#EAD1A0 calc(var(--wordmark-shine-x) + 50%)," +
  "var(--color-primary) calc(var(--wordmark-shine-x) + 56%)," +
  "transparent calc(var(--wordmark-shine-x) + 78%))";

// Runs the one-shot sweep when the nearest `group` ancestor is hovered or receives
// a visible (keyboard) focus. `[animation:…]` underscores render as spaces.
const shineTrigger =
  "group-hover:[animation:wordmark-shine_0.85s_ease-in-out] " +
  "group-focus-visible:[animation:wordmark-shine_0.85s_ease-in-out]";

/**
 * The foil highlight, clipped to the text glyphs. Decorative only: `aria-hidden` +
 * `pointer-events-none` so it never joins the accessible name or intercepts clicks.
 * It duplicates the text (transparent, clipped to the gradient) purely to shape the
 * glint — the real, always-legible text lives in the sibling it sits over. Requires
 * a `group`-classed ancestor to trigger.
 */
export function ShineOverlay({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      style={{ backgroundImage: shineImage }}
      className={cn(
        "pointer-events-none absolute inset-0 select-none bg-clip-text text-transparent",
        shineTrigger,
        className,
      )}
    >
      {children}
    </span>
  );
}

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable primitive: a button that glints on hover / keyboard focus. Not mounted
 * anywhere yet — the header wordmark composes {@link ShineOverlay} directly onto its
 * locale-aware link (a link can't be a button) — but this keeps the effect available
 * as a general-purpose surface. `group` on the button drives the child's sweep.
 */
export function ShinyButton({ children, className, ...props }: ShinyButtonProps) {
  const reduce = useReducedMotion();

  return (
    <button
      type="button"
      className={cn(
        "group relative inline-block rounded-lg px-6 py-2 text-sm font-medium",
        className,
      )}
      {...props}
    >
      {children}
      {!reduce && (
        <ShineOverlay className="px-6 py-2">{children}</ShineOverlay>
      )}
    </button>
  );
}
