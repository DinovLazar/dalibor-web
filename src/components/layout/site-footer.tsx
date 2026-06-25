import { ExternalLinkIcon, MailIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/brand-icons";
import { Container } from "@/components/layout/container";
import { siteLinks } from "@/lib/site-links";
import { cn } from "@/lib/utils";

const FOOTER_LINK =
  "inline-flex w-fit items-center gap-2 rounded-sm py-[5px] text-[0.9375rem] text-on-footer/[88%] transition-colors hover:text-on-footer hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-footer";

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
      <ul className="flex flex-col">{children}</ul>
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
      <Container className="pb-12 pt-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
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

        <div className="mt-9 flex flex-col gap-2 border-t border-on-footer/20 pt-5 text-[0.875rem] text-on-footer/80 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year })}</p>
          <Link
            href="/privacy"
            className={cn(
              "inline-flex min-h-[24px] w-fit items-center rounded-sm transition-colors hover:text-on-footer hover:underline",
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
