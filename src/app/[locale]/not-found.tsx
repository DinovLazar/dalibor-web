import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { buttonVariants } from "@/components/ui/button";
import { primaryNav } from "@/lib/nav";

/**
 * Localized 404 (Phase 1.12). Rendered inside the `[locale]` layout, so it keeps
 * the Style A chrome (header/footer) and the correct `<html lang>`; the copy is
 * localized via the `notFound` message namespace (resolved from the request
 * locale set by the layout). Next returns an HTTP 404 for this boundary — the
 * authoritative "don't index" signal — and we additionally emit a `noindex`
 * robots tag (React 19 hoists it into <head>) so the intent is explicit.
 *
 * `not-found.tsx` cannot export `generateMetadata`, which is why the robots tag
 * is rendered inline rather than via the Metadata API.
 */
export default async function NotFound() {
  const t = await getTranslations("notFound");
  const tNav = await getTranslations("nav");

  // Everything except Home — the primary CTA below already covers it.
  const suggestions = primaryNav.filter((item) => item.href !== "/");

  return (
    <Section>
      <meta name="robots" content="noindex, nofollow" />
      <Container className="max-w-prose">
        <PageHeader title={t("title")} description={t("body")} />
        <div className="mt-8">
          <Link href="/" className={buttonVariants({ variant: "default" })}>
            {t("cta")}
          </Link>
        </div>

        {/* A dead end is a bad 404. The rest of the nav set is offered inline so
            the page is a way back rather than just an apology. Read from
            `@/lib/nav`, so a future nav change flows through here too. */}
        <nav aria-labelledby="notfound-explore" className="mt-10">
          <h2
            id="notfound-explore"
            className="text-eyebrow uppercase text-primary-strong eyebrow"
          >
            {t("explore")}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {suggestions.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  /* inline-block + py-1 lifts the hit area past the 24px floor
                     of WCAG 2.2 SC 2.5.8 (bare inline text lands at 23px). */
                  className="inline-block rounded-sm py-1 text-body text-primary-strong underline underline-offset-4 outline-none transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </Section>
  );
}
