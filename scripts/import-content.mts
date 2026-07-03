/**
 * scripts/import-content.mts — Phase 2.01b + 2.01c content import.
 *
 * Writes Dalibor's REAL content into the `production` dataset, replacing the
 * `[PLACEHOLDER]` seed docs. Idempotent (stable `_id`s + createOrReplace, with a
 * skip-if-unchanged guard so a re-run is a genuine no-op).
 *
 *   • 2.01b — Author + Book singletons + translations[] (intake-sourced). The
 *     long-form Macedonian text (bio §1, book description §2) is read VERBATIM
 *     from `content-packet/intake/Dalibor-Intake-Answers-MK.md`.
 *   • 2.01c — reviews / blog posts / topics, read from three plain JSON files in
 *     `content-packet/` (`topics.json`, `reviews.json`, `posts.json`). No
 *     spreadsheet parser, no new dependency: `readFileSync` + `JSON.parse`.
 *     COPYRIGHT-SAFE: reviews/posts import as their title + reviewed book +
 *     topics + "first published on …" `source` attribution ONLY — no body text,
 *     no excerpts (Dalibor pastes the prose into the Studio himself, intake §3).
 *     Croatian text lives in the `sr` slot (the site falls back mk→en→sr).
 *
 * After the upserts, the 12 leftover `[PLACEHOLDER]` seed docs are deleted in
 * reference-safe order (reviews → posts → topics; drafts included), identified by
 * the surviving `[PLACEHOLDER]` title marker so the two seed topic ids that the
 * real import overwrites (`topic-translation`, `topic-science-fiction`) are not
 * touched.
 *
 * Safety:
 *   • Separate WRITE client (token from .env.local) — the site's read client
 *     stays token-less.
 *   • "Zaporožac" scrub: BOTH the constructed singletons AND the parsed packet
 *     are scanned for every variant; the run ABORTS before any write if one is
 *     found.
 *   • en/sr long-form slots are left EMPTY by design (the site falls back
 *     mk→en→sr). No machine translation.
 *   • This is an INITIAL-import tool: reviews/posts are written with
 *     `createOrReplace`, so a re-run overwrites those docs with the packet
 *     version. To protect Dalibor's later Studio work, `upsert()` PRESERVES any
 *     review/post that already has body prose (never overwrites it). Title/topic
 *     edits made in the Studio are NOT field-merged, though — don't re-run this
 *     after editing those in the Studio unless you mean to reset them.
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
const TOPICS_PATH = path.join(ROOT, "content-packet/topics.json");
const REVIEWS_PATH = path.join(ROOT, "content-packet/reviews.json");
const POSTS_PATH = path.join(ROOT, "content-packet/posts.json");

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
for (const p of [TOPICS_PATH, REVIEWS_PATH, POSTS_PATH]) {
  if (!existsSync(p)) {
    console.error(`Content-packet file missing: ${p}`);
    process.exit(1);
  }
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
type UpsertDoc = {_id: string; _type: string} & Record<string, unknown>;
const docs: UpsertDoc[] = [authorDoc, bookDoc];

/* ----------------------------------------------------------------------------
 * 2.5 · Reviews / posts / topics — build from the content-packet JSON (2.01c),
 *       RECONCILED onto Dalibor's live topic taxonomy.
 *
 * The live `production` dataset already carries Dalibor's own 14-topic taxonomy
 * (ids `t-<slug>`), built in the hosted Studio after the 2.01b snapshot. Rather
 * than inject a parallel `topic-*` set (which would duplicate concepts), this
 * import MAPS each packet topic slug onto his existing topic id and creates ONLY
 * the two concepts his taxonomy lacked.
 *   Operator decisions (2026-07-03, Lazar): women-and-gender → existing
 *   `t-womens-writing`; `essay` + `society-and-politics` created new (`t-*` style).
 *
 * Reviews/posts get stable ids (`review-<slug>` / `post-<slug>`); a topic-ref
 * `_key` = the packet slug keeps re-runs churn-free. Copyright-safe: NO body /
 * excerpt is written; `source` carries the "first published on …" attribution.
 * ------------------------------------------------------------------------- */
