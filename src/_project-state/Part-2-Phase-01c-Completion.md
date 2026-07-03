# Part-2-Phase-01c-Completion.md

> **Location in repo:** `src/_project-state/`

---

**Phase ID + name:** 2.01c — Reviews, posts & topics import (Code)

**Executing Claude:** Code

**Date completed:** 2026-07-03

---

### What shipped
- **Content packet in the repo** — `content-packet/topics.json` (13), `reviews.json` (20), `posts.json` (1), written verbatim from the phase appendices. Validated: unique slugs, all topic refs resolve, all 13 topics used, exactly one review (`chinook-i-dokument-i-elegija`) without `bookAuthor`, 0 Zaporožac hits, every topic has `mk`. `content-packet/README.md` rewritten (workbook/docx items superseded by the JSON; covers/portrait still pending from Dalibor; the topic-reconciliation section documented).
- **`post.source` schema field** — extracted a shared `sourceField()` factory (`src/sanity/schemaTypes/source.ts`) and used it in **both** `review.ts` and `post.ts`, so the two definitions can't drift. `review`'s generated schema stayed **byte-identical** (schema.json diff is purely the additive `post.source`). `POST_BY_SLUG_QUERY` now selects `source`; typegen regenerated (`Post`, `Review`, and `POST_BY_SLUG_QUERY_RESULT` all carry the `{sourceName?, sourceUrl?}` shape).
- **Single-post attribution** — the single-post page renders a quiet "Source → outlet" link (eyebrow + external link with the `ExternalLink` icon) when `source` is set, mirroring the single-review reviewed-book aside. New neutral `blog.source` string added in all three locales ("Source" / "Извор" / "Izvor"), matching the existing `reviews.source` wording.
- **Reviews list — used-topic chips** — the Reviews list now filters its topic chips to only topics actually used by reviews (mirrors the existing Blog list logic). Prevents dead chips now that the live taxonomy is broader than the content.
- **Importer extended, not replaced** — `scripts/import-content.mts`: the 2.01b singletons/translations logic is **untouched**; a new JSON-driven section imports reviews + posts + the two new topics, upserts idempotently with a **skip-if-unchanged** guard, scrubs Zaporožac across singletons + the parsed packet + the built docs, and deletes any leftover `[PLACEHOLDER]` docs (reviews → posts → topics, drafts included).
- **Live import run** — 20 reviews + 1 post + 2 new topics created in `production`; 0 dangling topic refs; verification passed. A second run is a genuine no-op for the packet (`created=0 updated=0 skipped=23`).

### Decisions made on the fly (with why)
- **STOP-and-ask on a live-data divergence (the big one).** The phase assumed the 2.01b state (12 `[PLACEHOLDER]` seed docs, no real topics). The live `production` dataset had instead **Dalibor's own 14-topic taxonomy** (ids `t-<slug>`, real titles), 0 reviews, 0 posts, 0 placeholders — almost certainly hand-built by Dalibor in the hosted Studio (live since 2.04) during the ~week since the snapshot. Importing the packet's 13 `topic-<slug>` docs as written would have created **27 topics with duplicate concepts** and wired reviews to a parallel taxonomy. I halted before any production write and asked the operator. **Decision (Lazar): reconcile to the live `t-*` taxonomy.**
- **Topic reconciliation map.** 11 of the 13 packet slugs map onto existing `t-*` topics (7 exact-slug; `post-yugoslav-literature`→`t-post-yugoslav`, `identity-and-belonging`→`t-identity-belonging`, `memory-and-history`→`t-memory-history`, `women-and-gender`→`t-womens-writing`). The importer references these existing topics and **never modifies them**. Two concepts Dalibor lacked were **created** in his `t-*` style: `t-essay` and `t-society-politics` ("Society & politics", localized). Operator-confirmed: `women-and-gender` → existing `t-womens-writing` (not a new topic); create both missing topics.
- **Reviews-list used-topic filter (small off-spec code change).** The Reviews page previously showed *all* topics as chips; with the broader live taxonomy that yields dead chips (`t-speculative`, `t-the-novel`, `t-war-conflict`, plus the post-only `translation`/`literary-criticism`). To honor the DoD's "topic chips show only used topics", I mirrored the Blog list's `usedTopicSlugs` filter onto the Reviews page.
- **`sourceField()` factory** rather than duplicating the ~25-line inline object — the codebase already factors shared field builders (`localizedSlug()`), so a factory is idiomatic and guarantees review/post parity.
- **Idempotency via skip-if-unchanged** — an existing doc equal to the desired doc (ignoring `_rev`/`_createdAt`/`_updatedAt`) is left untouched, so re-runs don't churn `_rev`. Achieved with a canonical (system-field-stripped, key-sorted) deep compare.
- **`publishedAt`** — packet dates are date-only (`2026-05-12`); normalized to `T12:00:00Z` (noon UTC) so every timezone renders the same calendar date. Field is `datetime` in the schema.
- **Review/post ids** kept as the spec'd `review-<slug>` / `post-<slug>` (no live review-id convention existed — 0 reviews). Topic-ref `_key` = the packet slug (stable, unique per array).

