# Part 2 · Phase 2.03 — Completion Report

**Reviews "search by topic" semantic engine — brought online (locally).**

**Date:** 2026-06-15
**Status:** ✅ Complete locally. Semantic search is LIVE on `localhost` and proven end-to-end. It stays **dormant on production** (graceful keyword fallback) until the four keys are set on Vercel + the Sanity webhook is registered — the documented Cowork hand-off below, not a bug.

---

## 1. What this phase did

The semantic ("search by meaning") engine for the Reviews archive was fully built in Phase 1.09 but switched off — no keys, and its database table was never created. This phase switched it on:

1. Confirmed the embedding model + dimension and that the wrapper distinguishes query vs document `inputType`.
2. Created the pgvector table (+ HNSW cosine index + `match_reviews` RPC) in Supabase.
3. Backfilled an embedding for every review (idempotent).
4. Proved a query returns the closest reviews **by meaning** (`mode:"semantic"`), including cross-lingually.
5. Proved the keyword fallback still triggers — on missing keys **and** on a runtime error.
6. Finished + proved the "re-index on publish" webhook route (authenticated).

After this, topic search works for real locally; on production it activates the moment the keys are set on Vercel; and any real reviews imported later get embedded automatically as they're published.

---

## 2. Model + dimension decision (gates everything)

**FINAL: `voyage-3.5` at 1024 dimensions.**

- Verified live: `voyage-3.5` embeds at **1024 dims** for both `inputType: "document"` (storage) and `inputType: "query"` (search). This agrees with the migration's `vector(1024)` column, the `match_reviews(query_embedding vector(1024), …)` RPC signature, and the HNSW `vector_cosine_ops` index. **The model output, the stored column, and the index all agree.**
- The wrapper (`src/lib/search/embeddings.ts`) already sets `inputType` correctly per call; confirmed empirically.
- **`voyage-4` considered, not adopted.** The newer family also supports a 1024-dim output (a clean swap leaving the table/index untouched), but `voyage-3.5` is proven, operator-selected (`VOYAGE_MODEL=voyage-3.5`), multilingual-suitable, and already validated cross-lingually here. A future `voyage-4` swap remains a one-line `VOYAGE_MODEL` change **iff** the output is pinned to 1024 dims (re-embed via the backfill afterward).

---

## 3. Verification evidence

### 3.1 Vector store (migration applied)
- Applied in the **`dalibor-web`** Supabase project (ref **`wjqgkauzjrgnamacldgx`**; the ref matches `SUPABASE_URL` — table and app point at one DB), on a clean DB.
- **No Supabase MCP** was available in this environment, and the service-role key can't execute DDL through PostgREST, so `supabase/migrations/0001_review_embeddings.sql` was applied by the operator in the **Supabase SQL editor**.
- Verified from here via a service-role round-trip: the `review_embeddings` table exists and accepts a **1024-dim** vector (the backfill upsert succeeded → dimension agreement holds), and the `match_reviews` RPC returns ranked rows (exercised by the ranking test). The **HNSW cosine index** is created by the same migration script that created the now-verified table + RPC. *(Operator `pg_indexes` confirmation requested for the record; not blocking — the cosine NN ranking demonstrably works through the RPC.)*

### 3.2 Backfill (`npm run embed:reviews`)
```
Sanity: 4 published review(s).
Embedding 4 review(s) with voyage-3.5…
Done. embedded=4 skipped=0 pruned=0 | table rows=4 (reviews=4)
```
Row count equals the review count; vectors non-null. **Idempotent** — re-run:
```
Done. embedded=0 skipped=4 pruned=0 | table rows=4 (reviews=4)
```
(Unchanged reviews are skipped via a stored content hash; re-runs cost zero embeddings.) The current dataset is the **placeholder seed (~4 reviews of `[PLACEHOLDER]` text)**, so this proves the **pipeline** end-to-end; ranking *quality* on real content is validated after the 2.01 import — and §3.4 gives a content-independent quality proof that holds now.

