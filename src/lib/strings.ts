/**
 * Returns the first Unicode letter of a title, uppercased — used for the monogram
 * in the graceful no-cover placeholder (§6.11). Strips the seed's "[PLACEHOLDER]"
 * marker first, so placeholder content still yields a meaningful initial (e.g.
 * "Б"/"B" rather than the "P" of "[PLACEHOLDER]"). Harmless for real titles.
 */
export function monogramOf(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/\[PLACEHOLDER\]/g, " ").trim();
  const match = cleaned.match(/\p{L}/u);
  return match ? match[0].toLocaleUpperCase() : undefined;
}
