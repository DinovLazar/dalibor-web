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