### 3.3 Semantic path live (`POST /api/reviews/search`)
- `semanticConfigured()` → **true**; the route returns **`mode:"semantic"`** (not `"keyword"`), `results: 4`.
- `result[0]` keys = `slug, title, bookTitle, bookAuthor, topics, coverRef, date, availableLanguages` — exactly the `ReviewSummary` contract in `types.ts`. No UI change; the Reviews page renders semantic results identically to keyword (same shape).
- **Latency:** ~**1.2 s warm**, ~2.2 s cold (dev server). Dominated by the Voyage query embed (~400 ms) + the Sanity + Supabase network round trips; production warm functions would trim it.

### 3.4 Ranking quality — content-independent fixture test (`npm run test:semantic`)
Seeds short, realistic, **multilingual** snippets (war/MK, translation/EN, identity/SR, sci-fi/EN) into a throwaway `zfixture-` namespace, then asserts a meaning-query retrieves the right snippet; fixtures torn down in a `finally`. All 4 pass:

| Case | Query | Top | Margin |
|---|---|---|---|
| **cross-lingual** | EN "war and the long siege of a city" | **war** (MK snippet) 0.572 | vs 0.296 |
| **no-verbatim-keyword** | "rendering a poem from one tongue into another" | **translation** 0.577 | vs 0.336 |
| identity (EN→SR) | "belonging… who you are between cultures" | **identity** (SR) 0.511 | vs 0.303 |
| scifi | "voyages between the stars to far-off worlds" | **scifi** 0.552 | vs 0.268 |

Proves the model + pgvector ranking work **now**, independent of Sanity content — including a **cross-lingual** case (EN→MK) and a **no-verbatim-keyword** case.

### 3.5 Keyword fallback intact — both ways (the search box never dies)
- **keys unset** → `semanticConfigured()` false → `mode:"keyword"`, results > 0.
- **keys present but Voyage key invalid (a RUNTIME error)** → `semanticConfigured()` true → semantic throws → caught → `mode:"keyword"`, results > 0.
Confirms the fallback triggers on a **runtime error**, not only on missing keys.

### 3.6 Re-index hook (`POST /api/reviews/reindex`)
Proven with a simulated Sanity webhook POST:
- missing `x-webhook-secret` → **401**; wrong secret → **401**; (unconfigured env would → 503).
- correct secret → **200** `{"ok":true,"slug":"placeholder-essay-on-silence","model":"voyage-3.5"}`, and the row's `updated_at` **changed** (`content_hash` stayed stable since content was unchanged — exactly right).

---

## 4. Code changes

