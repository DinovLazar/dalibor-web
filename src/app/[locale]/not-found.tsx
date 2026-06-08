import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { buttonVariants } from "@/components/ui/button";

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
      </Container>
    </Section>
  );
}
