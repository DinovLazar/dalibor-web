import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { urlForImage } from "@/sanity/lib/image";
import { localizedValue } from "@/sanity/lib/localize";
import type { HOME_HERO_QUERY_RESULT } from "@/sanity/sanity.types";
import { cn } from "@/lib/utils";

/**
 * Home hero (§7.1). Two variants on one `<h1>` (the name):
 *  - **Typographic-only** (launch state, no portrait yet): a centered column —
 *    name, tagline, optional intro, a title-page double rule, then two CTAs.
 *  - **Photo-present** (when the author uploads a portrait in Part 2): a two-
 *    column layout, text left + 4:5 portrait right, stacking on mobile.
 * The CTAs lead into Reviews (primary) and About (secondary).
 */
export async function Hero({
  hero,
  locale,
  className,
}: {
  hero: HOME_HERO_QUERY_RESULT;
  locale: string;
  className?: string;
}) {
  const t = await getTranslations();
  const name = localizedValue(hero?.name, locale) ?? t("common.siteName");
  const tagline = localizedValue(hero?.tagline, locale) ?? t("home.title");
  const heroIntro = localizedValue(hero?.heroIntro, locale);
  const photo = hero?.photo?.asset ? hero.photo : null;

  const ctas = (
    <div
      className={cn(
        "flex flex-wrap gap-4",
        photo ? "justify-start" : "justify-center",
      )}
    >
      <Link href="/reviews" className={buttonVariants({ variant: "default" })}>
        {t("home.readReviews")}
      </Link>
      <Link href="/about" className={buttonVariants({ variant: "outline" })}>
        {t("nav.about")}
      </Link>
    </div>
  );

  if (photo) {
    const alt = localizedValue(photo.alt, locale) ?? name;
    return (
      <section className={className}>
        <Container className="grid items-center gap-10 py-16 max-sm:py-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="font-display text-display text-text max-sm:text-[2.5rem]">
              {name}
            </h1>
            <p className="mt-3 max-w-[30rem] text-body-lg text-text-muted">
              {tagline}
            </p>
            {heroIntro ? (
              <p className="mt-3 max-w-[30rem] text-body text-text-muted">
                {heroIntro}
              </p>
            ) : null}
            <div className="mt-6">{ctas}</div>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-image shadow-cover">
            <Image
              src={urlForImage(photo).width(800).height(1000).auto("format").url()}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
              priority
            />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className={className}>
      <Container className="pt-32 pb-20 text-center max-sm:pt-16 max-sm:pb-12">
        <h1 className="font-display text-display text-text max-sm:text-[2.5rem]">
          {name}
        </h1>
        <p className="mx-auto mt-3.5 max-w-[34rem] text-body-lg text-text-muted">
          {tagline}
        </p>
        {heroIntro ? (
          <p className="mx-auto mt-3 max-w-[34rem] text-body text-text-muted">
            {heroIntro}
          </p>
        ) : null}

        {/* Title-page double rule (§6.16): 2px caramel over a 1px hairline. */}
        <div
          aria-hidden
          className="relative mx-auto my-8 h-0 w-24 border-t-2 border-primary"
        >
          <span className="absolute inset-x-0 top-[3px] block border-t border-border" />
        </div>

        {ctas}
      </Container>
    </section>
  );
}