| File | Change |
|---|---|
| `src/lib/search/review-embedding-text.ts` | **NEW.** Shared, server-safe builder `buildReviewEmbeddingText` + `reviewEmbeddingHash` — the single source of the embedded text, so the reindex route and the backfill embed **identically**. Reuses the 1.09 `blocksToPlainText` flattener + `localizedValue`. |
| `src/app/api/reviews/reindex/route.ts` | Refactored to use the shared builder (was inline); now **live** (secret-checked). |
| `src/lib/search/embeddings.ts` | Added `embedQueries(texts)` — batched query embed (keeps the ranking test within Voyage's rate limit); live search still uses singular `embedQuery`. |
| `scripts/embed-reviews.mts` | **NEW.** Backfill / full resync (`npm run embed:reviews`); idempotent (content-hash skip) + orphan-prune **with an empty-dataset safety guard**. Doubles as the one-shot re-embed after 2.01. |
| `scripts/test-semantic-ranking.mts` | **NEW.** Multilingual ranking proof (`npm run test:semantic`). |
| `package.json` / `package-lock.json` | Added `tsx` (devDep) + the two scripts. |
| `.env.example` | The four search vars documented **REQUIRED** for semantic + auto-reindex (placeholders only). |
| `current-state.md` / `file-map.md` / `00_stack-and-config.md` | Updated. |

`lint` + `build` (`--webpack`) clean. `.env.local` is gitignored (`git check-ignore` confirms); no secret in any tracked file.

---

## 5. Code-review pass (subagent, diff-scoped)

No BLOCKER/HIGH. The reviewer independently verified: dimension agreement, `inputType` discipline, idempotent upserts (with `embedMany` order guarantee), the shared builder being byte-identical to the old inline logic, runtime-error fallback, reindex auth ordering, no committed secret, service-role staying server-side, and **no** Reviews UI/component changes.

- **MEDIUM (fixed):** the orphan-prune could wipe the whole table if Sanity returned `[]` (wrong dataset / transient empty) and the `rows==reviews` check would mask it at `0==0`. Added an empty-dataset guard that aborts loudly.
- **LOW (recorded, not changed):** `reviews-search.ts` passes `match_threshold: 0`, so a "semantic found nothing" result returns `mode:"semantic"` with `results: []` rather than falling back to keyword. This is **1.09 orchestrator behavior, out of 2.03 scope**, and defensible (and rare in practice with threshold 0). Noted for a future product decision.
- **LOW (addressed):** added a comment that `EmbeddableReview` is an intentional structural subset of the two query result types — keep in sync if a query drops a field.
- **NITs:** the Supabase ref in the state docs is the public subdomain (not a secret) and operationally useful — kept; `VOYAGE_MODEL` default is intentional.

---

## 6. Cowork / operator hand-off (required at/after deploy)

1. **Add a Voyage payment method** (dashboard → billing). Without one the account is capped at **3 RPM / 10K TPM**; the 200M free `voyage-3.5` tokens still apply, so it stays **free** at this site's volume. **Needed before** the real ~78-review 2.01 backfill (which exceeds 10K TPM in one pass) and to avoid intermittent 429s on live search (those degrade gracefully to keyword, but better avoided).
2. **Set the four search vars on the Vercel project** (then redeploy): `VOYAGE_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only — never `NEXT_PUBLIC`), `SANITY_WEBHOOK_SECRET`. Until set, production runs the **keyword fallback by design** (not a bug). `PREVIEW_NOINDEX` keeps the deploy non-indexed.
3. **Register the Sanity webhook** (after deploy, pointing at production):
   - Trigger: review **create / update / publish**.
   - Target: `POST https://<prod-domain>/api/reviews/reindex`.
   - Header: `x-webhook-secret: <SANITY_WEBHOOK_SECRET>` (same value as on Vercel).
   - Body: JSON containing the review `slug` (e.g. `{ "slug": "<slug>" }`).
   *(Not registered from here — it must point at the production URL and needs the keys on Vercel first.)*
4. **Run `npm run embed:reviews` once after the 2.01 content import** (the backfill doubles as the one-shot "re-embed everything" tool). With a Voyage payment method in place this completes in one pass.

---

## 7. Definition of Done

- [x] Model + dimension confirmed + consistent across wrapper / stored vectors / index (`voyage-3.5` @ 1024); `inputType` query vs document handled. Recorded in `00_stack-and-config.md`.
- [x] pgvector + table + HNSW cosine index in the correct project (`dalibor-web` / ref `wjqgkauzjrgnamacldgx`), verified (table + RPC + dimension via round-trip; index created by the applied migration — operator `pg_indexes` confirmation requested for the record).
- [x] Backfill embedded every review; `rows == reviews`; vectors non-null; idempotent / re-runnable.
- [x] `semanticConfigured()` true locally; `/api/reviews/search` → `mode:"semantic"`; latency recorded (~1.2 s warm).
- [x] Fixture ranking test passes — incl. cross-lingual + no-verbatim-keyword.
- [x] Keyword fallback proven intact when semantic is off **and** when it errors.
- [x] Reindex route: correct-secret → re-embeds; wrong/missing → 401; proven with a simulated webhook. Live registration documented for Cowork.
- [x] `.env.example` documents the four vars (placeholders); no real secret in any tracked file.
- [x] `lint` + `build` clean; code-review subagent pass done; findings resolved/recorded.
- [x] `current-state.md`, `file-map.md`, `00_stack-and-config.md` updated; this report filed.
- [x] Commit scoped to 2.03 files (2.01 deliverables left untracked); pushed to `main`.
