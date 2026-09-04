"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Back-to-top control (Phase 3.01, §7.6). A single blog post runs to ~8,100px on
 * a phone — roughly ten screens — so once the reader is two screens down, a
 * thumb-zone control appears to get them back to the top without a long swipe.
 *
 * Deliberately restrained:
 *  - **Phone only.** At `sm` and up the pages are shorter relative to the
 *    viewport and a mouse has the scrollbar, so the button would be clutter.
 *    The `sm:hidden` is on the element, and the scroll listener bails above the
 *    breakpoint so it costs desktop nothing.
 *  - **No motion to reduce.** `.to-top` (globals.css) transitions only opacity
 *    and visibility — never position — and the scroll it performs is instant, so
 *    there is nothing for `prefers-reduced-motion` to switch off and nothing
 *    that can be mistaken for the page moving on its own.
 *  - **Focus follows the scroll.** Jumping the viewport without moving focus
 *    would strand a keyboard user at the bottom of the document, so focus lands
 *    on `<main id="content">` (already `tabIndex={-1}` in the locale layout) —
 *    the same target the skip link uses.
 *
 * Visibility is driven by a `data-visible` attribute rather than React state:
 * the scroll handler then never re-renders the tree, and the whole thing is one
 * rAF-coalesced attribute write per scroll frame.
 */
export function BackToTop() {
  const t = useTranslations("common");
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let queued = false;
    const update = () => {
      queued = false;
      // Two screens down, and only while the control is actually rendered
      // (it is `sm:hidden`, so above 640px `offsetParent` is null).
      const on = el.offsetParent !== null && window.scrollY > window.innerHeight * 2;
      el.dataset.visible = on ? "true" : "false";
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      data-visible="false"
      aria-label={t("backToTop")}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "auto" });
        document.getElementById("content")?.focus();
      }}
      className="to-top grid size-12 place-items-center rounded-pill bg-primary-strong text-on-primary shadow-cover outline-none transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:hidden"
    >
      <ArrowUp className="size-6" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
