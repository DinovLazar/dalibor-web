import { getTranslations } from "next-intl/server";

/**
 * About » "Translations" block (Phase 2.01b). A quiet Style A section that lists
 * Dalibor's published literary translations from `author.translations[]`.
 *
 * Each entry: the work title (proper noun, never localized) over a single muted
 * meta line — original author · language pair · kind (only for play/anthology) ·
 * publisher · year — with any absent part simply dropped. The language pair and
 * the kind labels are localized chrome (the `about.langNames` / `about.kinds`
 * message strings), so the line reads in the visitor's language. The block
 * returns `null` when there are no translations (graceful degradation). Server
 * component — mirrors the About page's existing `getTranslations` pattern.
 */
type TranslationLang = "bg" | "en" | "fr" | "hr" | "mk" | "sr";

export interface TranslationEntry {
  title: string | null;
  originalAuthor: string | null;
  fromLang: TranslationLang | null;
  toLang: TranslationLang | null;
  publisher: string | null;
  year: number | null;
  kind: "anthology" | "book" | "play" | null;
}

export async function Translations({
  translations,
  className,
}: {
  translations: ReadonlyArray<TranslationEntry> | null | undefined;
  className?: string;
}) {
  const items = (translations ?? []).filter((t) => t.title);
  if (items.length === 0) return null;

  const t = await getTranslations("about.translations");
  const tLang = await getTranslations("about.langNames");
  const tKind = await getTranslations("about.kinds");

  return (
    <section className={className} aria-labelledby="translations-heading">
      <h2
        id="translations-heading"
        className="font-display text-h3 text-text"
      >
        {t("heading")}
      </h2>
      <p className="mt-2 text-body text-text-muted">{t("intro")}</p>

      <ul className="mt-6 border-t border-border">
        {items.map((item, i) => {
          const pair =
            item.fromLang && item.toLang
              ? `${tLang(item.fromLang)} → ${tLang(item.toLang)}`
              : null;
          const meta = [
            item.originalAuthor,
            pair,
            item.kind && item.kind !== "book" ? tKind(item.kind) : null,
            item.publisher,
            item.year ? String(item.year) : null,
          ].filter(Boolean);

          return (
            <li
              key={`${item.title}-${i}`}
              className="border-b border-border py-4"
            >
              <p className="font-display text-h4 text-text">{item.title}</p>
              {meta.length > 0 ? (
                <p className="mt-1 text-meta text-text-muted">
                  {meta.join(" · ")}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
