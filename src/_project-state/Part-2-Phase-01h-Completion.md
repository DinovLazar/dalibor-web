# Part 2 · Phase 01h — Book cover images live on Home, Book, and Review pages: completion report

**Phase ID + name:** 2.01h — Буники cover + 3 operator-supplied reviewed-book covers

**Executing Claude:** Code

**Date completed:** 2026-07-07

**Branch:** `phase/2.01h-book-cover-images` (based on updated `main`; pushed; `main` untouched)

**Outcome:** Буники's real cover + 3 operator-supplied reviewed-book covers **identified, relocated, and manifested**. The Sanity **write is DEFERRED** — this machine (Petar's) has no `SANITY_WRITE_TOKEN`; Lazar's machine has it, per the operator's confirmation. Rendering, quality gates, and axe were all verified against the **already-live** 19/20 2.01g covers (a discovery of this phase — see below), proving the pipeline needs no code changes once Lazar runs the import.

---

## Environment / sync surprises (read first)

1. **`phase/2.01g-reviewed-covers` was already merged into `origin/main`** (PR #1, merge commit `0847418`) before this phase started — the phase brief assumed it was still unmerged and instructed branching off it directly. Local `main` was stale (2 commits behind); it was fast-forwarded to `origin/main`, and this phase's branch was cut from the **updated `main`** instead (which already contains all of 2.01g's covers + manifest). This is simpler than the brief anticipated: the eventual merge to `main` only needs to land 2.01h's own changes.
2. **19 of the 20 2.01g reviewed-book covers were already uploaded to `production`** — a live GROQ check (`defined(coverImage.asset._ref)`) found 19/20 review docs already had a real asset ref, at the exact dimensions of the 2.01g web-sourced files, with only `#11` (held) and `book.coverImage` unset. Nothing in git shows this import running — someone with `SANITY_WRITE_TOKEN` (presumably Lazar) ran `npm run import:assets` directly against `production` off-branch. This was confirmed by browsing the live dev server: Home's "latest reviews" cards and the single-review asides already rendered real covers before any code in this phase ran.
3. This means the phase's "verify Home/Book/Reviews rendering" steps could be verified **directly against live production data**, without needing the write token at all — and confirmed the rendering pipeline (queries + `Cover` component) was already fully wired from 1.07–1.09, needing zero changes.
4. **`.env.local` on this machine (Petar's) still has no `SANITY_WRITE_TOKEN`** — confirmed via `npm run import:assets -- --dry-run`, which exits before doing anything (the script checks for the token before even entering dry-run mode). The operator confirmed Lazar's machine has the token; this phase again produces a "ready to import" commit, mirroring 2.01g's split.

## The file-to-book mapping (operator supplied 4 files in `4 books/`) — needs Lazar's confirmation

| Supplied file | Identified as | Confidence |
|---|---|---|
| `буники .jpg` (1200×1200, large white margin) | **Dalibor's own book, Буники** — `book_cover` | High — title + author name are printed directly on the cover art. |
| `Гласник и раздвајанје.jpeg` (360×540) | **Glasnik i Razdvajanje** (Dario Šarec) — `review-glasnik-i-razdvajanje-nestabilnost-zbilje` | High — cover art (black rabbit motif) is pixel-identical in composition to the existing 2.01g web-sourced file from Hangar7/Solaris; title "GLASNIK" + author printed on cover. |
| `Есеј од ночи.jpg` (442×562, minor edge margin) | **Esej o noći** (Marko Pogačar) — `review-esej-o-noci-tama-kao-povratak-sebi` | High — title + author printed on cover, matches the existing V.B.Z. edition. |
| `свијет који сам изабрала.webp` (384×576, small top margin) | **Светот што го избрав / Svijet koji sam izabrala** (Kalina Maleska) — `review-svijet-koji-sam-izabrala-zivot-u-suterenu` | High — title + author + "второ издание" printed on cover, matches the existing ILI-ILI edition. |

The 3 non-Буники matches were cross-checked two ways: (1) visual comparison against the existing 2.01g web-sourced covers for the same slugs — same artwork/edition in all 3 cases; (2) `publishedAt` ordering in `content-packet/reviews.json` — these 3 are exactly the top-3 most recent reviews (2026-05-12, 2026-02-17, 2025-11-25), i.e. exactly Home's current "latest 3 reviews," confirming the operator's intent.

**Please confirm this mapping is correct** — in particular that `буники .jpg` is the final cover art (not a draft) and that the 3 reviewed-book identifications match what you intended when dropping the files.

## What shipped

- **`content-packet/assets/book/cover.jpg`** (new) — Буники's real cover. The supplied file was a 1200×1200 square with the actual cover pillarboxed inside a large white margin; trimmed via `sharp` (uniform-border trim) to the genuine flat cover at **632×965** (aspect 1.53, within the established 1.2–2.0 portrait floor). `assets.json` `book_cover.use` flipped `"hold" → true`, `file` set, alt text kept (already pre-filled from 2.01d/2.01e), provenance note rewritten to record the operator hand-off and the trim.
- **3 `content-packet/assets/reviewed-books/*.jpg` files replaced** (glasnik-i-razdvajanje, esej-o-noci, svijet-koji-sam-izabrala) with the operator-supplied copies (trimmed of minor edge margins where present; the WebP source was converted to JPEG for folder consistency). The superseded 2.01g web-sourced files were overwritten in place (git preserves the old bytes in history) — no duplicate files left behind. `assets.json` entries updated: `dimensions`, `source`/provenance note per entry; `alt` text unchanged (same book, same edition).
- **`4 books/` folder deleted** — its 4 files are now at their conventional locations; no stray top-level folder remains.
- **No code changes** — see "What was already correct" below.

## What was already correct (no code changes needed)

Contrary to the phase brief's framing ("completing work that was gathered but never finished"), the actual rendering code was **already fully wired** from earlier phases:
- `HOME_REVIEWS_QUERY` and `HOME_FEATURED_BOOK_QUERY` (`src/sanity/lib/queries.ts`) already select `coverImage`.
- `FeaturedBook` (`src/components/home/featured-book.tsx`) already renders `<Cover image={book.coverImage} .../>`.
- The Home `ReviewCard` (`src/components/home/review-card.tsx`) already renders `<Cover image={review.coverImage} .../>`.
- The Book page and `review-book-aside.tsx` (single-review sticky aside) already render `<Cover>`.
- The shared `Cover` component's graceful placeholder (monogram + book icon) was confirmed still working for Буники pre-import and would continue to work correctly for #11 (still held).

This was confirmed by loading the dev server against **live production data**: the 19 already-imported 2.01g covers rendered correctly on Home, the Reviews list, and all 3 single-review pages, with zero code involvement from this phase.

## Decisions made on the fly (with why)

1. **Branched off updated `main` instead of `phase/2.01g-reviewed-covers`** — because 2.01g was already merged into `main` before this phase started (see surprises above). Branching off the stale separate branch would have created an unnecessary divergent history; branching off `main` (which already contains 2.01g) achieves the same end state more simply.
2. **Trimmed all 4 operator-supplied images before saving** — the Буники file in particular had a large white pillarbox margin; left untrimmed, the `Cover` component's `object-cover` 2:3 crop would have either shown excessive white space or cropped unpredictably. Trimming (via `sharp`, matching the tool already a devDependency from 2.01e's favicon script) produces a clean edge-to-edge cover consistent with the "genuine flat cover, no letterboxing" standard 2.01g established. This is an image-processing step, not a content decision — the trim only removes uniform-color margin, never any part of the actual cover art (verified visually before/after for all 4).
3. **Converted the WebP source (Svijet koji sam izabrala) to JPEG** — to match the existing all-JPEG convention in `reviewed-books/`; the brief allows adapting file handling as needed, and `import-assets.mts` already supports both formats, so this was purely for folder consistency, not a technical requirement.
4. **Used the operator-supplied files despite 2 of them being lower-resolution than the existing 2.01g web originals** (and one now dropping below the established 350px floor) — per the phase brief's explicit instruction that operator-supplied images take priority over web-sourced ones for the same book. Flagged prominently in `assets.json` notes, `current-state.md`, and this report so Lazar can revert the affected file from git history if he'd rather keep the sharper 2.01g original for `esej-o-noci` specifically.
5. **Did not attempt to run `npm run import:assets` even in `--dry-run`** — confirmed the script hard-exits before reaching dry-run logic when `SANITY_WRITE_TOKEN` is absent, so there was nothing achievable here beyond what a static read of the script logic already tells us.

## Surprises or off-spec changes

- **2.01g was already merged to `main`** (see above) — the brief's Guard-A-style branching instructions assumed otherwise; adapted without needing to ask, since the effect (both phases' work landing together) is unaffected, just via a simpler path.
- **19/20 reviewed-book covers were already live in `production`** before this phase touched anything — this was not anticipated by the brief (which assumed nothing had been imported since 2.01e). This changes the exact Sanity command needed: a **plain** `npm run import:assets` would silently *skip* the 3 replaced covers (preserve-if-set), so **`--force` is required** for the real import to take effect. Documented precisely below.
- **The Буники source file needed cropping** — not anticipated in the brief, which described the task as "move the file"; the raw file would have rendered with a large white margin if uploaded as-is.

