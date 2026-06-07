import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Container } from "@/components/layout/container";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { PrimaryNav } from "@/components/layout/primary-nav";

/**
 * Site header (§6.3) — a slim, lightly-sticky bar: cream @ 85% with an 8px blur
 * and a single bottom hairline (no shadow). Server Component shell; interactivity
 * (desktop nav active state, language switch, mobile menu) lives in small client
 * islands. The wordmark is always the Latin "Dalibor Plečić" and links home.
 */
export async function SiteHeader() {
  const t = await getTranslations("common");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[rgb(244_237_225_/_0.85)] backdrop-blur-[8px]">
      <Container className="flex h-14 items-center gap-6 sm:h-16">
        <Link
          href="/"
          className="font-display text-[1.25rem] font-semibold text-text outline-none focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {t("wordmark")}
        </Link>

        <PrimaryNav className="ml-auto hidden sm:block" />
        <LanguageSwitcher className="hidden sm:block" />
        <MobileMenu className="ml-auto sm:hidden" />
      </Container>
    </header>
  );
}
