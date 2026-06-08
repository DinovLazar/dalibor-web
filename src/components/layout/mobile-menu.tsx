"use client";

import * as React from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { LazyMotion, m, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/language-switcher";
import { isNavItemActive, primaryNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * Mobile menu (§6.3). A full-width Style A panel that drops over the bar, built on
 * the Sheet primitive (Base UI Dialog → focus trap, Escape, backdrop close, focus
 * returns to the trigger). Controlled so the trigger reflects state via
 * `aria-expanded` and the panel closes on navigation / language switch. The
 * hamburger sits top-right; opening swaps it for the X close in the same corner.
 *
 * Animation uses Framer's `LazyMotion` + the lightweight `m` component (1.12): the
 * DOM animation features load lazily only when the panel first mounts, keeping the
 * full Framer bundle out of the header's upfront JS on every page.
 */
const loadFeatures = () =>
  import("framer-motion").then((mod) => mod.domAnimation);

export function MobileMenu({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const close = React.useCallback(() => setOpen(false), []);

  // Explicit, synchronous focus handling on top of Base UI's focus trap: move
  // focus into the panel on open and back to the trigger on close. Done here
  // (no rAF) so it is deterministic regardless of paint timing; Base UI keeps the
  // focus trapped while open and handles Escape / backdrop close.
  const contentRef = React.useRef<HTMLDivElement>(null);
  const wasOpen = React.useRef(false);
  React.useEffect(() => {
    if (open) {
      wasOpen.current = true;
      // Defer one task so the portalled panel is in the DOM before focusing.
      const id = setTimeout(() => {
        contentRef.current
          ?.querySelector<HTMLElement>('a[href], button:not([disabled])')
          ?.focus();
      }, 0);
      return () => clearTimeout(id);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      document
        .querySelector<HTMLElement>('[data-slot="sheet-trigger"]')
        ?.focus();
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={className}
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("common.openMenu")}
            aria-expanded={open}
          />
        }
      >
        <MenuIcon className="size-6" strokeWidth={1.75} />
      </SheetTrigger>

      {open && (
      <SheetContent side="top" showCloseButton={false} className="gap-0 px-5 pb-6">
        <SheetTitle className="sr-only">{t("common.menu")}</SheetTitle>
        <LazyMotion features={loadFeatures} strict>
        <m.div
          ref={contentRef}
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.2, 0.65, 0.3, 1] }}
          className="flex flex-col"
        >
          {/* Top row mirrors the bar: wordmark left, X (where the hamburger was) right */}
          <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            onClick={close}
            className="font-display text-[1.25rem] font-semibold text-text outline-none focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {t("common.wordmark")}
          </Link>
          <SheetClose
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("common.closeMenu")}
              />
            }
          >
            <XIcon className="size-6" strokeWidth={1.75} />
          </SheetClose>
        </div>

        <Separator />

        <nav aria-label={t("nav.primaryLabel")} className="py-2">
          <ul className="flex flex-col">
            {primaryNav.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-12 items-center border-l-2 pl-3 text-base outline-none transition-colors",
                      active
                        ? "border-primary font-semibold text-primary-strong"
                        : "border-transparent font-medium text-text hover:text-primary-strong",
                      "focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-focus",
                    )}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Separator />

          <div className="flex justify-center pt-4">
            <LanguageSwitcher onNavigate={close} />
          </div>
        </m.div>
        </LazyMotion>
      </SheetContent>
      )}
    </Sheet>
  );
}
