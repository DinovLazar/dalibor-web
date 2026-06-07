import {hasLocale} from "next-intl";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";

import {routing} from "@/i18n/routing";
import {client} from "@/sanity/lib/client";
import {availableLanguages, localizedValue} from "@/sanity/lib/localize";
import {POSTS_QUERY} from "@/sanity/lib/queries";

/**
 * TEMPORARY — Phase 1.05 connect-to-site proof. Lists localized blog-post titles
 * from Sanity. The real, styled Blog page is built in 1.06–1.10.
 */
export default async function BlogProofPage({
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
  const posts = await client.fetch(POSTS_QUERY);

  return (
    <div className="mx-auto w-full max-w-prose px-5 py-12">
      <p className="text-eyebrow uppercase text-text-muted">
        {locale} · Phase 1.05 proof
      </p>
      <h1 className="mt-2 text-h1">{t("blog.title")}</h1>

      <ul className="mt-8 space-y-4">
        {posts.map((post) => {
          const title = localizedValue(post.title, locale);
          const langs = availableLanguages(post.title);
          return (
            <li key={post._id}>
              <p className="text-h4">{title ?? "(untitled)"}</p>
              {langs.length < routing.locales.length && (
                <p className="mt-1 text-meta text-text-muted">
                  {t("common.availableIn", {
                    langs: langs.map((l) => l.toUpperCase()).join(" · "),
                  })}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-10 text-meta text-text-muted">
        Temporary connect-to-site proof — the styled Blog page is built in 1.06–1.10.
      </p>
    </div>
  );
}
