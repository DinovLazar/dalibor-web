# Part-1-Phase-10-Completion.md

> **Location in repo:** `src/_project-state/`

---

**Phase ID + name:** 1.10 — Blog (list + single-post pages)

**Executing Claude:** Code

**Date completed:** 2026-06-08

---

### What shipped
- **Real Style A Blog list** at `src/app/[locale]/blog/page.tsx` (mk/en/sr), **replacing** the Phase 1.05 connect-to-site proof route. Archive-style header (`blog.eyebrow` + `<h1>` + `blog.lede`), an **SSR `?topic=<slug>` topic-chip filter** (JS-free, `aria-current` on the active chip), a single-column stack of the new `PostCard` rows, mk→en→sr fallback + "available in" note, and a calm empty state (mirrors the Reviews empty state) when a topic matches nothing. **No keyword search box** (by design — the blog has none).
- **Shared `PostCard`** at `src/components/blog/post-card.tsx` — the richer list variant of Home's `BlogCard`: whole card is one link to the canonical post URL, text-first (title H4 → date → 2-line excerpt), optional non-interactive topic chips (max 3 + "+N"), an optional **72×72 square thumbnail** when a post has a `coverImage` (text-only otherwise), and the "available in" note when a translation is missing.
- **Real Style A single post** at `src/app/[locale]/blog/[slug]/page.tsx` (mk/en/sr): back link + breadcrumb (Home → Blog → title), `<h1>` + §6.16 double rule, date + availability note, **full body via the shared Portable Text renderer with the §3.6 drop cap enabled**, foot topic chips → `/[locale]/blog?topic=<slug>`, `generateStaticParams` (3 locales × N posts), `notFound()` on an unknown slug, **minimal** `generateMetadata`. **No reviewed-book aside** — a single `max-w-prose` reading column.
- **Generalized topic-filter**: lifted `components/reviews/topic-filter.tsx` → **shared** `components/topic-filter.tsx` with a `basePath` prop; **both** Reviews (`basePath="/reviews"`) and Blog (`basePath="/blog"`) consume it. The old reviews-scoped file is deleted. **Reviews `?topic=` confirmed unaffected** (regression-checked — see Tests).
- **Data layer**: three new typed queries in `src/sanity/lib/queries.ts` — `POSTS_LIST_QUERY`, `POST_BY_SLUG_QUERY` (+ body), `POST_SLUGS_QUERY` — mirroring the Reviews set; the thin proof-route `POSTS_QUERY` is **superseded/removed** (only that stub used it). TypeGen regenerated (now **14** queries). The Blog filter chips reflect **only topics referenced by posts** (derived from the fetched posts' topic refs) — no dead chips.
- **Seed refreshed**: added one **mk+en-only** post (`post-on-rereading`), dated newest, so the list demonstrates the "available in: MK · EN" note; the three pre-existing posts (all with topics, all three languages) are untouched. `seed.ndjson` regenerated (14 docs) and re-imported into `production` (`--replace`).
- **Trilingual Blog UI strings** added to `mk/en/sr.json` (`blog.eyebrow`, `blog.lede`, `blog.topicsLabel`, `blog.allTopics`, `blog.empty`, `blog.backToBlog`, `blog.breadcrumbLabel`).

### Decisions made on the fly (with why)
- **Step 1 schema — no change applied.** `post` **already** declared `topics` as an `array` of `reference` to `topic`, the same field name and shape as on `review`. Per the brief ("If it already has one, change nothing"), the schema was left untouched. (Only cosmetic difference: post's field title is "Topics" vs review's "Topics (tags)" — field name + shape are what matter, so left as-is.)
- **PostCard includes topic chips + an optional thumbnail.** The handover §6.7 describes the blog card as "minus the cover and chips by default," but the brief explicitly specifies "text-first (title, date, optional topic tag)" and "use a cover or excerpt only if those fields exist on `post`." `post` has both `excerpt` and `coverImage`, so I followed the brief: included non-interactive topic chips and a 72×72 square thumbnail that renders only when a post has a cover (the seed posts have none, so it is text-only in practice). Flagged here as the brief asked.
- **Partial-language post added (not downgraded).** No post was partial-language before this phase. Rather than strip a language from an existing post, I added a new mk+en-only post (matching the brief's "e.g. mk+en only" example), dated newest so the note is visible at the top of the list. Keeps the three full-locale posts intact.
- **Blog strings added in the foundation, not by the list-page stream.** The brief assigned the strings to the list stream, but I built the two pages as **parallel** subagents (per §2), and both pages need `blog.*` keys; adding the strings up front kept the two parallel agents on **disjoint files** (no race on the shared message JSONs). Same outcome, safer parallelism.
- **No test framework introduced.** The project has no test runner (1.09 added none either) and the brief expects no new dependencies. The TDD-candidate units are either reused **unchanged** (`localize.ts` mk→en→sr / `availableInLabel`) or a tiny pure prop addition (`TopicFilter`'s `basePath`); both were verified through `build` + rendered-HTML checks across all three locales rather than by adding a vitest/jest toolchain. (Provisional call — if a test harness lands in a later phase, the topic-filter and localize paths are the first units to cover.)
- **Provisional copy** (flagged for Dalibor): blog **eyebrow** "Notes / Белешки / Beleške" and the **lede** are clear literal translations, MK-primary. The blog label remains "Блог" per the brief; the open критика/рецензија question was not touched.
- **Single-post layout.** With no aside, the post uses a single centered `max-w-prose` reading column (vs. the single-review page's `max-w-[63rem]` + two-column grid + 18rem sticky aside).

### Surprises or off-spec changes
- **"No dead chips" is satisfied by mechanism, but not exercised by the current seed:** all four seed topics happen to be referenced by posts, so no chip is actually excluded in the present data. The derivation (`usedTopicSlugs` from the fetched posts) correctly guarantees any *unused* topic would be excluded; there simply isn't one to drop right now.
- A subtle verification gotcha (not a code change): grepping raw page HTML for UI strings yields **false positives**, because next-intl embeds the full messages bundle (including unfilled `{langs}` templates) in a `<script>` payload. All "absence" checks were re-run with `<script>` blocks stripped to confirm against rendered markup only.
- No stack change → `00_stack-and-config.md` deliberately **not** updated (no new dependencies; the brief said to update it only if the stack changed).

### Files written / updated
**Created**
- `src/components/topic-filter.tsx` — shared SSR topic-chip filter (generalized with `basePath`).
- `src/components/blog/post-card.tsx` — Blog list card (§6.7 / §7.5).
- `src/app/[locale]/blog/[slug]/page.tsx` — real single blog post (§7.6).
- `src/_project-state/Part-1-Phase-10-Completion.md` — this report.

**Updated**
- `src/app/[locale]/blog/page.tsx` — replaced the 1.05 proof route with the real Blog list.
- `src/app/[locale]/reviews/page.tsx` — now imports the shared `TopicFilter` with `basePath="/reviews"`.
- `src/sanity/lib/queries.ts` — added `POSTS_LIST_QUERY` / `POST_BY_SLUG_QUERY` / `POST_SLUGS_QUERY`; removed the superseded `POSTS_QUERY`.
- `src/sanity/sanity.types.ts` + `schema.json` — regenerated by TypeGen (14 queries).
- `sanity/seed/build-seed.mjs` + `sanity/seed/seed.ndjson` (+ regenerated `placeholder-cover.png`) — added the mk+en-only post; re-imported to `production`.
- `src/messages/{en,mk,sr}.json` — new `blog.*` strings.
- `src/_project-state/current-state.md`, `src/_project-state/file-map.md` — state docs.

**Deleted**
- `src/components/reviews/topic-filter.tsx` — lifted to the shared `components/topic-filter.tsx`.

### Tests run + results
- `npm run typegen` — clean (14 queries, 23 schema types).
- `npm run lint` — clean (no findings).
- `npm run build` — **succeeds.** `/[locale]/blog` is `ƒ` (Dynamic, reads `?topic`); `/[locale]/blog/[slug]` is `●` SSG, prerendering all **4 posts × 3 locales** (incl. `placeholder-on-rereading`); Reviews routes unchanged (`/reviews` ƒ, `/reviews/[slug]` SSG).
- **Manual, all three locales (against server-rendered HTML — proves the JS-free SSR path):**
  - `/[locale]/blog` renders the real page (no proof-route text), lists all 4 posts; `/sr` shows the "Dostupno na: MK · EN" note on the partial post (correctly absent on `/en` and `/mk`).
  - Topic chips show only used topics; "All" carries `aria-current` on the unfiltered view; `?topic=placeholder-translation` filters to exactly the 2 matching posts and moves `aria-current` to that chip; a non-matching slug renders the empty state. All from raw HTML (JS-free).
  - `/[locale]/blog/[slug]` renders `<h1>` + §6.16 double rule, the date/availability meta, the body via the shared renderer **with the `.article-body` drop-cap class**, foot chips linking to `/[locale]/blog?topic=…`, and the back link — with **no `<aside>` / no reviewed-book card** (confirmed with `<script>` stripped). Unknown slug → **HTTP 404**.
  - **Reviews regression:** `/[locale]/reviews` filter chips still target `/reviews`, `aria-current` correct, the search box is present, `?topic=` filters to the right reviews, and `POST /api/reviews/search` returns `{"mode":"keyword",…}`. The single-review page still renders its `<aside>`.
- Server error log after the full run: **none**.

### Blocked / carryover items
- **Reading-time + "Load more" (§6.18)** — still deferred (same as Reviews); the seed archive is tiny (4 posts).
- **Post cover thumbnails** — the PostCard supports a 72×72 thumbnail, but no seed post has a `coverImage`, so it renders text-only until real content (2.01).
- **Provisional blog copy** (eyebrow/lede) — Dalibor refines wording later; критика/рецензија terminology remains open (Reviews' concern, untouched here).
- **Full SEO/metadata/hreflang/schema/sitemap → 1.12.** Single-post `generateMetadata` is intentionally minimal.

### What's next
- **1.11 — Contact + Privacy** (replace the 1.06 stubs with the real pages; Contact wired to Formspree in Part 2). After that, **1.12** — the SEO / accessibility / Lighthouse pass closes Part 1.

---
*Reminder: `current-state.md` updated; `file-map.md` updated; `00_stack-and-config.md` not updated (no stack change).*
