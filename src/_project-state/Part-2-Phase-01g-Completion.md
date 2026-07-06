# Part 2 · Phase 01g — Reviewed-book covers: completion report

**Date:** 2026-07-06
**Branch:** `phase/2.01g-reviewed-covers` (pushed; `main` untouched)
**Outcome:** Covers **downloaded, validated, and manifested** (19 usable + 1 held). The Sanity **import is DEFERRED** — this machine has no `SANITY_WRITE_TOKEN` and the operator chose "commit without importing." Render/live/axe verification follows the import.

---

## Environment note (read first)
The phase brief targets Lazar's Mac at `~/Desktop/DaliborWeb` and flags `/Users/petarjakimov/Projects/dalibor-web` as a stale clone "not to be used." This phase in fact ran **on that machine** (`Petars-MacBook-Neo.local`), after the guard tripped and the operator explicitly confirmed to proceed here. Before any work, the clone was **synced to `origin/main`** (fast-forward `bf9e313 → 2f323d0`), which brought in `scripts/import-assets.mts` + `content-packet/assets/assets.json` (Guard A then passed). Guard B passed (no `origin/phase/2.08-launch`). No app/schema code was changed by this phase.

---

## Final tally
- **Covers downloaded + validated: 19 / 19** attempted (the 20th, #11, is HELD by decision).
- **Manifest `reviewed_books`: 20 entries** — **19 `use:true`** + **1 held** (#11 `u-haosu-radosti-poetski-inat`).
- **Entries converted to held in step 2: 0.** No usable cover degraded to held; the 3 sub-floor files were rescued with larger copies of the *same* artwork (below).
- **Import tallies: n/a — NOT RUN** (no write token; see "Deferred").

## The 19 covers (measured, portrait, genuine flat covers)
| # | slug | final W×H | source used |
|---|---|---|---|
| 1 | glasnik-… | 870×1305 | hangar7.store (Solaris) |
| 2 | esej-o-noci-… | 360×601 | znanje.hr (V.B.Z.) |
| 3 | svijet-koji-sam-izabrala-… | 735×1200 | iliili.com.mk (MK original „Светот што го избрав") |
| 4 | putovanja-slijepih-… | 360×571 | znanje.hr (Disput) |
| 5 | tako-neka-bude-… | 1654×2480 | sandorf.hr |
| 6 | chinook-… | **360×526** | znanje.hr — **upgraded** (see below) |
| 7 | najbolje-je-vec-proslo-… | 1616×2480 | partizanskaknjiga.rs |
| 8 | kao-da-nema-sutra-… | **674×1000** | vbz.hr — **upgraded** |
| 9 | cimetna-pisma-… | 1668×2484 | superknjizara.hr (Fraktura) |
| 10 | bejturan-i-ruza-… | 455×700 | knjiga.ba (Buybook/V.B.Z.) |
| 12 | put-od-crvene-cigle-… | 1000×1577 | marijanacanak (Buybook) |
| 13 | albert-… | **599×1000** | vbz.hr — **upgraded** |
| 14 | oce-ako-jesi-… | 360×534 | znanje.hr (Fraktura) |
| 15 | knjiga-za-maju-… | 360×598 | znanje.hr (V.B.Z.) |
| 16 | nocni-autobus-… | 750×1200 | iliili.com.mk (MK original „Вечерен автобус") |
| 17 | do-boljeg-jucer-… | 1166×1654 | buybook.ba — largest of the set |
| 18 | ocenas-… | 622×945 | durieux.hr (**http**, relaxed cert) |
| 19 | svijet-je-gladno-mjesto-… | **300×455** | mvinfo.hr — **accepted exception** |
| 20 | pisma-iz-vinogradske-… | 525×809 | hena-com.hr |

All 19 are JPEG (magic-byte + `sharp` confirmed), portrait, aspect 1.42–1.67 (inside 1.2–2.0).

### Three sub-350 covers upgraded (not held)
The phase-table URLs for #6, #8, #13 delivered only **296×468** masters (Sitefinity `getmedia` / a fixed Ljevak file; `?width=` did not enlarge them, and upscaling is forbidden). All three are V.B.Z. titles, so — exactly as the brief sanctions for #10 ("the Znanje/Ljevak V.B.Z. listings carry the same artwork — find and use one of those instead") — I sourced a larger copy of the identical cover:
- **#6 Chinook** → znanje.hr product-image `cc785eeb-…` (360×526), same VBZ 2025 edition (ISBN 9789535208204).
- **#8 Kao da nema sutra** → vbz.hr `…/2024/07/kao-da-nema-sutra.jpg` (674×1000), same VBZ 2024 edition (ISBN 9789535207245).
- **#13 Albert** → vbz.hr `…/2023/11/albert-naslovnica.jpg` (599×1000), same VBZ edition.
Every usable cover now clears the 350px floor except #19.

### #19 accepted exception (recorded)
`svijet-je-gladno-mjesto-…` ships at **300×455** — a genuine flat cover, under the floor by the settled decision (the publisher only offers a forbidden 3D mockup; no larger flat copy exists). The 3D PNG was never used. Recorded in the entry's `note`.

### Download provenance quirks
- **iliili.com.mk (#3, #16):** curl could not resolve the host from this machine though DNS otherwise worked; retrieved by pinning the resolved IP (`--resolve iliili.com.mk:443:213.239.205.163`). Genuine 735×1200 / 750×1200 files.
- **durieux.hr (#18):** the host's HTTPS certificate did not verify; retrieved over **plain HTTP** (phase-sanctioned — "nothing insecure ships"; one-time download of a public cover). 622×945.

## Held entry
- **#11 `u-haosu-radosti-poetski-inat`** (Kalija Dimitrova, „Во хаосот радост" / „U haosu radost") — `file:null`, `use:"hold"`, `rights:"n/a — no cover file saved."`, alt pre-filled. Self-published; no flat cover exists anywhere accessible (settled decision). No banner/event-photo substitute.

## `Буники` (capped retrieval)
**Product URL NOT found within the cap → book_cover + purchase link left UNCHANGED, as the brief directs.**
literatura.mk is server-rendered, but its live **PNV Публикации** catalog — walked across every category view (`raskazi`, `kratka-proza`, `knigi`, `literatura`, `proizvodi`, ~25 titles total) plus the store search endpoints and the Google index — **does not currently list `Буники`**. No `…/raskazi/<id>-buniki` product page exists/served today. Accordingly:
- `book_cover` manifest entry: **unchanged** (still held, `file:null`) — no candidate to show at the merge gate.
- `book.purchaseLinks[]`: **unchanged** (still the site-root `https://www.literatura.mk` entry). The exact-URL patch was **not** applied (no product URL to patch to). No Sanity write was performed for step 4.

## Manifest validation (step 5)
- Valid JSON; **exactly 20** `reviewed_books` entries (19 usable + 1 held).
- Every `target.docId` = `review-<slug>` for a real slug in `reviews.json`; **all 20 reviews covered exactly once**; no duplicate docIds; `field == coverImage` throughout.
- Every `use:true` entry has `alt.mk` (schema-required once a cover is set).
- Every `use:true` `file` exists on disk.
- **Zaporožac scrub: 0 hits** across `content-packet/assets/`.

## Pre-flight (read-only)
All **20 `review-<slug>` documents exist in `production`** (public read query) → the importer will patch every target without an unknown-docId abort.

## Verification run (code-side; import-dependent parts deferred)
- `npm run typegen` → **no diff** (no schema change).
- `npm run lint` → **clean**.
- `rm -rf .next && npm run build` → **clean, 98/98 static pages** (same as `main` — no regression; the app doesn't consume `content-packet/` at build time, so covers are additive).
- **Deferred to the import run:** the actual `npm run import:assets` (+ idempotency re-run), the GROQ spot-check that 3 sample reviews carry `coverImage.asset._ref` + `alt.mk`, list/single-review cover rendering, the live-site check, and the axe pass.

## Deferred (needs `SANITY_WRITE_TOKEN`)
Steps 6–7's live portions. When the token is present in `.env.local` on a machine with write access:
```bash
npm run import:assets      # expect ≈ uploaded=19 set=19 skipped=1 (author_photo) held=2 (book_cover + #11)
npm run import:assets      # re-run: 0 uploads, all skipped(already-set)/held — idempotent
```
then verify covers render on the Reviews list + single-review aside, confirm live, and run axe. #11 renders the graceful placeholder by design.

## Definition of Done — status
- [x] Guards passed (correct checkout after sync; 2.08 absent).
- [x] 19 covers downloaded + validated (genuine flat portrait); #19 exception recorded; formats match magic bytes; 3 sub-floor upgraded (0 held-by-degradation).
- [x] `assets.json`: exactly 20 entries, valid JSON, unique correct docIds, alt mk/en/sr, scrub clean.
- [ ] `import:assets` run + idempotency + GROQ spot-check — **DEFERRED (no write token).**
- [x] `Буники`: capped-out + noted; `book_cover` held (no candidate found); `purchaseLinks` untouched; nothing renders on the Book page without approval.
- [x] `typegen` (no diff) / `lint` / clean `build` (98 pages). [ ] covers render / live / axe — **DEFERRED (post-import).**
- [x] Report + `current-state.md` updated; branch pushed; `main` untouched.
- [x] No stock/AI/3D/poster/banner image; `reviews.json` untouched; no secret committed.
