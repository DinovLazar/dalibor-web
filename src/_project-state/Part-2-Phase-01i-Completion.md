# Part 2 · Phase 01i — „Во хаосот радост" reviewed-book cover (the last held cover): completion report

**Phase ID + name:** 2.01i — „Во хаосот радост" reviewed-book cover (the last held cover)

**Executing Claude:** Code

**Date completed:** 2026-07-08

**Branch:** `phase/2.01i-vo-haosot-cover` (based on updated `main`; pushed; `main` untouched)

**Outcome:** The last held reviewed-book cover is **resolved**. The operator supplied the genuine flat front cover directly in-conversation (not via the anticipated `covers-in/` file drop) after this phase's first pass had stopped and reported it missing. The image was validated as a genuine flat portrait front cover (dried-flower photography with the title „ВО ХАОСОТ РАДОСТ" and author „КАЛИА ДИМИТРОВА" lettered on it — not the Meduza landscape promo banner), extracted, normalized to JPEG, and manifested. All **20/20** reviewed-book covers are now `use: true` with **0 held**. The Sanity **write is still DEFERRED** — this machine has no `SANITY_WRITE_TOKEN`; per Task 10, the exact operator command is documented below.

---

## Sync check (unchanged from the first pass)

- Based on updated `main` (2.01h already merged via PR #2, confirmed by `git branch -r --merged origin/main` and `git log origin/main`). Branch `phase/2.01i-vo-haosot-cover` cut from there.

## What happened (two passes in one phase)

1. **First pass — stopped as designed.** `covers-in/` did not exist and a repo-wide filename search for the book turned up nothing. Per the brief's explicit trap-avoidance instruction, no substitute (Meduza banner/event photo) was sourced from the web. This was committed and pushed as an interim stop-report (see git history on this branch).
2. **Second pass — the operator supplied the cover directly in the chat turn**, not as a `covers-in/` file drop. Since the brief's file-drop path assumes a filesystem location the operator can't always use mid-conversation, the image was instead **recovered from the session transcript**: the pasted image (base64-encoded, `image/webp`, one image block) was located in this session's `.jsonl` transcript and decoded to disk with a short Python script, landing at `covers-in/u-haosu-radosti-poetski-inat.webp` — functionally equivalent to the anticipated drop location, just sourced from the conversation instead of a pre-placed file.

## Validation against the Task 4 gate (the whole point of the phase)

- **Magic bytes:** confirmed genuine WebP (`file` reported `RIFF ... Web/P image`), decoded cleanly with `sharp`.
- **Orientation:** **1668×2000, portrait**, aspect ratio (h/w) **1.199** — within the established 1.2–2.0 floor (right at the edge, effectively 1.2; not a landscape banner).
- **Content:** depicts dried/pressed-flower photography as full-bleed cover art, with the book's Cyrillic title „ВО ХАОСОТ РАДОСТ" and the author's name „КАЛИА ДИМИТРОВА" set in cream title-card boxes directly on the cover — this is cover artwork, not an event poster or social graphic (no venue/date/audience content, no promotional copy).
- **Border check:** ran `sharp().trim()` against the source — it reported zero trim offset and unchanged dimensions, confirming the image is already edge-to-edge with no uniform margin to remove (unlike the Буники/2.01h files, which needed trimming).

## What shipped

- **`content-packet/assets/reviewed-books/u-haosu-radosti-poetski-inat.jpg`** (new) — the validated cover, re-encoded from WebP to JPEG (quality 92) at its native **1668×2000**, well above the 350px short-side floor. No cropping was needed beyond the format conversion (see border check above).
- **`content-packet/assets/assets.json`** — the single `reviewed_books[]` entry for `review-u-haosu-radosti-poetski-inat` updated: `file` → the new path, `use` → `true`, `dimensions` → `"1668x2000"`, `source`/`rights`/`note` rewritten to record operator-supplied provenance and drop the "HELD — do not substitute" language, `alt` (mk/en/sr) left **untouched** (already correct from 2.01g). No other entry in the file was touched.
- **`.gitignore`** — added `/covers-in/` so any future raw drop file at that conventional location is never accidentally committed (the directory itself was empty/removed by the time of commit, so this is forward-looking, not a fix for a leak).
- **No code changes** — confirmed (read-only) that `REVIEWS_LIST`/`REVIEW_BY_SLUG` already select `coverImage` and that `components/cover.tsx` is already rendered by both `components/reviews/review-card.tsx` and `components/reviews/review-book-aside.tsx`; verified live in the dev server (see Tests below) rather than by re-reading the source, since 2.01g/2.01h already established this pipeline needs zero changes.

## Decisions made on the fly (with why)

1. **Recovered the pasted image from the session transcript instead of asking the operator to place a file at `covers-in/`.** The operator supplied the image directly as a chat attachment mid-conversation rather than dropping a file into the repo checkout. Rather than asking them to also perform a filesystem action, the already-transmitted image data (found as a single `image/webp` content block in this session's `.jsonl` transcript) was decoded to the conventional `covers-in/` path and processed exactly as the brief describes for a file-drop — same validation, same normalization, same destination. This achieves the brief's intent (validate → normalize → manifest) without a redundant round trip.
2. **Accepted portrait ratio 1.199** (marginally under the stated "roughly 1.2" floor, rounding to it) rather than treating it as a reject — the image is unambiguously a portrait book cover (title+author lettered on it, full-bleed art, no promotional/event content), so the ratio is a soft floor here, not a hard gate; flagging it rather than silently accepting.
3. **No trim/crop applied** — `sharp().trim()` reported zero offset, confirming the supplied image is already a flat, edge-to-edge cover (no white margin or letterboxing to remove, unlike 2.01h's Буники file).

## Surprises or off-spec changes

- **The cover arrived as a direct chat attachment, not a `covers-in/` file drop** — the brief anticipated only the file-drop path. Handled by extracting the image from the session transcript rather than blocking on the operator performing a separate filesystem step (see decision #1). Documented here since it's a first for this asset-import pattern (2.01g/2.01h both used pre-placed files or web sources).
- Otherwise no surprises — the validation gate, normalization, and manifest update matched the brief exactly.

## Files written / updated

- `content-packet/assets/reviewed-books/u-haosu-radosti-poetski-inat.jpg` — new, the real cover (1668×2000).
- `content-packet/assets/assets.json` — the one `#11` entry updated (`file`/`use`/`dimensions`/`source`/`rights`/`note`); `alt` unchanged; no other entries touched.
- `.gitignore` — added `/covers-in/`.
- `src/_project-state/current-state.md` — 2.01i entry rewritten to reflect the shipped outcome (superseding the interim stop-report language from the first pass).
- `src/_project-state/file-map.md` — `content-packet/` row extended to note #11 is no longer held.
- `src/_project-state/Part-2-Phase-01i-Completion.md` — this report (rewritten from the first pass's stop-report).
- `covers-in/` — created transiently to hold the decoded raw WebP, then deleted after the JPEG was exported; never committed (confirmed via `git status`, and now `.gitignore`d for any future run).

## Tests run + results

- **Manifest validation** (`python3` + `json`): valid JSON; `reviewed_books` count **20**; all `docId`s unique; **0 held** (was 1 before this phase). Zaporožac scrub: 0 hits.
- `npm run typegen` → **no diff** (`coverImage` field pre-existed; confirmed via `git status --short src/sanity/`).
- `npm run lint` → **clean**.
- `rm -rf .next && npm run build` → **clean, 98/98 static pages**, no errors/warnings, no regression.
- **Live rendering, dev server** (`preview_start`/`preview_eval`/`preview_screenshot`/`preview_console_logs`):
  - `/mk/reviews` — the "U haosu radost: Poetski inat" card renders correctly in its normal position in the list, using the graceful placeholder (monogram "U" + book icon), identical treatment to any other card — no layout break, no console errors. **This is expected**: the field is still unset in `production` until the deferred import runs (see below); this confirms **no regression**, not the final visual.
  - `/mk/reviews/u-haosu-radosti-poetski-inat` — single-review page renders correctly (title, breadcrumb, meta, reviewed-book aside with the same graceful placeholder), no console errors.
  - `/en/reviews/u-haosu-radosti-poetski-inat` — spot-checked: correct EN chrome, correct mk→en→sr fallback ("Available in: SR"), no console errors.
- **axe-core** (`node_modules/axe-core/axe.min.js`, temporarily served from a transient `public/__axe-temp.js`, removed immediately after — `public/` did not previously exist in this repo and was removed again afterward, confirmed via `ls`): **0 violations** on `/mk/reviews` and `/mk/reviews/u-haosu-radosti-poetski-inat`. Cleaner than the historically-documented footer color-contrast false positive (didn't reproduce, consistent with 2.01h's finding).
- **Console errors:** none observed across all checked pages/locales.

Because the Sanity write is deferred, the new cover does **not** yet render in `production` — the field is currently unset there. The dev-server checks above validate **no regression**; the **actual visual cover check happens after the operator runs the import** (next section).

## Deferred Sanity write — exact operator instructions (Task 10, NOT run here)

- **Command: plain `npm run import:assets`** — **not** `--force`. Reason: `#11`'s `coverImage` is currently **unset** in `production` (it was never uploaded while held), so the importer's preserve-if-set logic does not block it; a plain run uploads the new file and patches the field.
- **This dovetails with 2.01h's still-pending import.** If the operator runs 2.01h's `npm run import:assets -- --force` (needed because 3 of 2.01h's reviewed-book docs already carry an old `asset._ref`), `#11` is uploaded and set **in the same pass** — a plain `npm run import:assets` re-run afterward should show it skipped/idempotent (0 uploads).
- **After the import:** re-verify the cover renders (not the placeholder) on `/mk/reviews`, `/mk/reviews/u-haosu-radosti-poetski-inat`, and spot-check `/en`/`/sr`.

## Blocked / carryover items

- **`npm run import:assets` NOT RUN** — no `SANITY_WRITE_TOKEN` on this machine (same split as every prior asset phase). See exact command above.
- **2.01h's own deferred write is still outstanding** (unrelated to this phase, unchanged): `npm run import:assets -- --force` still needs to run for Буники's cover + the 3 replaced reviewed-book covers.
- Review/post body prose for all 20 reviews is still pending in Studio (Dalibor's task, unchanged from prior reports).

## What's next

- **Operator action:** run `npm run import:assets` (plain, or the 2.01h `--force` pass which covers this too) on the machine with `SANITY_WRITE_TOKEN`, then re-verify the cover renders live.
- Once both this and 2.01h's imports land: the natural next phase per the Phase Plan is unchanged — **2.06, production promote + real domain + final field/Lighthouse check** (and the semantic embeddings backfill once Voyage has a payment method).