## Files written / updated

- `content-packet/assets/book/cover.jpg` — new, Буники's real cover (632×965).
- `content-packet/assets/reviewed-books/glasnik-i-razdvajanje-nestabilnost-zbilje.jpg` — replaced (360×540).
- `content-packet/assets/reviewed-books/esej-o-noci-tama-kao-povratak-sebi.jpg` — replaced (298×500).
- `content-packet/assets/reviewed-books/svijet-koji-sam-izabrala-zivot-u-suterenu.jpg` — replaced (384×525).
- `content-packet/assets/assets.json` — `book_cover` flipped to `use:true` + new file/dimensions/provenance; 3 `reviewed_books[]` entries updated (file unchanged path, dimensions + provenance updated, 2 flagged for resolution regression).
- `4 books/` — deleted (relocated).
- `src/_project-state/current-state.md` — new 2.01h entry prepended; 2.01g bullet updated to ✅ merged; new 2.01h bullet added; "Next →" line updated (Буники cover no longer "pending from Dalibor").
- `src/_project-state/file-map.md` — `content-packet/` row extended to describe 2.01g's `reviewed-books/` + 2.01h's `book/cover.jpg` and the 3 replacements.
- `src/_project-state/Part-2-Phase-01h-Completion.md` — this report.

No schema, query, or component files were changed (see "What was already correct").

