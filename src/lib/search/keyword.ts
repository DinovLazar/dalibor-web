import type {ReviewSummary} from "./types";

/**
 * The always-on keyword fallback (Phase 1.09). Pure functions with no Voyage /
 * Supabase dependency, so search works with ZERO env keys; it is only ever
 * called server-side, which is why no `server-only` guard is needed here.
 */

/**
 * Fold a string to a diacritic-insensitive, lower-cased search form.
 *
 * NFD decomposition then strips combining marks, which folds Macedonian ѓ→г,
 * ќ→к and Latin č/ć/š/ž→c/c/s/z. A few stand-alone letters (đ/ђ) have no
 * canonical decomposition and are left as-is — this is best-effort
 * diacritic-insensitivity, not a full transliteration.
 */
export function normalizeForSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase();
}

/** Minimal inline narrowing for a Portable Text block + its text spans. */
interface PortableTextBlock {
  _type?: string;
  children?: {text?: string}[];
}

/**
 * Flatten Portable Text to a plain string for keyword matching: join the `text`
 * of every span in each `block`, then join blocks with newlines. Non-arrays and
 * non-`block` entries (e.g. images) contribute nothing.
 */
export function blocksToPlainText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      const typed = block as PortableTextBlock;
      if (typed._type !== "block" || !Array.isArray(typed.children)) return "";
      return typed.children.map((child) => child.text ?? "").join("");
    })
    .join("\n");
}

/** A review summary paired with the pre-built text it is matched against. */
export interface KeywordItem {
  summary: ReviewSummary;
  haystack: string;
}

/**
 * AND-match keyword search: every whitespace-separated token of the normalized
 * query must appear somewhere in the normalized haystack. An empty query (no
 * tokens) returns everything, preserving the caller's incoming order.
 */
export function keywordSearch(q: string, items: KeywordItem[]): ReviewSummary[] {
  const tokens = normalizeForSearch(q).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return items.map((item) => item.summary);
  return items
    .filter((item) => {
      const hay = normalizeForSearch(item.haystack);
      return tokens.every((token) => hay.includes(token));
    })
    .map((item) => item.summary);
}
