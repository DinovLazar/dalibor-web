import { ExternalLinkIcon, MailIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/brand-icons";
import { Container } from "@/components/layout/container";
import { siteLinks } from "@/lib/site-links";
import { cn } from "@/lib/utils";

/**
 * A footer link. On desktop it is the same `w-fit` inline row it has always been
 * (`text-meta` is 15px there — the literal value this used to hard-code). Below
 * `sm` it becomes a full-width 44px row: at 33px, stacked with no gap, the 44px
 * hit areas the `pointer: coarse` rule grants each link overlapped their
 * neighbours' and the later sibling in paint order stole the taps — so half the
 * footer was measurably unreachable. Real height is the only fix that holds.
 */
const FOOTER_LINK =
  "inline-flex w-fit items-center gap-2 rounded-sm py-[5px] text-meta text-on-footer/[88%] transition-colors max-sm:flex max-sm:min-h-11 max-sm:w-full max-sm:py-2.5 hover:text-on-footer hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-footer";

function FooterGroup({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-3 font-body text-eyebrow font-semibold uppercase tracking-[0.06em] text-on-footer/70">
        {heading}
      </h2>
      <ul className="flex flex-col max-sm:divide-y max-sm:divide-on-footer/20">{children}</ul>
    </div>
  );
}

function FooterExternal({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a href={href} target="_blank" rel="noopener noreferrer" className={FOOTER_LINK}>
        <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span>{children}</span>
      </a>
    </li>
  );
}

/**
 * Site footer (§6.5) — walnut ground, cream text (8.0:1), a 2px caramel top-rule.
 * Reads URLs from `@/lib/site-links` (provisional) and labels from the `footer`
 * message namespace. Four groups, then a hairline + copyright and a Privacy link.
 * Icon links carry visible text (icons are decorative); the focus ring is cream
 * for contrast on walnut. Server Component.
 */
export async function SiteFooter() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-primary bg-footer text-on-footer">
      {/* The walnut band terminates the page, so it is what sits under the home
          indicator: `safe-bottom` adds the inset on top of the designed 48px
          (`--safe-bottom-base`), and resolves to exactly 48px everywhere else. */}
      <Container className="pt-16 pb-0 max-sm:pt-12 [--safe-bottom-base:2.5rem] safe-bottom">
        <div className="grid grid-cols-1 gap-8 max-sm:gap-7 sm:grid-cols-2 md:grid-cols-4">
          <FooterGroup heading={t("contactHeading")}>
            {/* Live mailto — un-inerted in 2.01b (shown publicly per intake §7). */}
            <li>
              <a href={`mailto:${siteLinks.email}`} className={FOOTER_LINK}>
                <MailIcon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>{siteLinks.email}</span>
              </a>
            </li>
          </FooterGroup>

          <FooterGroup heading={t("socialHeading")}>
            <FooterExternal href={siteLinks.instagram} icon={InstagramIcon}>
              {t("instagram")}
            </FooterExternal>
            <FooterExternal href={siteLinks.facebook} icon={FacebookIcon}>
              {t("facebook")}
            </FooterExternal>
          </FooterGroup>

          <FooterGroup heading={t("writingHeading")}>
            <FooterExternal href={siteLinks.booksa} icon={ExternalLinkIcon}>
              {t("booksa")}
            </FooterExternal>
            <FooterExternal href={siteLinks.versopolis} icon={ExternalLinkIcon}>
              {t("versopolis")}
            </FooterExternal>
            <FooterExternal href={siteLinks.partizanska} icon={ExternalLinkIcon}>
              {t("partizanska")}
            </FooterExternal>
          </FooterGroup>

          <FooterGroup heading={t("interviewsHeading")}>
            {siteLinks.interviews.map((href, i) => (
              <FooterExternal key={href} href={href} icon={YoutubeIcon}>
                {t("interview", { n: i + 1 })}
              </FooterExternal>
            ))}
          </FooterGroup>
        </div>

        <div className="mt-9 flex flex-col gap-2 border-t border-on-footer/20 pt-5 text-[0.875rem] text-on-footer/80 max-sm:mt-7 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year })}</p>
          <Link
            href="/privacy"
            className={cn(
              "inline-flex min-h-[24px] w-fit items-center rounded-sm transition-colors max-sm:min-h-11 max-sm:w-full",
              "hover:text-on-footer hover:underline",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-footer",
            )}
          >
            {t("privacy")}
          </Link>
        </div>
      </Container>
    </footer>
  );
}