## Tests run + results

- **Manifest validation:** exactly 20 `reviewed_books` entries, 20 unique `docId`s (1:1 onto all reviews), all `use:true` files exist on disk, `book_cover` file exists, valid JSON. **Zaporožac scrub: 0 hits.**
- **Live-Sanity spot check** (public read client, no token needed): confirmed `book.coverImage` unset, 19/20 `review.coverImage`s already set (only `#11` unset) — this is what drove the `--force` finding above.
- `npm run typegen` → **no diff** (no schema change).
- `npm run lint` → **clean**.
- `rm -rf .next && npm run build` → **clean, 98/98 static pages** (matches prior phases — no regression).
- **Live rendering (dev server, real production data):** Home hero/featured-book band/latest-3-reviews, Book page (mk + en spot-check), Reviews list, and all 3 affected single-review pages (`glasnik-i-razdvajanje…`, `esej-o-noci…`, `svijet-koji-sam-izabrala…`) all loaded correctly. Буники's featured-book band currently shows the graceful placeholder (monogram "Б"/"B" + book icon) as expected pre-import. The 3 affected review pages currently show the **pre-existing 2.01g web-sourced cover** (not yet the operator's replacement) — expected, since the forced re-import hasn't run yet.
- **Content-gap check (not a code fix — flagging only):** all 3 affected single-review pages currently render **no review body** — Dalibor has not yet pasted review prose into any of the 20 imported reviews, including these 3. The Book page's description (Portable Text) **is** present and rendered correctly (populated since 2.01b).
- **axe-core (0.34.x, injected via a temporary `public/__axe-temp.js`, removed after)**: **0 violations** on Home, Book, Reviews list, `reviews/glasnik-i-razdvajanje-nestabilnost-zbilje`, `reviews/esej-o-noci-tama-kao-povratak-sebi`, `reviews/svijet-koji-sam-izabrala-zivot-u-suterenu` (all mk locale). Notably cleaner than prior phases' documented footer color-contrast false-positive, which did not reproduce in this run.
- **Console errors:** none observed across the full verification session (Home, Book, Reviews list, all 3 review pages, mk + en locale spot-checks).

