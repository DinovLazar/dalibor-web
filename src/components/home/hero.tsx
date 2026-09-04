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
 *  - **Typographic-only** (no portrait uploaded): a centered column — name,
 *    tagline, optional intro, a title-page double rule, then two CTAs.
 *  - **Photo-present**: text beside a 4:5 portrait on desktop; on a phone the
 *    portrait leads, full-bleed, with the words underneath.
 * The CTAs lead into Reviews (primary) and About (secondary).
 *
 * **Phase 3.01 — the phone hero is an opening image, not an inset card.** It was
 * 743px tall for a name, one line of tagline and two buttons, and the portrait
 * was a 335×419 card floating on cream with a 20px gutter either side, which
 * read as a stray element rather than the start of the page. Below `sm` the
 * portrait now goes edge-to-edge at 3:4 directly under the header (radius 0, no
 * shadow — there is nothing to lift when an image touches both edges), and a
 * parchment band carries the name, tagline and CTAs beneath it. Desktop is
 * untouched.
 *
 * **Source resolution.** The portrait in Sanity is 720×720, cropped by the editor
 * to 576×720, so 576×720 is the largest honest rendition and that is exactly what
 * is requested — the previous `.width(800).height(1000)` was asking for pixels
 * that do not exist. A full-bleed phone hero wants ≥1290×1720 for a 430px screen
 * at 3×, so this image is the limiting factor and a higher-resolution portrait is
 * needed from the author (see the Phase 3.01 completion report). `crop("focalpoint")`
 * makes the CDN honour the asset's hotspot when one is set, and fall back to the
 * centre when it is not, instead of blindly trimming from the left edge.
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

  /**
   * Both CTAs are the same size and prominence on a phone (§2.5 still governs
   * colour: the primary is the deep-caramel fill, the secondary the caramel
   * outline — caramel never hosts text). Below the 420px `xs` breakpoint they
   * stack full-width; from there to `sm` they sit side by side at equal width.
   * The brief asked for the split at 380px; `xs` is the breakpoint this design
   * system already owns, and 420px is where two Macedonian labels stop fitting.
   */
  const ctas = (
    <div
      className={cn(
        "flex flex-wrap gap-4",
        "max-sm:grid max-sm:grid-cols-1 max-sm:gap-3 xs:max-sm:grid-cols-2",
        photo ? "justify-start" : "justify-center",
      )}
    >
      <Link
        href="/reviews"
        className={cn(buttonVariants({ variant: "default" }), "max-sm:h-12 max-sm:w-full")}
      >
        {t("home.readReviews")}
      </Link>
      <Link
        href="/about"
        className={cn(buttonVariants({ variant: "outline" }), "max-sm:h-12 max-sm:w-full")}
      >
        {t("nav.about")}
      </Link>
    </div>
  );

  if (photo) {
    const alt = localizedValue(photo.alt, locale) ?? name;
    return (
      <section className={className}>
        <Container className="grid items-center gap-10 py-16 max-sm:gap-0 max-sm:py-0 md:grid-cols-[1.1fr_0.9fr]">
          {/* Words. On a phone this is the parchment band under the photo, so it
              re-supplies the gutter that `full-bleed` just cancelled. */}
          <div className="max-sm:band-parchment max-sm:full-bleed max-sm:page-gutter max-sm:py-8">
            <h1 className="font-display text-display text-text">{name}</h1>
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

          {/* Portrait — the LCP element. `priority` gives it the preload and eager
              loading; `fetchPriority` is set explicitly because Next does not put
              it on the <img> itself. The box has a fixed aspect ratio at both
              sizes, so it reserves its own space and contributes no CLS. */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-image shadow-cover max-sm:order-first max-sm:aspect-[3/4] max-sm:full-bleed max-sm:shadow-none">
            <Image
              src={urlForImage(photo)
                .width(576)
                .height(720)
                .fit("crop")
                .crop("focalpoint")
                .auto("format")
                .url()}
              alt={alt}
              fill
              sizes="(max-width: 639px) 100vw, 40vw"
              className="object-cover"
              priority
              fetchPriority="high"
            />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className={className}>
      <Container className="pt-32 pb-20 text-center max-sm:pt-16 max-sm:pb-12">
        <h1 className="font-display text-display text-text">{name}</h1>
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
