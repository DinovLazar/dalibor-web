/**
 * Field-level localization helpers for the `{mk, en, sr}` object shape.
 *
 * `localizedValue` resolves a single field with graceful fallback in the order
 * current-locale -> mk -> en -> sr (mk is the default language). It is generic,
 * so it works for localized strings AND localized Portable Text (block arrays).
 *
 * `availableLanguages` reports which of mk/en/sr a field actually has content in
 * — used for the "available in: …" indicator when a translation is missing.
 */

export type AppLocale = "mk" | "en" | "sr";

export type LocalizedField<T> =
  | {mk?: T | null; en?: T | null; sr?: T | null}
  | null
  | undefined;

const FALLBACK_ORDER: AppLocale[] = ["mk", "en", "sr"];

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function localizedValue<T>(
  field: LocalizedField<T>,
  locale: string,
): T | undefined {
  if (!field) return undefined;
  // current locale first, then the remaining fallbacks (deduped) in mk→en→sr order
  const order: AppLocale[] = [
    locale as AppLocale,
    ...FALLBACK_ORDER.filter((lang) => lang !== locale),
  ];
  for (const lang of order) {
    const value = field[lang];
    if (hasValue(value)) return value as T;
  }
  return undefined;
}

export function availableLanguages(field: LocalizedField<unknown>): AppLocale[] {
  if (!field) return [];
  return FALLBACK_ORDER.filter((lang) => hasValue(field[lang]));
}

/**
 * Which of mk/en/sr `localizedValue` actually resolves to for `locale` (using
 * the same current→mk→en→sr order). Returns `undefined` only when the field is
 * empty in every language. Use this to know the *real* language of a rendered
 * value — e.g. for JSON-LD `inLanguage` or the `lang` attribute below.
 */
export function resolvedLanguage(
  field: LocalizedField<unknown>,
  locale: string,
): AppLocale | undefined {
  if (!field) return undefined;
  const order: AppLocale[] = [
    locale as AppLocale,
    ...FALLBACK_ORDER.filter((lang) => lang !== locale),
  ];
  for (const lang of order) {
    if (hasValue(field[lang])) return lang;
  }
  return undefined;
}

/**
 * The `lang` attribute value for a content region rendered from this field
 * (WCAG 2.2 AA SC 3.1.2 — Language of Parts). Returns the resolved language
 * ONLY when it differs from the page `locale`, otherwise `undefined`, so
 * `lang={contentLang(field, locale)}` sets the attribute exactly when fallback
 * content is shown in a language other than the surrounding page — and adds
 * nothing (clean markup) when the content matches the page language.
 */
export function contentLang(
  field: LocalizedField<unknown>,
  locale: string,
): string | undefined {
  const lang = resolvedLanguage(field, locale);
  return lang && lang !== locale ? lang : undefined;
}

/**
 * Like {@link contentLang}, but driven by an already-computed
 * `availableLanguages(...)` list rather than the raw field — for the search
 * results, where the API sends only which languages a review has (the field
 * objects aren't shipped to the client). Returns the resolved language (in the
 * current→mk→en→sr order) only when it differs from `locale`.
 */
export function contentLangFromList(
  langs: AppLocale[],
  locale: string,
): string | undefined {
  const order: AppLocale[] = [
    locale as AppLocale,
    ...FALLBACK_ORDER.filter((lang) => lang !== locale),
  ];
  const resolved = order.find((lang) => langs.includes(lang));
  return resolved && resolved !== locale ? resolved : undefined;
}

/**
 * The "available in: …" languages label (§6.13): the uppercased, middot-joined
 * list of languages a field exists in — but ONLY when the active locale is
 * missing (so callers show the note exactly when a translation is absent).
 * Returns `undefined` when nothing should be shown. Feed the result to the
 * `common.availableIn` ICU message. Accepts the already-computed
 * `availableLanguages(...)` array so it works for both Sanity fields and the
 * search API's pre-resolved `ReviewSummary`.
 */
export function availableInLabel(
  langs: AppLocale[],
  locale: string,
): string | undefined {
  if (!langs.length || langs.includes(locale as AppLocale)) return undefined;
  return langs.map((lang) => lang.toUpperCase()).join(" · ");
}

/**
 * Resolve dereferenced topic references to the `{ slug, label }` shape the
 * review cards and the topic filter consume — localized (mk→en→sr) and dropping
 * any topic missing a slug or a label in every language.
 */
export function resolveTopics(
  topics:
    | ReadonlyArray<{slug: string | null; title: LocalizedField<string>}>
    | null
    | undefined,
  locale: string,
): {slug: string; label: string}[] {
  return (topics ?? [])
    .map((topic) => ({
      slug: topic.slug ?? "",
      label: localizedValue(topic.title, locale) ?? "",
    }))
    .filter((topic) => Boolean(topic.slug) && Boolean(topic.label));
}
