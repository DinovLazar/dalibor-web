"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// Two-letter display labels per design §6.4 (script-agnostic: a future Serbian
// Cyrillic flip would not change these codes).
const LOCALE_LABELS: Record<string, string> = {
  mk: "MK",
  en: "EN",
  sr: "SR",
};

/**
 * Language switcher — MK · EN · SR inline toggles (design §6.4).
 *
 * Restyled into the 1.06 Style A header but the 1.04 routing logic is unchanged:
 * it uses next-intl's `usePathname` + `Link` so switching language preserves the
 * current path (e.g. /en/reviews ↔ /mk/reviews). The active locale is real text
 * (not a link) with `aria-current`; the others are keyboard-focusable links with
 * a visible focus ring. `onNavigate` lets the mobile menu close on switch.
 */
export function LanguageSwitcher({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const activeLocale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("common");

  return (
    <nav aria-label={t("languageSwitcherLabel")} className={cn(className)}>
      <ul className="flex items-center text-meta">
        {routing.locales.map((locale, index) => {
          const isActive = locale === activeLocale;

          return (
            <li key={locale} className="flex items-center">
              {index > 0 && (
                <span aria-hidden="true" className="text-border-strong">
                  ·
                </span>
              )}
              {isActive ? (
                <span
                  aria-current="true"
                  className="px-2 py-1.5 font-semibold text-text"
                >
                  {LOCALE_LABELS[locale]}
                </span>
              ) : (
                <Link
                  href={pathname}
                  locale={locale}
                  onClick={onNavigate}
                  className="rounded-sm px-2 py-1.5 font-medium text-text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  {LOCALE_LABELS[locale]}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
