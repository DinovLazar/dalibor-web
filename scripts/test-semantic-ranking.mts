/**
 * scripts/test-semantic-ranking.mts — Phase 2.03 content-independent ranking proof.
 *
 * Because the live dataset is placeholder text, this proves the embedding model
 * + pgvector cosine ranking genuinely work NOW, independent of Sanity content.
 * It seeds a few short, realistic, MULTILINGUAL snippets on clearly distinct
 * topics into a throwaway `zfixture-` namespace inside `review_embeddings`,
 * embeds meaning-queries, and asserts each query retrieves the right snippet —
 * including a cross-lingual case (EN query → MK snippet) and a
 * no-verbatim-keyword case (the topic word never literally appears). Fixtures
 * are torn down in a `finally`, so they never pollute real search.
 *
 * Run: npm run test:semantic   (requires the keys + the migrated table).
 * Exits non-zero if any ranking case fails.
 */
import {
  EMBEDDING_MODEL,
  embedDocuments,
  embedQueries,
} from "@/lib/search/embeddings";
import {reviewEmbeddingHash} from "@/lib/search/review-embedding-text";
import {getSupabaseAdmin} from "@/lib/search/supabase";

/** Namespace for fixture rows. No underscores (those are SQL LIKE wildcards). */
const PREFIX = "zfixture-";

type Fixture = {key: string; lang: string; text: string};
const FIXTURES: Fixture[] = [
  {
    key: "war",
    lang: "mk",
    text: "Романот ја опишува војната и долгата опсада на градот — разурнатите улици, гладот и животите на цивилите под постојаното бомбардирање.",
  },
  {
    key: "translation",
    lang: "en",
    text: "An essay on the craft of translating poetry, and how a verse's meaning shifts as it is carried from one language into another.",
  },
  {
    key: "identity",
    lang: "sr",
    text: "Pripovest o identitetu i pripadnosti — o životu između dve kulture i o potrazi za sopstvenim glasom i korenima.",
  },
  {
    key: "scifi",
    lang: "en",
    text: "A science-fiction novel about interstellar travel, colonies on distant planets, and artificial minds awakening among the stars.",
  },
];

type Case = {name: string; query: string; expect: string; note: string};
const CASES: Case[] = [
  {
    name: "cross-lingual",
    query: "a book about war and the long siege of a city",
    expect: "war",
    note: "EN query must surface the Macedonian war snippet",
  },
  {
    name: "no-verbatim-keyword",
    query: "rendering a poem from one tongue into another",
    expect: "translation",
    note: "query never says 'translation' yet must surface it",
  },
  {
    name: "identity",
    query: "belonging and the search for who you are between cultures",
    expect: "identity",
    note: "cross-lingual: EN query → Serbian snippet",
  },
  {
    name: "scifi",
    query: "voyages between the stars to far-off worlds",
    expect: "scifi",
    note: "no 'science fiction' literal in the query",
  },
];

const supabase = getSupabaseAdmin();

async function teardown() {
  await supabase.from("review_embeddings").delete().like("slug", `${PREFIX}%`);
}

let failures = 0;
try {
  await teardown(); // start from a clean slate

  const embeddings = await embedDocuments(FIXTURES.map((f) => f.text));
  const now = new Date().toISOString();
  const rows = FIXTURES.map((f, i) => ({
    slug: `${PREFIX}${f.key}`,
    content: f.text,
    embedding: embeddings[i],
    model: EMBEDDING_MODEL,
    content_hash: reviewEmbeddingHash(f.text),
    updated_at: now,
  }));
  const {error: seedErr} = await supabase
    .from("review_embeddings")
    .upsert(rows, {onConflict: "slug"});
  if (seedErr) throw new Error(`fixture seed failed: ${seedErr.message}`);

  const fixtureSlugs = new Set(FIXTURES.map((f) => `${PREFIX}${f.key}`));
  console.log(`Seeded ${FIXTURES.length} fixtures (${EMBEDDING_MODEL}). Running cases:\n`);

  // Embed every query in ONE request (Voyage `inputType: query`) to stay within
  // the API's request-rate limit; ranking is identical to embedding each singly.
  const queryEmbeddings = await embedQueries(CASES.map((c) => c.query));

  for (let i = 0; i < CASES.length; i++) {
    const c = CASES[i];
    const {data, error: rpcErr} = await supabase.rpc("match_reviews", {
      query_embedding: queryEmbeddings[i],
      match_count: 50,
      match_threshold: -1, // return all, including real reviews; we filter to fixtures
    });
    if (rpcErr) throw new Error(`match_reviews failed: ${rpcErr.message}`);

    const ranked = (data as {slug: string; similarity: number}[]).filter((r) =>
      fixtureSlugs.has(r.slug),
    );
    const top = ranked[0]?.slug.slice(PREFIX.length);
    const ok = top === c.expect;
    if (!ok) failures++;
    const top3 = ranked
      .slice(0, 3)
      .map((r) => `${r.slug.slice(PREFIX.length)}:${r.similarity.toFixed(3)}`)
      .join("  ");
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${c.name.padEnd(20)} expect=${c.expect.padEnd(
        12,
      )} top=${(top ?? "—").padEnd(12)} [${top3}]  — ${c.note}`,
    );
  }
} finally {
  await teardown();
}

if (failures > 0) {
  console.error(`\n${failures} ranking case(s) FAILED.`);
  process.exit(1);
}
console.log("\nAll ranking cases passed. Fixtures torn down.");
