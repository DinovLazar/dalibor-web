import {hasLocale} from "next-intl";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";

import {routing} from "@/i18n/routing";
import {client} from "@/sanity/lib/client";
import {urlForImage} from "@/sanity/lib/image";
import {localizedValue} from "@/sanity/lib/localize";
import {BOOK_QUERY} from "@/sanity/lib/queries";

/**
 * TEMPORARY — Phase 1.05 connect-to-site proof. Reads the `book` singleton from
 * Sanity and shows the localized title (+ cover / no-image state). The real,
 * styled Book page is built in 1.06–1.10.
 */
export default async function BookProofPage({
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
  const book = await client.fetch(BOOK_QUERY);
  const title = localizedValue(book?.title, locale);
  const genre = localizedValue(book?.genre, locale);
  const cover = book?.coverImage;
  const coverUrl = cover?.asset
    ? urlForImage(cover).width(140).height(210).fit("crop").url()
    : null;

  return (
    <div className="mx-auto w-full max-w-prose px-5 py-12">
      <p className="text-eyebrow uppercase text-text-muted">
        {locale} · Phase 1.05 proof
      </p>
      <h1 className="mt-2 text-h1">{t("book.title")}</h1>

      {book ? (
        <div className="mt-6 flex items-start gap-5">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt=""
              width={93}
              height={140}
              className="rounded-image shadow-cover"
            />
          ) : (
            <span className="flex h-36 w-24 shrink-0 items-center justify-center rounded-image border border-border text-center text-meta text-text-muted">
              no cover
            </span>
          )}
          <div>
            <p className="text-h3">{title ?? "(untitled)"}</p>
            {genre && <p className="mt-1 text-body text-text-muted">{genre}</p>}
            {book.publisher && (
              <p className="mt-1 text-meta text-text-muted">
                {[book.publisher, book.publicationYear].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-body text-text-muted">No book document found.</p>
      )}

      <p className="mt-10 text-meta text-text-muted">
        Temporary connect-to-site proof — the styled Book page is built in 1.06–1.10.
      </p>
    </div>
  );
}
