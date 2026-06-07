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
