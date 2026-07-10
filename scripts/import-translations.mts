/**
 * scripts/import-translations.mts — Phase 2.12.
 *
 * Fills the ENGLISH (`en`) and SERBIAN (`sr`, Latin) slots of the Author + Book
 * singletons' descriptive prose, so the About / Book / Home pages read fully in
 * the active language instead of falling back to Macedonian.
 *
 * Fields set (en + sr only; `mk` is NEVER touched):
 *   author.roles · author.tagline · author.education   (localizedString)
 *   author.bio · book.description                        (localizedText → Portable Text)
 *
 * ── POLICY NOTE ──────────────────────────────────────────────────────────────
 * The project's standing rule is "no machine translation of Dalibor's work — he
 * supplies and approves his own wording" (see Decisions log; import-content.mts
 * deliberately left these en/sr slots EMPTY). Phase 2.12 OVERRIDES that rule ON
 * THE OPERATOR'S EXPLICIT INSTRUCTION (Lazar, 2026-07-09): ship EN/SR now.
 * The translations below are therefore a machine-authored FIRST DRAFT — they are
 * meant to be reviewed/refined by Dalibor in the Studio (or here) after import.
 * They are proper-noun-faithful (book title rendered as the site's own "Bunike";
 * outlet/programme/place names kept), single-language, and mirror the mk source.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * WHY A PATCH, NOT import-content.mts:
 *   import-content.mts writes the singletons with `createOrReplace` and carries
 *   NO `photo` / `coverImage` fields — re-running it would WIPE `author.photo`
 *   (2.01e) and `book.coverImage` (2.01h), both of which are set in production.
 *   This script uses `.patch().set()` on the specific en/sr keys ONLY, so photo,
 *   cover, translations[], mk text and everything else are left intact.
 *
 * Idempotent: reads the current en/sr values first and sets only the fields that
 * differ; a second run with no changes is a genuine no-op (no `_rev` churn).
 *
 * Run:  npm run import:translations           (writes — needs SANITY_WRITE_TOKEN)
 *       npm run import:translations -- --dry-run   (diff + scrub only; no token needed)
 *   ( = node --conditions=react-server --import tsx --env-file=.env.local
 *         scripts/import-translations.mts )
 */
import {createClient} from "next-sanity";

import {apiVersion, dataset, projectId} from "@/sanity/env";

const DRY_RUN = process.argv.includes("--dry-run");

/* ----------------------------------------------------------------------------
 * 0 · Clients — a token-less READ client (fine for the diff, works in --dry-run
 *     with no secret) and, for real writes, a WRITE client from the env token.
 * ------------------------------------------------------------------------- */
const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // fresh reads so the diff reflects the live doc
});

const token = process.env.SANITY_WRITE_TOKEN;
if (!DRY_RUN && !token) {
  console.error(
    "Sanity write token not set in `.env.local` — Lazar must paste it before the " +
      "import can run. (Expected variable: SANITY_WRITE_TOKEN.) " +
      "Use `-- --dry-run` to preview the diff without a token.",
  );
  process.exit(1);
}
const writeClient = token
  ? createClient({projectId, dataset, apiVersion, token, useCdn: false})
  : null;

/* ----------------------------------------------------------------------------
 * 1 · The translations (machine-authored first draft — see POLICY NOTE).
 *     `mk` is shown only as a comment, for the reviewer's diff; it is not written.
 * ------------------------------------------------------------------------- */
