import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ReviewCard } from "@/components/home/review-card";
import { SectionHeading } from "@/components/home/section-heading";
import type { HOME_REVIEWS_QUERY_RESULT } from "@/sanity/sanity.types";

/**
 * Home "Latest reviews" (§7.1.3) — the 3 most recent reviews as a single column
 * of horizontal review cards (the row IS the unit; not gridded), with a "see all
 * reviews" link through to the Reviews list.
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
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} locale={locale} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