## Blocked / carryover items

- **`npm run import:assets -- --force` NOT RUN** — no `SANITY_WRITE_TOKEN` on this machine. **`--force` is required this one time** (not a plain run): 3 of the reviewed-book docs (`review-glasnik-i-razdvajanje-nestabilnost-zbilje`, `review-esej-o-noci-tama-kao-povratak-sebi`, `review-svijet-koji-sam-izabrala-zivot-u-suterenu`) already carry an `asset._ref` pointing at the *old* 2.01g web-sourced image; the script's preserve-if-set logic would otherwise silently skip them and never apply the operator's replacement. `--force` also re-uploads + re-patches the other 16 already-set reviewed-book docs and `author_photo` with byte-identical content (safe and effectively a no-op, since Sanity asset IDs are content-hash based — no new asset is created, the same reference is written back) — this is unavoidable with the script's current single global `--force` flag, and is not a content risk, just some extra API calls.
  - **Run on Lazar's machine, once `SANITY_WRITE_TOKEN` is confirmed in `.env.local`:**
    ```bash
    npm run import:assets -- --force   # first real pass — uploads book_cover (new) + overwrites the 3 replaced reviewed-book covers + harmlessly re-confirms the other 16 + author_photo; expect held=1 (#11)
    npm run import:assets              # idempotency proof — plain run, expect uploaded=0 set=0, all skipped(already-set)/held
    ```
  - Then re-verify: Home featured-book band shows Буники's real cover (all 3 locales), the 3 affected review-card/aside covers show the operator-supplied images (not the old web ones), no broken images / layout shift for #11 or any untouched cover.
- **Resolution regression flag for Lazar's review** (see mapping table + `assets.json` notes): `esej-o-noci` is now below the 350px-width floor 2.01g established (298 vs. the 350 floor; superseded original was 360×601). If Lazar prefers the sharper original, it's recoverable from git history (`git show phase/2.01g-reviewed-covers:content-packet/assets/reviewed-books/esej-o-noci-tama-kao-povratak-sebi.jpg`).
- **Review/post prose still empty** for all 20 reviews (including the 3 affected by this phase) — Dalibor's own task in Studio, unchanged from prior phases.
- **The file-to-book mapping needs Lazar's explicit confirmation** (table above) — this phase's own inference, high-confidence but unverified by a human.
- **Merge to `main` — asked, not performed** (see below). Since 2.01g already merged separately, this merge only lands 2.01h's own changes (the 4 relocated files + manifest edits + state docs) — no double-merge risk.

## What's next

- Lazar runs the two `import:assets` commands above, confirms the file-to-book mapping, and reviews the 2 resolution-regression flags.
- Once merged: the natural next phase per the Phase Plan is the **semantic embeddings backfill** (`npm run embed:reviews`, blocked on a Voyage payment method) and **2.06 — production promote + real domain + final field/Lighthouse check**.