type LocalizedSlots = {mk?: string; en?: string; sr?: string};
type PacketSource = {sourceName?: string; sourceUrl?: string};
type PacketTopic = {slug: string; title: LocalizedSlots};
type PacketReview = {
  slug: string;
  reviewTitle: LocalizedSlots;
  bookTitle: LocalizedSlots;
  bookAuthor?: string;
  topics: string[];
  source: PacketSource;
  publishedAt: string;
};
type PacketPost = {
  slug: string;
  title: LocalizedSlots;
  topics: string[];
  source: PacketSource;
  publishedAt: string;
};

const topicsPacket = JSON.parse(readFileSync(TOPICS_PATH, "utf8")) as PacketTopic[];
const reviewsPacket = JSON.parse(readFileSync(REVIEWS_PATH, "utf8")) as PacketReview[];
const postsPacket = JSON.parse(readFileSync(POSTS_PATH, "utf8")) as PacketPost[];

// packet topic slug → live topic _id (Dalibor's `t-*` taxonomy). 11 map to
// EXISTING topics; `t-essay` + `t-society-politics` are created just below.
const TOPIC_ID_BY_PACKET_SLUG: Record<string, string> = {
  "post-yugoslav-literature": "t-post-yugoslav",
  "contemporary-fiction": "t-contemporary-fiction",
  "short-stories": "t-short-stories",
  "poetry": "t-poetry",
  "science-fiction": "t-science-fiction",
  "identity-and-belonging": "t-identity-belonging",
  "memory-and-history": "t-memory-history",
  "society-and-politics": "t-society-politics",
  "women-and-gender": "t-womens-writing",
  "translation": "t-translation",
  "literary-criticism": "t-literary-criticism",
  "essay": "t-essay",
  "macedonian-literature": "t-macedonian-literature",
};

// The two topics Dalibor's taxonomy lacked — created in his `t-*` style
// (localized mk/en/sr; en uses "&", slug drops "and", per his existing topics).
const NEW_TOPIC_DOCS: UpsertDoc[] = [
  {
    _id: "t-essay",
    _type: "topic",
    title: {mk: "Есеј", en: "Essay", sr: "Esej"},
    slug: {_type: "slug", current: "essay"},
  },
  {
    _id: "t-society-politics",
    _type: "topic",
    title: {
      mk: "Општество и политика",
      en: "Society & politics",
      sr: "Društvo i politika",
    },
    slug: {_type: "slug", current: "society-politics"},
  },
];
const NEW_TOPIC_IDS = new Set(NEW_TOPIC_DOCS.map((d) => d._id));

// Guard 1 — the map and the packet must agree (catches packet/map drift).
{
  const packetSlugs = new Set(topicsPacket.map((t) => t.slug));
  const mapKeys = new Set(Object.keys(TOPIC_ID_BY_PACKET_SLUG));
  const missing = [...packetSlugs].filter((s) => !mapKeys.has(s));
  const extra = [...mapKeys].filter((s) => !packetSlugs.has(s));
  if (missing.length || extra.length) {
    console.error(
      "ABORT: topic map is out of sync with the packet." +
        (missing.length ? ` No mapping for: ${missing.join(", ")}.` : "") +
        (extra.length ? ` Map has unknown slugs: ${extra.join(", ")}.` : ""),
    );
    process.exit(1);
  }
}

// Guard 2 — every EXISTING mapped target must be present live, so no review/post
// ends up with a dangling reference. (The two new topics are exempt — created
// below.) This aborts before any write if the live taxonomy has shifted again.
const liveTopicIds = new Set(
  await writeClient.fetch<string[]>(`*[_type == "topic"]._id`),
);
{
  const missingTargets = [...new Set(Object.values(TOPIC_ID_BY_PACKET_SLUG))].filter(
    (id) => !NEW_TOPIC_IDS.has(id) && !liveTopicIds.has(id),
  );
  if (missingTargets.length) {
    console.error(
      `ABORT: mapped topic id(s) not found in \`production\`: ${missingTargets.join(", ")}. ` +
        "The live taxonomy changed — re-check the reconciliation map.",
    );
    process.exit(1);
  }
}