// mk: "Писател, книжевен критичар и преведувач"
const ROLES = {
  en: "Writer, literary critic and translator",
  sr: "Pisac, književni kritičar i prevodilac",
};
// mk: "Писател, книжевен критичар и преведувач" (same text as roles)
const TAGLINE = {
  en: "Writer, literary critic and translator",
  sr: "Pisac, književni kritičar i prevodilac",
};
// mk: "Дипломиран филолог по Општа и компаративна книжевност"
const EDUCATION = {
  en: "Graduate philologist in General and Comparative Literature",
  sr: "Diplomirani filolog opšte i komparativne književnosti",
};
// mk: "Далибор Плечиќ е писател, книжевен критичар, преведувач и професор по
//      книжевност. Учествувал на повеќе меѓународни книжевни резиденцијални
//      програми, меѓу кои и програмата Artist in Residence, Q21 во Виена.
//      Преведувал проза, поезија и драмски текстови од српски, бугарски,
//      македонски и англиски јазик. Автор е на збирката раскази „Буники“, а
//      негови песни се објавувани во регионални списанија. Редовно пишува
//      книжевни осврти и критики за порталот Booksa од Загреб, списанието The
//      Literary Review од Њу Џерси и порталот Beton од Белград. Тој е уредник на
//      списанието за култура „Зенит“ од Струмица."
const BIO = {
  en:
    "Dalibor Plečić is a writer, literary critic, translator and professor of " +
    "literature. He has taken part in several international literary residency " +
    "programmes, among them the Artist in Residence programme at Q21 in Vienna. " +
    "He has translated prose, poetry and drama from Serbian, Bulgarian, " +
    "Macedonian and English. He is the author of the short-story collection " +
    "“Bunike”, and his poems have been published in regional magazines. He " +
    "writes literary reviews and criticism regularly for the Booksa portal in " +
    "Zagreb, The Literary Review magazine in New Jersey and the Beton portal in " +
    "Belgrade. He is the editor of the culture magazine “Zenit” in Strumica.",
  sr:
    "Dalibor Plečić je pisac, književni kritičar, prevodilac i profesor " +
    "književnosti. Učestvovao je na više međunarodnih književnih rezidencijalnih " +
    "programa, među kojima je i program Artist in Residence, Q21 u Beču. Prevodio " +
    "je prozu, poeziju i dramske tekstove sa srpskog, bugarskog, makedonskog i " +
    "engleskog jezika. Autor je zbirke priča „Bunike“, a njegove pesme " +
    "objavljivane su u regionalnim časopisima. Redovno piše književne osvrte i " +
    "kritike za portal Booksa iz Zagreba, časopis The Literary Review iz Nju " +
    "Džersija i portal Beton iz Beograda. Urednik je časopisa za kulturu „Zenit“ " +
    "iz Strumice.",
};
// mk: "Станува збор за збирка на раскази, пред сѐ составена во една, условно
//      речено, несиметрична структура. […] Зборуваат и за некои реални приказни,
//      чувствата и сл" (see book description in production)
const DESCRIPTION = {
  en:
    "This is a collection of short stories, composed above all in a — " +
    "conditionally speaking — asymmetrical structure. It opens with what one " +
    "might call a novella, the story “Bunike”, which is considerably longer than " +
    "the other four. It is central to the collection and stands as an axis or, " +
    "better, a planet around which the others orbit like satellites. This does " +
    "not mean that those satellites depend on the planet or could not exist on " +
    "their own, but that they are merely drawn in by its gravity and lie within " +
    "its field of narrative weight. The stories speak of the existential and " +
    "metaphysical problems of the main protagonists and of the context in which " +
    "we live, of the changes brought about by the passage from the — " +
    "conditionally speaking — “analogue” to the “digital” age, of the " +
    "bewilderment of those belonging to the generations born somewhere in " +
    "between, of the problems of the society we live in and its eschatological " +
    "image of our future. They speak, too, of certain real stories, of feelings " +
    "and the like.",
  sr:
    "Reč je o zbirci priča, pre svega sastavljenoj u jednoj, uslovno rečeno, " +
    "nesimetričnoj strukturi. Naime, počinje jednom novelom, ako se tako može " +
    "reći, pričom „Bunike“, koja je znatno duža od ostale četiri. Ona je " +
    "centralna u zbirci i stoji kao osa ili, bolje, planeta oko koje ostale kruže " +
    "kao sateliti. To ne znači da su ti sateliti zavisni od planete i da ne bi " +
    "mogli sami da postoje, već da su samo privučeni njenom gravitacijom i nalaze " +
    "se u njenom polju narativne teže. Priče govore o egzistencijalnim i " +
    "metafizičkim problemima glavnih protagonista i o kontekstu u kojem živimo, o " +
    "promenama koje nastaju prelaskom iz, uslovno rečeno, „analognog“ u " +
    "„digitalno“ doba, o zbunjenosti pripadnika generacija rođenih negde između, " +
    "o problemima društva u kojem živimo i njegovoj eshatološkoj slici naše " +
    "budućnosti. Govore i o nekim stvarnim pričama, osećanjima i slično.",
};