### Surprises or off-spec changes
- **The DoD's "topic = 13" no longer holds literally.** After reconciliation the dataset has **16 topics** (Dalibor's 14 + the 2 created); reviews/posts reference 13 of them. The importer's built-in verification was adjusted to assert `review==20 · post==1 · placeholders==0 · dangling==0 · 2 new topics present` instead of a fixed topic count.
- **No `[PLACEHOLDER]` docs to remove** — the seed placeholders were already cleared upstream (when Dalibor rebuilt the taxonomy). The cleanup step ran and correctly removed 0. Kept as a guard.
- **Singletons still `updated=2` on re-run** — the 2.01b singleton write uses `createOrReplace` unconditionally (left untouched per the brief), so it reports `updated=2` even when content is unchanged. The **packet** content is the part that is a true no-op (`skipped=23`). Called out here so the idempotency claim isn't misread.

### Files written / updated
- `content-packet/topics.json`, `reviews.json`, `posts.json` — **new**, the packet (source of truth; topics.json also drives the importer's map-sync guard).
- `content-packet/README.md` — rewritten (present/pending + reconciliation section).
- `src/sanity/schemaTypes/source.ts` — **new**, shared `sourceField()` factory.
- `src/sanity/schemaTypes/review.ts` — inline `source` replaced by `sourceField()` (schema-identical).
- `src/sanity/schemaTypes/post.ts` — added `sourceField()` after `topics`.
- `src/sanity/lib/queries.ts` — `POST_BY_SLUG_QUERY` selects `source`.
- `schema.json` + `src/sanity/sanity.types.ts` — regenerated (typegen).
- `src/app/[locale]/blog/[slug]/page.tsx` — renders `source` attribution.
- `src/app/[locale]/reviews/page.tsx` — used-topic chip filter.
- `src/messages/{en,mk,sr}.json` — `blog.source` string.
- `scripts/import-content.mts` — extended (packet import + reconciliation + idempotent upsert + placeholder cleanup + integrity report).

### Tests run + results
- **Import:** run 1 → topics created=2, reviews created=20, posts created=1; tallies `topic:16 review:20 post:1`; integrity `[PLACEHOLDER]:0 · dangling:0 · new topics 2/2`; **verification passed**. Run 2 (idempotency) → packet `created=0 updated=0 skipped=23`, no dupes.
- **`rm -rf .next` + `npm run typegen` + `npm run lint` + `npm run build`** — all clean; build generated **97 static pages** (was 58; +60 review pages ×3 locales + 3 blog-post pages).
- **Local render (dev):** Reviews list shows 20 entries (sr titles via fallback + "available in" note); single review renders header + reviewed-book aside + "Source → Booksa" link with empty body (Chinook correctly omits author); Blog shows the 1 post; single post renders the new "Source → Booksa" attribution + foot topics; Home latest-3 pulls the 3 newest reviews + the post; **0 `[PLACEHOLDER]` anywhere**.
- **Topic chips:** Reviews page shows exactly the 11 review-used topics (no `translation`/`literary-criticism`/`speculative`/`the-novel`/`war-conflict` dead chips); Blog shows exactly the 3 post-used topics.
- **axe (WCAG 2 A/AA + 2.1/2.2):** Reviews list, one single review, and the blog post → **0 violations each**. No console errors.
- **Code-review subagent pass:** (recorded in the phase thread) — no blocker/high.

### Blocked / carryover items
- **Reviewed-book covers + portrait + own-book cover** — reviews import with the graceful placeholder cover; real covers + the About portrait + the `Буники` cover are still pending from Dalibor (added in the Studio / a follow-up).
- **Review/post body prose** — intentionally empty (copyright-safe); Dalibor pastes it in the Studio.
- **Semantic embeddings backfill** (`npm run embed:reviews`) — still deferred until a Voyage payment method is added (3 RPM cap). The 20 new reviews are unembedded; search runs the keyword fallback by design.
- **Dalibor's 3 unused topics** (`t-speculative`, `t-the-novel`, `t-war-conflict`) remain in his taxonomy, correctly hidden from the chip filters until content uses them.

### What's next
- **2.06** — production promote + real domain + final field/Lighthouse check (plus the Vercel env vars + Sanity webhook + Voyage payment + embeddings backfill from earlier phases). No deploy / no Vercel env touched this phase.

---
*current-state.md, file-map.md, and 00_stack-and-config.md updated alongside this report.*
