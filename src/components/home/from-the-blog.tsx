import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { BlogCard } from "@/components/home/blog-card";
import { SectionHeading } from "@/components/home/section-heading";
import { buttonVariants } from "@/components/ui/button";
import type { HOME_POSTS_QUERY_RESULT } from "@/sanity/sanity.types";
import { cn } from "@/lib/utils";

/**
 * Home "From the blog" (§7.1.4) — the 3 most recent posts as blog cards in a
 * two-column grid (single column on mobile), with a "read the blog" link — inline
 * beside the heading on desktop, a full-width 48px button after the list on a
 * phone (Phase 3.01). Sits
 * flush under Latest reviews (no top padding), so the two sections share one
 * vertical rhythm.
 */
export async function FromTheBlog({
  posts,
  locale,
  className,
}: {
  posts: HOME_POSTS_QUERY_RESULT;
  locale: string;
  className?: string;
}) {
  if (!posts.length) return null;
  const t = await getTranslations("home");

  return (
    <Section className={cn("pt-0 max-sm:pt-10 sm:pt-0", className)}>
      <Container>
        <SectionHeading
          eyebrow={t("blogEyebrow")}
          title={t("blogHeading")}
          link={{ href: "/blog", label: t("readBlog") }}
        />
        <div className="grid gap-4 max-sm:gap-3 md:grid-cols-2">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} locale={locale} />
          ))}
        </div>
        {/* Phone-only continuation control (§6.18): a real 48px full-width
            target at the end of the list, replacing the 23px inline link the
            section head carries on desktop. */}
        <Link
          href="/blog"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-5 h-12 w-full sm:hidden",
          )}
        >
          {t("readBlog")} <span aria-hidden>→</span>
        </Link>
      </Container>
    </Section>
  );
}
