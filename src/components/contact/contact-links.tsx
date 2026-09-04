import { ExternalLinkIcon, MailIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { siteLinks } from "@/lib/site-links";
import { cn } from "@/lib/utils";

/**
 * ContactLinks (§7.8) — Dalibor's links beside the form, a richer presentation of
 * the same data the footer reads from `@/lib/site-links` (the single source of
 * truth — no hardcoded URLs here). Each row pairs an icon with a localized name +
 * one-line description (the §4 `links.*Desc` strings).
 *
 * The email is a live `mailto:` link (un-inerted in 2.01b, confirmed public in
 * intake §7). Interviews render as a small list of the three media links. External
 * links open in a new tab with `rel="noopener noreferrer"`. Server component.
 */
const EXTERNAL = [
  { key: "instagram", href: siteLinks.instagram, Icon: InstagramIcon },
  { key: "facebook", href: siteLinks.facebook, Icon: FacebookIcon },
  { key: "booksa", href: siteLinks.booksa, Icon: ExternalLinkIcon },
] as const;

// 44px minimum on touch: these rows were 24-33px tall and stacked, so their
// granted hit areas overlapped and stole each other's taps (Phase 3.01).
const ROW = "flex items-start gap-3 py-1.5 max-sm:min-h-11 max-sm:items-center max-sm:py-2.5";
const LINK_ROW = cn(
  ROW,
  "group -mx-1.5 rounded-md px-1.5 outline-none transition-colors",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
);

export async function ContactLinks({ className }: { className?: string }) {
  const t = await getTranslations("contact.links");

  return (
    <div className={className}>
      <h2 className="font-display text-h3 text-text">{t("heading")}</h2>

      <ul className="mt-5 flex flex-col gap-1">
        {/* Email — live mailto (un-inerted in 2.01b; shown publicly per intake §7). */}
        <li>
          <a href={`mailto:${siteLinks.email}`} className={LINK_ROW}>
            <MailIcon
              className="mt-0.5 size-5 shrink-0 text-primary-strong"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span className="flex flex-col">
              <span className="text-body font-medium text-primary-strong group-hover:underline">
                {t("email")}
              </span>
              <span className="text-meta text-text-muted">
                {siteLinks.email}
              </span>
            </span>
          </a>
        </li>

        {EXTERNAL.map(({ key, href, Icon }) => (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_ROW}
            >
              <Icon
                className="mt-0.5 size-5 shrink-0 text-primary-strong"
                strokeWidth={1.75}
              />
              <span className="flex flex-col">
                <span className="text-body font-medium text-primary-strong group-hover:underline">
                  {t(key)}
                </span>
                <span className="text-meta text-text-muted">
                  {t(`${key}Desc`)}
                </span>
              </span>
            </a>
          </li>
        ))}

        {/* Interviews — a small list of media appearances (intake §8). */}
        <li className={ROW}>
          <YoutubeIcon
            className="mt-0.5 size-5 shrink-0 text-primary-strong"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span className="flex flex-col">
            <span className="text-body font-medium text-text">
              {t("interviews")}
            </span>
            <span className="text-meta text-text-muted">
              {t("interviewsDesc")}
            </span>
            <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 max-sm:gap-y-5">
              {siteLinks.interviews.map((href, i) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "tap-target inline-flex items-center rounded-sm text-meta font-medium text-primary-strong outline-none hover:underline",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  )}
                >
                  {t("interviewItem", { n: i + 1 })}
                </a>
              ))}
            </span>
          </span>
        </li>
      </ul>
    </div>
  );
}
