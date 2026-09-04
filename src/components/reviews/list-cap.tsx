"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Mobile "show all" cap for the Reviews list (§6.18, Phase 3.01).
 *
 * Twenty review cards is a reasonable desktop archive and an unreasonable phone
 * document: even at the new compact card height it is several thousand pixels of
 * scroll before the footer. Below `sm` the list is capped at the first
 * {@link LIST_CAP} cards with a single 48px control to reveal the rest.
 *
 * Two things make this safe rather than clever:
 *
 *  - **The server renders every card, uncapped.** `data-capped` starts `"false"`
 *    and only an effect turns it on, so a reader with JavaScript disabled sees
 *    the whole list exactly as before, and the first client render matches the
 *    server HTML (no hydration mismatch from probing the viewport).
 *  - **Hidden cards are `display: none`, not visually hidden.** The rule lives in
 *    globals.css, so the hidden cards leave the tab order and the accessibility
 *    tree entirely — a keyboard or screen-reader user cannot land on a card they
 *    cannot see.
 *
 * Once expanded it stays expanded: re-capping on a resize would yank content out
 * from under someone who had already asked for it.
 */
export const LIST_CAP = 12;

export function ListCap({
  total,
  className,
  children,
}: {
  total: number;
  className?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("common");
  const [capped, setCapped] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    if (total <= LIST_CAP) return;
    const mq = window.matchMedia("(width < 40rem)");
    const apply = () => setCapped(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [total]);

  const active = capped && !expanded;

  return (
    <div className={cn("list-cap", className)} data-capped={active ? "true" : "false"}>
      {children}
      {active ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={cn(buttonVariants({ variant: "outline" }), "mt-4 h-12 w-full")}
        >
          {t("showAllReviews", { count: total })}
        </button>
      ) : null}
    </div>
  );
}