/* ----------------------------------------------------------------------------
 * 2 · Portable Text builder (one paragraph → one block) — matches the shape
 *     import-content.mts writes for the mk slots, so the three languages are
 *     structurally identical.
 * ------------------------------------------------------------------------- */
type Span = {_type: "span"; _key: string; text: string; marks: string[]};
type Block = {
  _type: "block";
  _key: string;
  style: "normal";
  markDefs: never[];
  children: Span[];
};
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

/* ----------------------------------------------------------------------------
 * 3 · "Zaporožac" scrub — abort before any write if a forbidden variant appears
 *     in the strings we are about to publish (same guard as import-content.mts).
 * ------------------------------------------------------------------------- */
const SCRUB = /zaporo|запорож/i;
const ALL_STRINGS = [
  ROLES.en, ROLES.sr, TAGLINE.en, TAGLINE.sr, EDUCATION.en, EDUCATION.sr,
  BIO.en, BIO.sr, DESCRIPTION.en, DESCRIPTION.sr,
];
const scrubHits = ALL_STRINGS.filter((s) => SCRUB.test(s));
if (scrubHits.length > 0) {
  console.error("ABORT: 'Zaporožac' variant found in the translation set:");
  scrubHits.forEach((s) => console.error(`  - ${s.slice(0, 80)}`));
  process.exit(1);
}
// Guard: no stray Cyrillic must leak into an en/sr slot (mk is not written here).
const CYRILLIC = /[Ѐ-ӿ]/;
const cyrHits = ALL_STRINGS.filter((s) => CYRILLIC.test(s));
if (cyrHits.length > 0) {
  console.error("ABORT: Cyrillic characters found in an en/sr translation:");
  cyrHits.forEach((s) => console.error(`  - ${s.slice(0, 80)}`));
  process.exit(1);
}
console.log("Guards: Zaporožac 0 hits, Cyrillic-in-en/sr 0 hits. ✓");

/* ----------------------------------------------------------------------------
 * 4 · Read the current en/sr values (as plain text) so we set only what differs.
 * ------------------------------------------------------------------------- */
type AuthorNow = {
  rolesEn: string | null; rolesSr: string | null;
  taglineEn: string | null; taglineSr: string | null;
  educationEn: string | null; educationSr: string | null;
  bioEn: string | null; bioSr: string | null;
};
type BookNow = {descEn: string | null; descSr: string | null};

const authorNow = await readClient.fetch<AuthorNow | null>(
  `*[_id == "author"][0]{
    "rolesEn": roles.en, "rolesSr": roles.sr,
    "taglineEn": tagline.en, "taglineSr": tagline.sr,
    "educationEn": education.en, "educationSr": education.sr,
    "bioEn": pt::text(bio.en), "bioSr": pt::text(bio.sr)
  }`,
);
const bookNow = await readClient.fetch<BookNow | null>(
  `*[_id == "book"][0]{"descEn": pt::text(description.en), "descSr": pt::text(description.sr)}`,
);
if (!authorNow) {
  console.error("ABORT: no `author` singleton in production.");
  process.exit(1);
}
if (!bookNow) {
  console.error("ABORT: no `book` singleton in production.");
  process.exit(1);
}

/** `pt::text` collapses to "" for an empty/absent field; normalize for compare. */
const norm = (v: string | null | undefined) => (v ?? "").trim();

/* ----------------------------------------------------------------------------
 * 5 · Build the change-only patch sets.
 * ------------------------------------------------------------------------- */
const authorSet: Record<string, unknown> = {};
const bookSet: Record<string, unknown> = {};
const changed: string[] = [];
const unchanged: string[] = [];

function planString(
  set: Record<string, unknown>,
  key: string,
  current: string | null,
  desired: string,
) {
  if (norm(current) === norm(desired)) unchanged.push(key);
  else {
    set[key] = desired;
    changed.push(key);
  }
}
function planText(
  set: Record<string, unknown>,
  key: string,
  currentText: string | null,
  desired: string,
  keyPrefix: string,
) {
  if (norm(currentText) === norm(desired)) unchanged.push(key);
  else {
    set[key] = paragraph(desired, keyPrefix);
    changed.push(key);
  }
}

