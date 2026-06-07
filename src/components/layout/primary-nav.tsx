"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { isNavItemActive, primaryNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * Desktop primary nav (§6.3). Reads the nav set from `@/lib/nav`. The active page
 * carries `aria-current="page"` and a 2px caramel underline 4px below the label;
 * inactive items show the same underline at 60% on hover (never colour-only — the
 * underline + aria-current carry the state).
 */
export function PrimaryNav({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("primaryLabel")} className={cn(className)}>
      <ul className="flex items-center gap-7">
        {primaryNav.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-block py-1 text-base font-medium text-text outline-none transition-colors",
                  "after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity after:duration-150",
                  "hover:after:opacity-60",
                  "aria-[current=page]:after:opacity-100",
                  "focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                )}
              >
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
