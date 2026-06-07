/**
 * Small date formatters for the Home cards. Uses `Intl.DateTimeFormat` with the
 * active locale. Serbian content on this site is Latin script, so dates are
 * formatted with `sr-Latn` (not the Cyrillic default for "sr").
 */

// Map our app locales (mk/en/sr) to BCP-47 tags for Intl.
const BCP47: Record<string, string> = {
  mk: "mk",
  en: "en",
  sr: "sr-Latn",
};

function toBcp47(locale: string): string {
  return BCP47[locale] ?? locale;
}

function parse(iso: string | null | undefined): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** "мај 2024" / "May 2024" — month + year, used on review cards (§6.6). */
export function formatMonthYear(
  iso: string | null | undefined,
  locale: string,
): string | undefined {
  const d = parse(iso);
  if (!d) return undefined;
  return new Intl.DateTimeFormat(toBcp47(locale), {
    month: "long",
    year: "numeric",
  }).format(d);
}

/** "12 април 2024" / "12 April 2024" — day month year, used on blog cards (§6.7). */
export function formatFullDate(
  iso: string | null | undefined,
  locale: string,
): string | undefined {
  const d = parse(iso);
  if (!d) return undefined;
  return new Intl.DateTimeFormat(toBcp47(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
