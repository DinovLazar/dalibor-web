# Part-1-Phase-09-Completion.md

> **Location in repo:** `src/_project-state/`

---

**Phase ID + name:** 1.09 — Reviews list + topic search + single-review pages

**Executing Claude:** Code

**Date completed:** 2026-06-07

---

### What shipped

- **Real Style A Reviews list** at `/[locale]/reviews` (mk/en/sr), replacing the 1.05 proof stub: `PageHeader` (eyebrow "Archive" + one-line lede), an SSR **topic-chip filter** ("All" + one chip per topic), a progressively-enhanced **search box**, then a single-column stack of shared `ReviewCard` "library rows". Localizes mk→en→sr with the "available in: …" note; calm empty state when a topic has no reviews.
- **Topic filtering is SSR and JS-free**: chips link to `/[locale]/reviews?topic=<slug>`; the page filters server-side from `searchParams.topic` and marks the active chip with `aria-current`. (The route is therefore `ƒ` dynamic — the deliberate trade for shareable/crawlable/no-JS filtering.)
- **Keyword search works locally with zero keys**: the search box POSTs `{q, locale, topic}` to our own API route and swaps the SSR list for client results in place, with a "showing results for …" header, a Clear affordance, the §6.9 empty state, and a loading spinner — no layout shift, reduced-motion respected.
- **Real Style A single-review page** at `/[locale]/reviews/[slug]`: back link (§6.17), breadcrumb (≥sm, §6.14), `<h1>` + §6.16 double rule, date + availability note (§6.13), the full body via the **shared Portable Text renderer with the §3.6 drop cap**, foot topic-chips linking to `?topic=`, a second back link, and a sticky **reviewed-book aside** (cover, "Reviewed book" eyebrow, title + alternate-script subtitle, author · year, publisher, and the review's original `source` link). `generateStaticParams` (3 locales × 4 reviews), `notFound()` on unknown slug, minimal `generateMetadata`.
- **Search backend (two-tier, semantic-with-keyword-fallback, all server-side)**: `searchReviews` orchestrator returns an honest `mode` flag; `keyword.ts` (diacritic- + case-insensitive AND-match over title/book/author/topic-labels/body); `embeddings.ts` (Voyage wrapper — the SOLE Voyage access point); `supabase.ts` (server-only service-role client); `POST /api/reviews/search`; and the **dormant** `POST /api/reviews/reindex` (env-gated + `x-webhook-secret`, wired live in 2.03).
- **Supabase migration written, NOT run**: `supabase/migrations/0001_review_embeddings.sql` — `review_embeddings` table (`vector(1024)`), HNSW `vector_cosine_ops` index, RLS enabled, `match_reviews(query_embedding, match_count, match_threshold)` RPC.
- **Shared infra**: promoted `home/cover.tsx` → `components/cover.tsx` (now used by Home/Book/Reviews; 3 importers updated); new sync, server+client-safe `components/reviews/review-card.tsx`; `PortableText` gained an opt-in `dropCap` prop (About/Book unchanged); 5 new typed queries (`REVIEWS_LIST`, `REVIEWS_SEARCH`, `REVIEW_BY_SLUG`, `REVIEW_SLUGS`, `TOPICS`) superseding the thin `REVIEWS_QUERY`; `localize.ts` gained `availableInLabel` + `resolveTopics`; the `reviews` i18n namespace expanded in en/mk/sr; `.env.example` search vars appended.

### Decisions made on the fly (with why)

- **Embedding model + dims:** `VOYAGE_MODEL` defaults to **`voyage-3.5`** (1024-dim, multilingual); the pgvector column is **`vector(1024)`** (a documented constant `EMBEDDING_DIMENSIONS = 1024`). The migration was **not executed**. Both `voyage-3.5` and `voyage-4` default to 1024 dims, so 2.03 can pick the final model without changing the migration.
- **Voyage SDK API (verified against the installed package, not docs):** `createVoyage().embeddingModel('voyage-3.5')` (the `textEmbeddingModel` alias is **deprecated** in v4); `embed`/`embedMany` from `ai@6`; `providerOptions.voyage.inputType: 'query' | 'document'`. Provider built lazily so importing `embeddings.ts` needs no key.
- **Search-result cards omit the excerpt.** The locked `ReviewSummary` contract carries no `excerpt` field, so client search-result cards render without one — a minor, intentional visual difference vs the SSR list cards (which do show excerpts).
- **Reviewed-book aside renders the review's `source`, not purchase links.** The mockup shows a generic "where to find it" purchase list, but the `review` schema has **no reviewed-book purchase links** — only `source` (where the review first appeared). We render the real `source` (external link when a URL exists) and never fabricate "where to buy" links. Schema is the source of truth.
- **Alternate-script book subtitle** in the aside: the first of `en→sr→mk` that differs from the active-locale title (so `/mk` also surfaces the Latin form) — honors §7.4 "title in both scripts" using only real data.
- **Terminology aligned with the live nav, not Appendix D.** Back link / breadcrumb use "Критики"/"Kritike" + "Назад кон критиките"/"Nazad na kritike" (matching the shipped nav) rather than Appendix D's "рецензии"/"рецензије". The aside eyebrow uses the mockup's "Рецензирана книга"/"Recenzirana knjiga". The критика-vs-рецензија terminology question (open since 1.04) is unchanged.
- **`Load more` (§6.18) deferred.** Not in this phase's Definition of Done; with 4 seed reviews it is unnecessary. The list renders all reviews. (Carryover.)
- **Single-review meta omits reading-time** (the mockup's "7 мин читање"). Not required by the DoD; would need a word-count pass. Meta shows the date (+ availability note).
- **Two review queries kept separate.** `REVIEWS_LIST_QUERY` (no `body`) keeps the per-request list render lean; `REVIEWS_SEARCH_QUERY` adds `body` only for the on-demand search route. Semantic `match_count = 24`.
- **Topic-scoping stays in JS** on the hydrated Sanity set (topics live in Sanity, not the vector table) — we never chain `.eq()` onto the RPC (decision #5).
- **Search submits deliberately** (Enter / the leading Search button), not type-ahead, so the paid Voyage path in 2.03 stays intentional. Input focus uses a ring + colour change (no border-width change) to avoid layout shift.
- **Promoted `Cover` to `src/components/cover.tsx`** (it was generic, only living under `home/`); updated its 3 importers (home review-card, home featured-book, Book page).
- **Kept the existing `home/review-card.tsx` separate** from the new shared `components/reviews/review-card.tsx`: the Home card is an async server component coupled to `HOME_REVIEWS_QUERY_RESULT`; the new one is sync and renders from both the server list and the client search results. Both reuse `Cover` / `monogramOf` / the date helpers — no duplicated cover/monogram/date logic.

### Surprises or off-spec changes

- **Flagged deviation (as the brief required):** Voyage is reached through the **community `voyage-ai-provider@4`** — there is no first-party `@ai-sdk/voyage`. It is isolated entirely behind `src/lib/search/embeddings.ts` (`embedQuery` / `embedDocuments`), so Phase 2.03 can switch to the Vercel AI Gateway or a direct REST call without touching any call site.
- **`/api` was already excluded** from the proxy matcher (`(?!api|_next|_vercel|studio|.*\\..*)`), so Step C #1 needed no change.
- **`server-only` was not installed**; added it so the server-only search modules get a real build-time guard (the standard Next.js enforcement for the isolation in decisions #2/#4).
- Live repo matched `current-state.md` / `file-map.md` throughout — no material discrepancies to flag.

### Files written / updated

**New — search backend (`src/lib/search/`, `src/app/api/`, `supabase/`):**
- `src/lib/search/types.ts` — the `ReviewSummary` / `SearchRequest` / `SearchResponse` contract.
- `src/lib/search/embeddings.ts` — Voyage wrapper (sole access point), server-only.
- `src/lib/search/supabase.ts` — server-only service-role Supabase client.
- `src/lib/search/keyword.ts` — diacritic/case-insensitive keyword matcher + `blocksToPlainText`.
- `src/lib/search/reviews-search.ts` — orchestrator (semantic→keyword fallback, honest `mode`).
- `src/app/api/reviews/search/route.ts` — `POST` search route (the only surface the browser sees).
- `src/app/api/reviews/reindex/route.ts` — dormant `POST` re-index route (wired in 2.03).
- `supabase/migrations/0001_review_embeddings.sql` — written, **not run**.

**New — Reviews UI (`src/components/reviews/`, `src/app/[locale]/reviews/`):**
- `src/app/[locale]/reviews/page.tsx` — real Style A list (replaces the 1.05 stub).
- `src/app/[locale]/reviews/[slug]/page.tsx` — real Style A single review (+ drop cap, `generateStaticParams`).
- `src/components/reviews/review-card.tsx` — shared sync presentational library-row card.
- `src/components/reviews/reviews-list.tsx` — SSR list (server, async).
- `src/components/reviews/topic-filter.tsx` — SSR chip filter.
- `src/components/reviews/review-search.tsx` — `'use client'` search box wrapping the SSR list.
- `src/components/reviews/review-results.tsx` — `'use client'` search results + empty state.
- `src/components/reviews/review-book-aside.tsx` — the §7.4 reviewed-book card.

**Promoted / edited:**
- `src/components/cover.tsx` — promoted from `home/cover.tsx` (deleted the old path); shared.
- `src/components/portable-text.tsx` — added the opt-in `dropCap` prop.
- `src/sanity/lib/queries.ts` — 5 new typed queries; removed `REVIEWS_QUERY`.
- `src/sanity/lib/localize.ts` — added `availableInLabel` + `resolveTopics`.
- `src/components/home/{review-card,featured-book}.tsx`, `src/app/[locale]/book/page.tsx` — `Cover` import path.
- `src/messages/{en,mk,sr}.json` — expanded `reviews` namespace.
- `.env.example` — appended the 5 search vars (empty + commented).
- `package.json` / `package-lock.json` — `ai`, `voyage-ai-provider`, `@supabase/supabase-js`, `server-only`.
- `src/sanity/sanity.types.ts`, `schema.json` — regenerated (now 12 typed queries).

### Tests run + results

- `npm run typegen` → 12 typed queries, 23 schema types. ✅
- `npm run lint` → clean (no warnings/errors). ✅
- `npm run build --webpack` → clean. TypeScript passed in ~7s; 38 static pages generated; `/[locale]/reviews` dynamic (`ƒ`), `/[locale]/reviews/[slug]` SSG (12 paths), `/api/reviews/{search,reindex}` dynamic, About/Book/Home still static (no regressions). ✅
- **Manual browser verification** (prod server): `/mk/reviews`, `/sr/reviews` (Serbian Latin chrome), the list, topic filter (`?topic=placeholder-identity` → exactly the 2 tagged reviews + active chip), keyword search (`Maleska`→1, `јазик`→1, `pogacar`→1 proving **case + diacritic folding**, no-match→0 with `status 200`, empty→all 4, honest `mode:"keyword"`), the client search UI (replaces list → results header + Clear), the single review (`::first-letter` computed style = **63px caramel Playfair**, i.e. the §3.6 drop cap), the `/en` MK-only review (mk fallback content + "Available in: MK" + English chrome), and About + Book (`hasArticleBody: false` — no drop cap leaked; promoted `Cover` renders the §6.11 placeholder). No console warnings/errors. ✅
- `/simplify` pass: 6 fixes applied (shared `availableInLabel`/`resolveTopics` helpers; forward-pass `semanticSearch`; haystack from the summary; single-sourced `semanticConfigured`; React `cache()` on the single-review fetch); 5 findings consciously skipped. Re-lint + re-build clean. ✅

### Proven vs unproven

- **Proven locally:** the Reviews list, the SSR topic filter, the single-review page (incl. the §3.6 drop cap), the mk→en→sr fallback + "available in" note, and **keyword search** — all verified in the browser and via direct API calls.
- **Unproven until 2.03 (coded + type-checks, dormant behind the env-presence gate, with a `try/catch` runtime fallback):** the **semantic** embedding path, the `match_reviews` RPC, and the **re-index** route. There are no Voyage/Supabase keys and only `[PLACEHOLDER]` content, so **no "it works" claim is made about the semantic path** — it is written and builds, nothing more.

### Blocked / carryover items

- **Semantic search + re-index go live in 2.03:** add real `VOYAGE_API_KEY` / `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` (+ `SANITY_WEBHOOK_SECRET`) to `.env.local`, **run** `0001_review_embeddings.sql`, embed real content, and wire the Sanity → `/api/reviews/reindex` webhook.
- **`Load more` (§6.18)** and **single-review reading-time** deferred (not in the DoD).
- **критика vs рецензија** terminology still open (1.04 carryover); the Reviews UI uses "Критики"/"Kritike" to match the nav.
- **`review.coverImage` is required** but seed reviews have no cover (intentional no-image proof; real covers in 2.01) — cards + aside show the §6.11 placeholder.
- **`npm audit`:** now **19 moderate** (transitive; Sanity toolchain + the new ai/supabase chains). `--force` would break; revisit on upstream bumps.

### What's next

- **1.10 — Blog (list + single-post pages from Sanity).** The single-post page reuses the shared Portable Text renderer with the same opt-in §3.6 drop cap, mirroring the single-review pattern built here.

---
*Reminder: `current-state.md`, `file-map.md`, and `00_stack-and-config.md` were updated as part of closing this phase.*
