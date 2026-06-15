/**
 * scripts/embed-reviews.mts — Phase 2.03 review-embedding backfill / full resync.
 *
 * Reads every published review from Sanity, builds the combined-language
 * embedding text (the SAME builder the re-index route uses), embeds it with the
 * Voyage wrapper (input_type: document), and upserts one vector row per review
 * into Supabase `review_embeddings`.
 *
 *   • Idempotent: upsert by slug + a content hash, so re-runs only re-embed
 *     reviews whose source text actually changed (or when the model changed).
 *   • Self-healing: prunes orphan rows whose review no longer exists in Sanity,
 *     so the table stays a faithful mirror and `rows == reviews`.
 *
 * Run:  npm run embed:reviews
 *   ( = node --conditions=react-server --import tsx --env-file=.env.local
 *         scripts/embed-reviews.mts )
 * The `--conditions=react-server` flag lets this Node script import the
 * `server-only`-guarded wrapper modules; `--env-file` loads the keys.
 *
 * Doubles as the one-shot "re-embed everything" tool to run ONCE after the real
 * 2.01 content import.
 */
import {EMBEDDING_MODEL, embedDocuments} from "@/lib/search/embeddings";
import {
  buildReviewEmbeddingText,
  reviewEmbeddingHash,
} from "@/lib/search/review-embedding-text";
import {getSupabaseAdmin} from "@/lib/search/supabase";
import {client} from "@/sanity/lib/client";
import {REVIEWS_SEARCH_QUERY} from "@/sanity/lib/queries";

for (const name of [
  "VOYAGE_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
]) {
  if (!process.env[name]) {
    console.error(`Missing required env var ${name} (set it in .env.local).`);
    process.exit(1);
  }
}

const reviews = await client.fetch(REVIEWS_SEARCH_QUERY);
console.log(`Sanity: ${reviews.length} published review(s).`);

const supabase = getSupabaseAdmin();

// Existing rows → skip reviews whose source text + model are unchanged.
const {data: existingRows, error: readErr} = await supabase
  .from("review_embeddings")
  .select("slug, content_hash, model");
if (readErr) {
  console.error(`Failed to read existing rows: ${readErr.message}`);
  process.exit(1);
}
const existing = new Map(
  (existingRows ?? []).map((row) => [
    row.slug,
    {hash: row.content_hash, model: row.model},
  ]),
);

type Pending = {slug: string; content: string; hash: string};
const pending: Pending[] = [];
let skipped = 0;
for (const review of reviews) {
  const slug = review.slug;
  if (!slug) continue;
  const content = buildReviewEmbeddingText(review);
  const hash = reviewEmbeddingHash(content);
  const prev = existing.get(slug);
  if (prev && prev.hash === hash && prev.model === EMBEDDING_MODEL) {
    skipped++;
    continue;
  }
  pending.push({slug, content, hash});
}

if (pending.length > 0) {
  console.log(`Embedding ${pending.length} review(s) with ${EMBEDDING_MODEL}…`);
  const embeddings = await embedDocuments(pending.map((p) => p.content));
  const now = new Date().toISOString();
  const rows = pending.map((p, i) => ({
    slug: p.slug,
    content: p.content,
    embedding: embeddings[i],
    model: EMBEDDING_MODEL,
    content_hash: p.hash,
    updated_at: now,
  }));
  const {error: upsertErr} = await supabase
    .from("review_embeddings")
    .upsert(rows, {onConflict: "slug"});
  if (upsertErr) {
    console.error(`Upsert failed: ${upsertErr.message}`);
    process.exit(1);
  }
}

// Safety floor: never prune against an empty/suspect dataset. If Sanity returns
// 0 reviews while the table already has rows (a misconfigured project/dataset in
// .env.local, or a transient empty fetch that didn't throw), pruning would wipe
// every real embedding — and the rows==reviews check below would pass at 0==0,
// masking the wipe. Abort loudly instead.
if (reviews.length === 0 && (existingRows?.length ?? 0) > 0) {
  console.error(
    `Refusing to prune: Sanity returned 0 reviews but review_embeddings has ` +
      `${existingRows?.length} row(s). Check NEXT_PUBLIC_SANITY_DATASET / connectivity before resyncing.`,
  );
  process.exit(1);
}

// Prune orphans (rows whose review no longer exists in Sanity).
const liveSlugs = new Set(
  reviews.map((review) => review.slug).filter((slug): slug is string => !!slug),
);
const orphanSlugs = (existingRows ?? [])
  .map((row) => row.slug)
  .filter((slug) => !liveSlugs.has(slug));
if (orphanSlugs.length > 0) {
  const {error: delErr} = await supabase
    .from("review_embeddings")
    .delete()
    .in("slug", orphanSlugs);
  if (delErr) {
    console.error(`Orphan prune failed: ${delErr.message}`);
    process.exit(1);
  }
}

// Final verification: row count must equal the live review count.
const {count, error: countErr} = await supabase
  .from("review_embeddings")
  .select("*", {count: "exact", head: true});
if (countErr) {
  console.error(`Count failed: ${countErr.message}`);
  process.exit(1);
}
console.log(
  `Done. embedded=${pending.length} skipped=${skipped} ` +
    `pruned=${orphanSlugs.length} | table rows=${count} (reviews=${liveSlugs.size})`,
);
if (count !== liveSlugs.size) {
  console.error(`WARNING: row count ${count} != review count ${liveSlugs.size}.`);
  process.exit(1);
}
