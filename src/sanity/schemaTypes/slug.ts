import {defineField} from "sanity";

/**
 * One language-neutral, ASCII slug per document, shared across /mk, /en, /sr
 * (e.g. /mk/reviews/<slug>, /en/reviews/<slug>). The suggestion reads the
 * English title first, then falls back to a transliterated Macedonian title.
 * The slug stays editable and stable once set.
 */

// Macedonian + Serbian Cyrillic -> ASCII (digraph-aware), plus the one Serbian
// Latin letter (đ) that Unicode NFKD does not decompose.
const CHAR_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ѓ: "gj", ђ: "dj", е: "e", ж: "zh",
  з: "z", ѕ: "dz", и: "i", ј: "j", к: "k", л: "l", љ: "lj", м: "m", н: "n",
  њ: "nj", о: "o", п: "p", р: "r", с: "s", т: "t", ћ: "c", ќ: "kj", у: "u",
  ф: "f", х: "h", ц: "c", ч: "ch", џ: "dj", ш: "sh", đ: "dj",
  А: "A", Б: "B", В: "V", Г: "G", Д: "D", Ѓ: "Gj", Ђ: "Dj", Е: "E", Ж: "Zh",
  З: "Z", Ѕ: "Dz", И: "I", Ј: "J", К: "K", Л: "L", Љ: "Lj", М: "M", Н: "N",
  Њ: "Nj", О: "O", П: "P", Р: "R", С: "S", Т: "T", Ћ: "C", Ќ: "Kj", У: "U",
  Ф: "F", Х: "H", Ц: "C", Ч: "Ch", Џ: "Dj", Ш: "Sh", Đ: "Dj",
};

export function slugify(input: string): string {
  const transliterated = Array.from(input)
    .map((ch) => CHAR_MAP[ch] ?? ch)
    .join("");
  return transliterated
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics (č->c, ž->z, …)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

type TitleObject = { en?: string; mk?: string } | undefined;

/**
 * A required, unique slug field whose suggestion reads `<titleField>.en` first,
 * then `<titleField>.mk` (transliterated by `slugify`).
 */
export function localizedSlug(titleField: "title" | "reviewTitle") {
  return defineField({
    name: "slug",
    title: "Slug (URL — shared across all languages)",
    type: "slug",
    options: {
      source: (doc) => {
        const title = (doc as Record<string, unknown>)[titleField] as TitleObject;
        return title?.en || title?.mk || "";
      },
      slugify,
      maxLength: 96,
    },
    validation: (Rule) => Rule.required(),
  });
}
