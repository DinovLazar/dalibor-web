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
 * truth — no hardcoded URLs here; provisional until 2.01). Each row pairs an icon
 * with a localized name + one-line description (the §4 `links.*Desc` strings).
 *
 * The email slot is rendered but inert until the address lands in 2.02 — it shows
 * as static text (no `mailto:`), and only becomes a link once `siteLinks.email` is
 * filled. External links open in a new tab with `rel="noopener noreferrer"`.
 * Server component.
 */
const EXTERNAL = [
  { key: "instagram", href: siteLinks.instagram, Icon: InstagramIcon },
  { key: "facebook", href: siteLinks.facebook, Icon: FacebookIcon },
  { key: "booksa", href: siteLinks.booksa, Icon: ExternalLinkIcon },
  { key: "interviews", href: siteLinks.interview, Icon: YoutubeIcon },
] as const;

const ROW = "flex items-start gap-3 py-1.5";

export async function ContactLinks({ className }: { className?: string }) {
  const t = await getTranslations("contact.links");

  return (
    <div className={className}>
      <h2 className="font-display text-h3 text-text">{t("heading")}</h2>

      <ul className="mt-5 flex flex-col gap-1">
        {/* Email — rendered but inert until 2.02 (no address yet). */}
        <li className={ROW}>
          <MailIcon
            className="mt-0.5 size-5 shrink-0 text-text-muted"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span className="flex flex-col">
            <span className="text-body font-medium text-text">
              {t("email")}
            </span>
            <span className="text-meta text-text-muted">{t("emailDesc")}</span>
          </span>
        </li>

        {EXTERNAL.map(({ key, href, Icon }) => (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                ROW,
                "group -mx-1.5 rounded-md px-1.5 outline-none transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              )}
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
      </ul>
    </div>
  );
}
