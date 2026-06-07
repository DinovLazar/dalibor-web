import {hasLocale} from "next-intl";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";

import {routing} from "@/i18n/routing";
import {client} from "@/sanity/lib/client";
import {localizedValue} from "@/sanity/lib/localize";
import {AUTHOR_QUERY} from "@/sanity/lib/queries";

/**
 * TEMPORARY — Phase 1.05 connect-to-site proof. Reads the `author` singleton
 * from Sanity and shows the localized name + roles. The real, styled About page
 * is built in 1.06–1.10.
 */
export default async function AboutProofPage({
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
  const author = await client.fetch(AUTHOR_QUERY);
  const name = localizedValue(author?.name, locale);
  const roles = localizedValue(author?.roles, locale);
  const shortBio = localizedValue(author?.shortBio, locale);

  return (
    <div className="mx-auto w-full max-w-prose px-5 py-12">
      <p className="text-eyebrow uppercase text-text-muted">
        {locale} · Phase 1.05 proof
      </p>
      <h1 className="mt-2 text-h1">{t("about.title")}</h1>

      {author ? (
        <div className="mt-6">
          <p className="text-h3">{name ?? "(no name)"}</p>
          {roles && <p className="mt-1 text-body-lg text-text-muted">{roles}</p>}
          {shortBio && <p className="mt-4 text-body">{shortBio}</p>}
        </div>
      ) : (
        <p className="mt-6 text-body text-text-muted">No author document found.</p>
      )}

      <p className="mt-10 text-meta text-text-muted">
        Temporary connect-to-site proof — the styled About page is built in 1.06–1.10.
      </p>
    </div>
  );
}