/** A topic reference: packet slug → live topic id, with a stable `_key` = the
 *  packet slug (unique within each review's/post's topics array). */
function topicRef(packetSlug: string) {
  const id = TOPIC_ID_BY_PACKET_SLUG[packetSlug];
  if (!id) {
    console.error(`ABORT: no topic mapping for "${packetSlug}".`);
    process.exit(1);
  }
  return {_type: "reference" as const, _key: packetSlug, _ref: id};
}

/** A packet date ("2026-05-12", date-only) → an ISO string the `datetime`
 *  schema accepts. Noon UTC so every timezone renders the same calendar date. */
function toDateTime(date: string): string {
  return /\dT\d/.test(date) ? date : `${date}T12:00:00Z`;
}

const reviewDocs: UpsertDoc[] = reviewsPacket.map((r) =>
  clean({
    _id: `review-${r.slug}`,
    _type: "review",
    // reviewTitle / bookTitle are `sr`-only in the packet; clean() writes just
    // the non-empty slots (the site falls back mk→en→sr).
    reviewTitle: clean({
      mk: r.reviewTitle?.mk,
      en: r.reviewTitle?.en,
      sr: r.reviewTitle?.sr,
    }),
    slug: {_type: "slug", current: r.slug},
    bookTitle: clean({
      mk: r.bookTitle?.mk,
      en: r.bookTitle?.en,
      sr: r.bookTitle?.sr,
    }),
    // Absent on Chinook (posthumous book; author unresolved) → clean() omits it.
    bookAuthor: r.bookAuthor,
    topics: r.topics.map(topicRef),
    source: clean({sourceName: r.source?.sourceName, sourceUrl: r.source?.sourceUrl}),
    publishedAt: toDateTime(r.publishedAt),
    // No body / excerpt / coverImage — intentionally absent (copyright-safe).
  }),
);

const postDocs: UpsertDoc[] = postsPacket.map((p) => {
  const mk = p.title?.mk?.trim();
  if (!mk) {
    console.error(`ABORT: post "${p.slug}" has no Macedonian (mk) title — not inventing one.`);
    process.exit(1);
  }
  return clean({
    _id: `post-${p.slug}`,
    _type: "post",
    title: clean({mk, en: p.title.en, sr: p.title.sr}),
    slug: {_type: "slug", current: p.slug},
    topics: p.topics.map(topicRef),
    source: clean({sourceName: p.source?.sourceName, sourceUrl: p.source?.sourceUrl}),
    publishedAt: toDateTime(p.publishedAt),
    // No body — Dalibor pastes the essay into the Studio.
  });
});

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
const hits = scrub([
  docs,
  NEW_TOPIC_DOCS,
  reviewDocs,
  postDocs,
  topicsPacket,
  reviewsPacket,
  postsPacket,
]);
if (hits.length > 0) {
  console.error("ABORT: 'Zaporožac' variant found in the content set:");
  hits.forEach((h) => console.error(`  - ${h}`));
  process.exit(1);
}
console.log(
  "Zaporožac scrub: 0 hits across the singletons + the parsed packet. ✓",
);

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
 * 5 · Import the packet (topics → reviews → posts) — reference-safe order.
 *
 * Idempotent upsert with a skip-if-unchanged guard: an existing document that
 * already equals the desired document (ignoring Sanity's system fields) is left
 * untouched, so a second run is a genuine no-op (no `_rev` churn, no duplicates).
 * Topics go first because reviews/posts reference them.
 * ------------------------------------------------------------------------- */
const SYSTEM_FIELDS = new Set(["_rev", "_createdAt", "_updatedAt"]);

/** Canonicalize for comparison: drop Sanity system fields at every level and
 *  sort object keys so key order can never cause a false "changed". */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([k]) => !SYSTEM_FIELDS.has(k))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, canonical(v)]),
    );
  }
  return value;
}

