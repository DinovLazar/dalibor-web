/**
 * scripts/import-content.mts — Phase 2.01b content import.
 *
 * Writes Dalibor's REAL Author + Book singletons (bio, book description, the 8
 * published translations, education, publisher, year, purchase link, genre) into
 * the `production` dataset, replacing the `[PLACEHOLDER]` seed singletons. The
 * long-form Macedonian text (bio §1, book description §2) is read VERBATIM from
 * `content-packet/intake/Dalibor-Intake-Answers-MK.md` — never re-typed here.
 *
 * Scope (2.01b is a PARTIAL pass — the Cowork reviews/posts workbook was never
 * committed to the repo):
 *   • DONE here: Author + Book singletons + translations[] (intake-sourced).
 *   • DEFERRED to 2.01c: reviews / blog posts / topics / reviewed-book covers —
 *     they live in `content-packet/Dalibor-Content-Packet-Reviews-and-Posts.xlsx`
 *     (+ the singletons .docx + assets manifest), which is absent. When that
 *     packet lands, implement `importFromWorkbook()` and re-run this script; it
 *     is idempotent (stable `_id`s + createOrReplace).
 *
 * Safety:
 *   • Separate WRITE client (token from .env.local) — the site's read client
 *     stays token-less.
 *   • "Zaporožac" scrub: the constructed document set is scanned for every
 *     variant and the run ABORTS before any write if one is found.
 *   • en/sr long-form slots are left EMPTY by design (the site falls back
 *     mk→en→sr). No machine translation.
 *
 * Run:  npm run import:content        (add --dry-run to build + scrub only)
 *   ( = node --conditions=react-server --import tsx --env-file=.env.local
 *         scripts/import-content.mts )
 */
import {existsSync, readFileSync} from "node:fs";
import path from "node:path";

import {createClient} from "next-sanity";

import {apiVersion, dataset, projectId} from "@/sanity/env";

const DRY_RUN = process.argv.includes("--dry-run");
const ROOT = process.cwd();
const INTAKE_PATH = path.join(
  ROOT,
  "content-packet/intake/Dalibor-Intake-Answers-MK.md",
);
const WORKBOOK_PATH = path.join(
  ROOT,
  "content-packet/Dalibor-Content-Packet-Reviews-and-Posts.xlsx",
);

/* ----------------------------------------------------------------------------
 * 0 · Preconditions
 * ------------------------------------------------------------------------- */
const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error(
    "Sanity write token not set in `.env.local` — Lazar must paste it before the " +
      "import can run. (Expected variable: SANITY_WRITE_TOKEN.)",
  );
  process.exit(1);
}
if (!existsSync(INTAKE_PATH)) {
  console.error(`Intake file missing: ${INTAKE_PATH}`);
  process.exit(1);
}

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false, // mutations + fresh reads
});

/* ----------------------------------------------------------------------------
 * 1 · Read the verbatim Macedonian long-form text from the intake file
 * ------------------------------------------------------------------------- */
const intake = readFileSync(INTAKE_PATH, "utf8");

/**
 * Return the answer paragraph that follows a bold question line containing
 * `marker`: skip the blank line after the marker, then collect consecutive
 * non-empty lines (one paragraph) and join them. Throws if the marker is absent.
 *
 * NOTE: this captures a SINGLE paragraph (it stops at the first blank line). The
 * 2.01b bio (§1) and book description (§2) are each one paragraph, so this is
 * exact. If a future intake answer is multi-paragraph, upgrade this to emit one
 * Portable Text block per paragraph rather than truncating to the first.
 */
function answerAfter(markdown: string, marker: string): string {
  const lines = markdown.split(/\r?\n/);
  const idx = lines.findIndex((l) => l.includes(marker));
  if (idx === -1) throw new Error(`Intake marker not found: "${marker}"`);
  let i = idx + 1;
  while (i < lines.length && lines[i].trim() === "") i++;
  const collected: string[] = [];
  while (i < lines.length && lines[i].trim() !== "") {
    collected.push(lines[i].trim());
    i++;
  }
  const text = collected.join(" ").trim();
  if (!text) throw new Error(`No answer text found after marker: "${marker}"`);
  return text;
}

const bioMk = answerAfter(intake, "Со свои зборови"); // §1 — verbatim bio
const bookDescMk = answerAfter(intake, "Опис на книгата"); // §2 — verbatim book description

