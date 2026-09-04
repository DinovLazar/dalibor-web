import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ReviewCard } from "@/components/home/review-card";
import { SectionHeading } from "@/components/home/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HOME_REVIEWS_QUERY_RESULT } from "@/sanity/sanity.types";

/**
 * Home "Latest reviews" (§7.1.3) — the 3 most recent reviews as a single column
 * of horizontal review cards (the row IS the unit; not gridded), with a "see all
 * reviews" link through to the Reviews list — an inline link beside the heading
 * on desktop, a full-width 48px button after the list on a phone (Phase 3.01).
 */
export async function LatestReviews({
  reviews,
  locale,
  className,
}: {
  reviews: HOME_REVIEWS_QUERY_RESULT;
  locale: string;
  className?: string;
}) {
  if (!reviews.length) return null;
  const t = await getTranslations("home");

  return (
    <Section className={className}>
      <Container>
        <SectionHeading
          eyebrow={t("latestEyebrow")}
          title={t("reviewsHeading")}
          link={{ href: "/reviews", label: t("seeAllReviews") }}
        />
        <div className="flex flex-col gap-4 max-sm:gap-3">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} locale={locale} />
          ))}
        </div>
        {/* Phone-only continuation control (§6.18): a real 48px full-width
            target at the end of the list, replacing the 23px inline link the
            section head carries on desktop. */}
        <Link
          href="/reviews"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-5 h-12 w-full sm:hidden",
          )}
        >
          {t("seeAllReviews")} <span aria-hidden>→</span>
        </Link>
      </Container>
    </Section>
  );
}