function sameDoc(prev: unknown, desired: unknown): boolean {
  return JSON.stringify(canonical(prev)) === JSON.stringify(canonical(desired));
}

/** True if a stored doc already carries body prose in any language. The importer
 *  never writes `body`, so its presence means a human pasted it in the Studio —
 *  such a doc is PRESERVED, never overwritten (createOrReplace would revert it). */
function hasStudioBody(doc: UpsertDoc | undefined): boolean {
  const body = doc?.body as Record<string, unknown> | undefined;
  if (!body) return false;
  return ["mk", "en", "sr"].some(
    (l) => Array.isArray(body[l]) && (body[l] as unknown[]).length > 0,
  );
}

async function upsert(label: string, batch: UpsertDoc[]) {
  const existing = await writeClient.fetch<UpsertDoc[]>(`*[_id in $ids]`, {
    ids: batch.map((d) => d._id),
  });
  const byId = new Map(existing.map((d) => [d._id, d]));
  let c = 0;
  let u = 0;
  let s = 0;
  let p = 0;
  for (const doc of batch) {
    const prev = byId.get(doc._id);
    // Safety net: once Dalibor has pasted prose into a review/post in the Studio,
    // never overwrite it — a re-run of this initial-import script would otherwise
    // wipe his body via createOrReplace. (No-op today; nothing has a body yet.)
    if (hasStudioBody(prev)) {
      console.warn(`  ! preserved ${doc._id} — has Studio-added body; not overwritten.`);
      p++;
      continue;
    }
    if (prev && sameDoc(prev, doc)) {
      s++;
      continue;
    }
    if (!DRY_RUN) await writeClient.createOrReplace(doc);
    if (prev) u++;
    else c++;
  }
  console.log(
    `  ${label.padEnd(7)} created=${c} updated=${u} skipped=${s}` +
      (p ? ` preserved=${p}` : ""),
  );
  return {created: c, updated: u, skipped: s, preserved: p};
}

console.log(
  DRY_RUN
    ? "\n[--dry-run] Would upsert the packet (new topics → reviews → posts):"
    : "\nImporting the packet into `production` (new topics → reviews → posts)…",
);
// Only the two NEW topics are written; the other 11 are Dalibor's existing
// `t-*` topics, referenced but never modified.
const topicUpsert = await upsert("topics", NEW_TOPIC_DOCS);
const reviewUpsert = await upsert("reviews", reviewDocs);
const postUpsert = await upsert("posts", postDocs);

/* ----------------------------------------------------------------------------
 * 6 · Remove any leftover `[PLACEHOLDER]` seed docs — reference-safe order
 *     (reviews → posts → topics; topics last because they are referenced).
 *
 * Identified by the SURVIVING `[PLACEHOLDER]` title marker (not a hard-coded id
 * list), so Dalibor's real `t-*` topics are never touched. As of 2026-07-03 the
 * live dataset already has ZERO placeholder docs (the seed reviews/posts/topics
 * were cleared upstream when Dalibor rebuilt the taxonomy), so this is normally a
 * no-op now — kept as a guard. Drafts (if any) are removed too; deleting a
 * non-existent id is a no-op.
 * ------------------------------------------------------------------------- */
const PLACEHOLDER_MATCH = ["reviewTitle", "title", "name"]
  .flatMap((f) => ["mk", "en", "sr"].map((l) => `${f}.${l} match "*PLACEHOLDER*"`))
  .join(" || ");

async function deletePlaceholders(type: string): Promise<string[]> {
  // `raw` perspective so draft-only placeholder orphans are caught too (the
  // client's default `published` perspective would hide `drafts.*`).
  const ids = await writeClient.fetch<string[]>(
    `*[_type == $type && (${PLACEHOLDER_MATCH})]._id`,
    {type},
    {perspective: "raw"},
  );
  const targets = new Set<string>();
  for (const id of ids) {
    targets.add(id);
    targets.add(id.startsWith("drafts.") ? id : `drafts.${id}`);
  }
  if (!DRY_RUN) {
    for (const id of targets) await writeClient.delete(id);
  }
  return ids;
}