/* ----------------------------------------------------------------------------
 * 2 · Builders
 * ------------------------------------------------------------------------- */
type Span = {_type: "span"; _key: string; text: string; marks: string[]};
type Block = {
  _type: "block";
  _key: string;
  style: "normal";
  markDefs: never[];
  children: Span[];
};

/** A single Portable Text paragraph (one block) from plain text. */
function paragraph(text: string, keyPrefix: string): Block[] {
  return [
    {
      _type: "block",
      _key: `${keyPrefix}-0`,
      style: "normal",
      markDefs: [],
      children: [{_type: "span", _key: `${keyPrefix}-0-0`, text, marks: []}],
    },
  ];
}

/** Drop undefined / empty-string fields so documents stay clean. */
function clean<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  ) as T;
}

// The 8 published translations — recorded EXACTLY as Dalibor stated them in
// intake §5 (stated source languages preserved; titles are proper nouns). For
// Nothomb, Dalibor translated from the Bulgarian edition → that is the stated
// `fromLang` (the original work is French; his statement is kept).
const TRANSLATIONS = [
  {title: "Između", originalAuthor: "Irena Jordanova", fromLang: "mk", toLang: "sr", publisher: "Partizanska knjiga, Belgrade", year: 2023, kind: "book"},
  {title: "Priče u prošlom vremenu", originalAuthor: "Petar Denčev", fromLang: "bg", toLang: "sr", publisher: "Partizanska knjiga, Belgrade", kind: "book"},
  {title: "Jednostavne priče", originalAuthor: "Petar Denčev", fromLang: "bg", toLang: "sr", kind: "book"},
  {title: "Tekst, tijelo, trauma", originalAuthor: "Andrea Zlatar", fromLang: "hr", toLang: "mk", kind: "book"},
  {title: "Kozmetika neprijatelja", originalAuthor: "Amélie Nothomb", fromLang: "bg", toLang: "sr", kind: "book"},
  {title: "Kec na deset", originalAuthor: "Mitko Bojadžiski", fromLang: "mk", toLang: "sr", kind: "play"},
  {title: "Kako je suđeno", originalAuthor: "Mitko Bojadžiski", fromLang: "mk", toLang: "sr", kind: "play"},
  {title: "Izbor od savremene bugarske pripovedne proze", fromLang: "bg", toLang: "sr", kind: "anthology"},
].map((t, i) => clean({_key: `tr-${i + 1}`, _type: "translation", ...t}));

const authorDoc = {
  _id: "author",
  _type: "author",
  name: {mk: "Далибор Плечиќ", en: "Dalibor Plečić", sr: "Dalibor Plečić"},
  // mk-only by design — en/sr fall back (no machine translation of his content).
  roles: {mk: "Писател, книжевен критичар и преведувач"},
  tagline: {mk: "Писател, книжевен критичар и преведувач"},
  bio: {mk: paragraph(bioMk, "bio-mk")},
  education: {mk: "Дипломиран филолог по Општа и компаративна книжевност"},
  translations: TRANSLATIONS,
  // Shown publicly via src/lib/site-links.ts; mirrored here for CMS completeness.
  email: "plecicdalibor@gmail.com",
};

const bookDoc = {
  _id: "book",
  _type: "book",
  // mk Cyrillic + Latin "Bunike" (proper-noun transliteration) for en/sr.
  title: {mk: "Буники", en: "Bunike", sr: "Bunike"},
  description: {mk: paragraph(bookDescMk, "desc-mk")},
  // Data-only — the Book page renders no genre/format badge by design.
  genre: {mk: "збирка раскази"},
  publisher: "ПНВ Публикации",
  // 2022 is dossier-sourced (well-sourced), NOT intake-confirmed — flagged in the report.
  publicationYear: 2022,
  purchaseLinks: [
    {
      _key: "literatura-mk",
      _type: "purchaseLink",
      label: {mk: "Литература.мк", en: "Literatura.mk", sr: "Literatura.mk"},
      // Exact „Буники" product page could not be resolved — site root + flagged
      // for Cowork to refine. The book is confirmed on literatura.mk (350 MKD).
      url: "https://www.literatura.mk",
    },
  ],
  // coverImage / isbn / tagline intentionally unset (pending / none given).
};

