import {hasLocale} from "next-intl";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";

import {routing} from "@/i18n/routing";
import {client} from "@/sanity/lib/client";
import {urlForImage} from "@/sanity/lib/image";
import {availableLanguages, localizedValue} from "@/sanity/lib/localize";
import {REVIEWS_QUERY} from "@/sanity/lib/queries";

/**
 * TEMPORARY — Phase 1.05 connect-to-site proof. Lists localized review titles
 * (with the cover / no-image state) straight from Sanity, and shows the
 * "available in:" note on any review missing a translation. The real, styled
 * Reviews page is built in 1.06–1.10.
 */
export default async function ReviewsProofPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations();
  const reviews = await client.fetch(REVIEWS_QUERY);

  return (
    <div className="mx-auto w-full max-w-prose px-5 py-12">
      <p className="text-eyebrow uppercase text-text-muted">
        {locale} · Phase 1.05 proof
      </p>
      <h1 className="mt-2 text-h1">{t("reviews.title")}</h1>

      <ul className="mt-8 space-y-6">
        {reviews.map((review) => {
          const title = localizedValue(review.reviewTitle, locale);
          const langs = availableLanguages(review.reviewTitle);
          const cover = review.coverImage;
          const coverUrl = cover?.asset
            ? urlForImage(cover).width(96).height(144).fit("crop").url()
            : null;
          return (
            <li key={review._id} className="flex items-start gap-4">
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverUrl}
                  alt=""
                  width={64}
                  height={96}
                  className="rounded-image shadow-cover"
                />
              ) : (
                <span className="flex h-24 w-16 shrink-0 items-center justify-center rounded-image border border-border text-center text-meta text-text-muted">
                  no cover
                </span>
              )}
              <div>
                <p className="text-h4">{title ?? "(untitled)"}</p>
                {langs.length < routing.locales.length && (
                  <p className="mt-1 text-meta text-text-muted">
                    {t("common.availableIn", {
                      langs: langs.map((l) => l.toUpperCase()).join(" · "),
                    })}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-10 text-meta text-text-muted">
        Temporary connect-to-site proof — the styled Reviews page is built in 1.06–1.10.
      </p>
    </div>
  );
}