console.log(
  DRY_RUN
    ? "\n[--dry-run] Would delete leftover [PLACEHOLDER] docs (reviews → posts → topics)."
    : "\nRemoving leftover [PLACEHOLDER] seed docs (reviews → posts → topics)…",
);
const removedReviews = await deletePlaceholders("review");
const removedPosts = await deletePlaceholders("post");
const removedTopics = await deletePlaceholders("topic");
const removedTotal =
  removedReviews.length + removedPosts.length + removedTopics.length;
console.log(
  `  removed → review:${removedReviews.length} post:${removedPosts.length} ` +
    `topic:${removedTopics.length} (total ${removedTotal})`,
);

/* ----------------------------------------------------------------------------
 * 7 · Report — final per-type tallies + integrity checks
 * ------------------------------------------------------------------------- */
const tallies: Record<string, number> = {};
for (const t of ["author", "book", "topic", "review", "post"]) {
  tallies[t] = await writeClient.fetch<number>(`count(*[_type == $t])`, {t});
}
// Documents still carrying the seed "[PLACEHOLDER]" marker (expected 0 now).
const placeholders = await writeClient.fetch<number>(
  `count(*[${PLACEHOLDER_MATCH}])`,
);
// Reviews/posts with at least one topic reference that fails to resolve (0 == OK).
const dangling = await writeClient.fetch<number>(
  `count(*[(_type == "review" || _type == "post") && count(topics[@->._id == null]) > 0])`,
);
// The two topics this import creates must exist (referenced by reviews/posts).
const newTopicsPresent = await writeClient.fetch<number>(
  `count(*[_type == "topic" && _id in $ids])`,
  {ids: [...NEW_TOPIC_IDS]},
);
// Every packet document must be present (robust to Dalibor adding more content
// later — checks *our* ids, not a hard-coded total review/post count).
const packetIds = [...NEW_TOPIC_DOCS, ...reviewDocs, ...postDocs].map((d) => d._id);
const packetPresent = await writeClient.fetch<number>(
  `count(*[_id in $ids])`,
  {ids: packetIds},
);

const packetCreated =
  topicUpsert.created + reviewUpsert.created + postUpsert.created;
const packetUpdated =
  topicUpsert.updated + reviewUpsert.updated + postUpsert.updated;
const packetSkipped =
  topicUpsert.skipped + reviewUpsert.skipped + postUpsert.skipped;

console.log(`\nDone${DRY_RUN ? " (dry run)" : ""}.`);
console.log(
  `  singletons → created=${created} updated=${updated} ` +
    `(createOrReplace; 2.01b machinery, unchanged content on re-run)`,
);
console.log(
  `  packet     → created=${packetCreated} updated=${packetUpdated} ` +
    `skipped=${packetSkipped} (skipped == a no-op re-run)`,
);
console.log(`  placeholders removed → ${removedTotal}`);
console.log(
  `Dataset tallies → author:${tallies.author} book:${tallies.book} ` +
    `topic:${tallies.topic} review:${tallies.review} post:${tallies.post} ` +
    `(topic count = Dalibor's taxonomy + the 2 new; reviews/posts reference 13 of them)`,
);
console.log(
  `Integrity → [PLACEHOLDER] docs:${placeholders} (expect 0) · ` +
    `dangling topic refs:${dangling} (expect 0) · ` +
    `packet docs present:${packetPresent}/${packetIds.length} · ` +
    `new topics present:${newTopicsPresent}/${NEW_TOPIC_IDS.size}`,
);
if (!DRY_RUN) {
  const ok =
    packetPresent === packetIds.length &&
    newTopicsPresent === NEW_TOPIC_IDS.size &&
    placeholders === 0 &&
    dangling === 0;
  console.log(
    ok
      ? `✓ Verification passed (all ${packetIds.length} packet docs present · 0 placeholders · 0 dangling refs).`
      : "✗ Verification MISMATCH — check the tallies above.",
  );
}