// A permissive stub shape so the two differently-shaped singletons share one
// array type that `createOrReplace` accepts (it can't unify the two otherwise).
const docs: Array<{_id: string; _type: string} & Record<string, unknown>> = [
  authorDoc,
  bookDoc,
];

/* ----------------------------------------------------------------------------
 * 3 · "Zaporožac" scrub — abort before any write if a variant appears anywhere
 * ------------------------------------------------------------------------- */
const SCRUB = /zaporo|запорож/i;
function scrub(value: unknown, said: string[] = [], pathTrail = "$"): string[] {
  if (typeof value === "string") {
    if (SCRUB.test(value)) said.push(`${pathTrail}: ${value.slice(0, 80)}`);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => scrub(v, said, `${pathTrail}[${i}]`));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) scrub(v, said, `${pathTrail}.${k}`);
  }
  return said;
}
const hits = scrub(docs);
if (hits.length > 0) {
  console.error("ABORT: 'Zaporožac' variant found in the document set:");
  hits.forEach((h) => console.error(`  - ${h}`));
  process.exit(1);
}
console.log("Zaporožac scrub: 0 hits across the constructed documents. ✓");

/* ----------------------------------------------------------------------------
 * 4 · Write the singletons (createOrReplace → idempotent on fixed _id)
 * ------------------------------------------------------------------------- */
const existingIds = new Set<string>(
  await writeClient.fetch<string[]>(`*[_id in $ids]._id`, {
    ids: docs.map((d) => d._id),
  }),
);

// A stale published-singleton draft would mask the real content in the Studio.
const staleDrafts = await writeClient.fetch<string[]>(
  `*[_id in $ids]._id`,
  {ids: docs.map((d) => `drafts.${d._id}`)},
);
if (staleDrafts.length > 0) {
  console.warn(
    `WARNING: existing draft(s) ${staleDrafts.join(", ")} will shadow the imported ` +
      `published singleton(s) in the Studio until published/discarded.`,
  );
}

let created = 0;
let updated = 0;
if (DRY_RUN) {
  console.log("\n[--dry-run] Skipping writes. Would import:");
} else {
  console.log("\nImporting singletons into `production`…");
}
for (const doc of docs) {
  const isUpdate = existingIds.has(doc._id);
  if (!DRY_RUN) await writeClient.createOrReplace(doc);
  if (isUpdate) updated++;
  else created++;
  console.log(`  ${isUpdate ? "updated" : "created"}  ${doc._type} (_id: ${doc._id})`);
}

/* ----------------------------------------------------------------------------
 * 5 · Reviews / posts / topics — deferred to Phase 2.01c (workbook absent)
 * ------------------------------------------------------------------------- */
if (existsSync(WORKBOOK_PATH)) {
  console.log(
    "\nWorkbook present, but the reviews/posts/topics importer is not implemented " +
      "in this 2.01b partial pass — implement importFromWorkbook() in 2.01c, then re-run.",
  );
} else {
  console.log(
    "\nWorkbook absent (content-packet/…Reviews-and-Posts.xlsx) — reviews/posts/topics " +
      "import DEFERRED to Phase 2.01c. Placeholder reviews/posts/topics are left intact " +
      "so the site still renders content; they are removed when the real ones land.",
  );
}

/* ----------------------------------------------------------------------------
 * 6 · Report — counts + final per-type tallies
 * ------------------------------------------------------------------------- */
const tallies: Record<string, number> = {};
for (const t of ["author", "book", "topic", "review", "post"]) {
  tallies[t] = await writeClient.fetch<number>(`count(*[_type == $t])`, {t});
}
// Count docs whose primary title still carries the seed "[PLACEHOLDER]" marker.
const placeholders = await writeClient.fetch<number>(
  `count(*[
    reviewTitle.mk match "*PLACEHOLDER*" ||
    title.mk match "*PLACEHOLDER*" ||
    name.mk match "*PLACEHOLDER*"
  ])`,
);

console.log(
  `\nDone${DRY_RUN ? " (dry run)" : ""}. created=${created} updated=${updated} skipped=0`,
);
console.log(
  `Dataset tallies → author:${tallies.author} book:${tallies.book} ` +
    `topic:${tallies.topic} review:${tallies.review} post:${tallies.post}`,
);
console.log(
  `Documents still carrying "[PLACEHOLDER]": ${placeholders} ` +
    `(expected > 0 in 2.01b — the deferred reviews/posts/topics; the two singletons are now real).`,
);