planString(authorSet, "roles.en", authorNow.rolesEn, ROLES.en);
planString(authorSet, "roles.sr", authorNow.rolesSr, ROLES.sr);
planString(authorSet, "tagline.en", authorNow.taglineEn, TAGLINE.en);
planString(authorSet, "tagline.sr", authorNow.taglineSr, TAGLINE.sr);
planString(authorSet, "education.en", authorNow.educationEn, EDUCATION.en);
planString(authorSet, "education.sr", authorNow.educationSr, EDUCATION.sr);
planText(authorSet, "bio.en", authorNow.bioEn, BIO.en, "bio-en");
planText(authorSet, "bio.sr", authorNow.bioSr, BIO.sr, "bio-sr");
planText(bookSet, "description.en", bookNow.descEn, DESCRIPTION.en, "desc-en");
planText(bookSet, "description.sr", bookNow.descSr, DESCRIPTION.sr, "desc-sr");

console.log(
  `\nPlan → ${changed.length} field(s) to set, ${unchanged.length} already current.`,
);
if (changed.length) console.log("  set:      " + changed.join(", "));
if (unchanged.length) console.log("  no-op:    " + unchanged.join(", "));

/* ----------------------------------------------------------------------------
 * 6 · Apply (author + book) — patch only the changed en/sr keys.
 * ------------------------------------------------------------------------- */
if (Object.keys(authorSet).length === 0 && Object.keys(bookSet).length === 0) {
  console.log("\nNothing to do — all en/sr slots already current. ✓");
  process.exit(0);
}

if (DRY_RUN) {
  console.log("\n[--dry-run] No writes performed. The fields above WOULD be set.");
  process.exit(0);
}

if (Object.keys(authorSet).length) {
  await writeClient!.patch("author").set(authorSet).commit();
  console.log(`\nPatched author  (${Object.keys(authorSet).length} field(s)).`);
}
if (Object.keys(bookSet).length) {
  await writeClient!.patch("book").set(bookSet).commit();
  console.log(`Patched book    (${Object.keys(bookSet).length} field(s)).`);
}

/* ----------------------------------------------------------------------------
 * 7 · Verify — re-read and confirm every en/sr slot now matches.
 * ------------------------------------------------------------------------- */
const authorAfter = await writeClient!.fetch<AuthorNow>(
  `*[_id == "author"][0]{
    "rolesEn": roles.en, "rolesSr": roles.sr,
    "taglineEn": tagline.en, "taglineSr": tagline.sr,
    "educationEn": education.en, "educationSr": education.sr,
    "bioEn": pt::text(bio.en), "bioSr": pt::text(bio.sr)
  }`,
);
const bookAfter = await writeClient!.fetch<BookNow>(
  `*[_id == "book"][0]{"descEn": pt::text(description.en), "descSr": pt::text(description.sr)}`,
);
const checks: Array<[string, boolean]> = [
  ["roles.en", norm(authorAfter.rolesEn) === norm(ROLES.en)],
  ["roles.sr", norm(authorAfter.rolesSr) === norm(ROLES.sr)],
  ["tagline.en", norm(authorAfter.taglineEn) === norm(TAGLINE.en)],
  ["tagline.sr", norm(authorAfter.taglineSr) === norm(TAGLINE.sr)],
  ["education.en", norm(authorAfter.educationEn) === norm(EDUCATION.en)],
  ["education.sr", norm(authorAfter.educationSr) === norm(EDUCATION.sr)],
  ["bio.en", norm(authorAfter.bioEn) === norm(BIO.en)],
  ["bio.sr", norm(authorAfter.bioSr) === norm(BIO.sr)],
  ["description.en", norm(bookAfter.descEn) === norm(DESCRIPTION.en)],
  ["description.sr", norm(bookAfter.descSr) === norm(DESCRIPTION.sr)],
];
const failed = checks.filter(([, ok]) => !ok).map(([k]) => k);
console.log(
  failed.length
    ? `\n✗ Verification MISMATCH on: ${failed.join(", ")}`
    : `\n✓ Verification passed — all 10 en/sr slots match (mk untouched).`,
);
process.exit(failed.length ? 1 : 0);
