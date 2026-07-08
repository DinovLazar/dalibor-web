# Part 2 · Phase 09 — Single-review "read at source" empty state: completion report

**Phase ID + name:** 2.09 — Single-review page: graceful "read at source" state for reviews awaiting their body

**Executing Claude:** Code

**Date completed:** 2026-07-08

**Branch:** `phase/2.01i-vo-haosot-cover` — **landed in the existing PR #3 per operator instruction** ("i opened a PR i want you to work in it not make a new one"), **not** the brief's `phase/2.09-review-empty-state`. `main` untouched; merge pending Lazar.

**Outcome:** The single-review page's left reading column no longer renders as an empty void beside the reviewed-book card when a review has no body — which is **every** review today (the 2.01c import loaded 20 reviews with title + reviewed-book + topics + a "first published on …" `source` link only; bodies stay empty until Dalibor pastes his own prose in the Studio). The body render is now gated: when prose exists it renders exactly as before (drop-cap Portable Text, unchanged); when it doesn't, a quiet Style A "read at source" panel renders in its place, pointing the reader at the review's original source. When Dalibor later pastes a review's prose, that page automatically renders the full body with zero further work.

---

## Sync check

- `git fetch origin` run. The working branch `phase/2.01i-vo-haosot-cover` was **0 behind / 2 ahead** of `origin/main` (the two ahead = the Phase 2.01i content commits already in PR #3), so it is fully current with `main` — no pull/rebase needed. Building Phase 2.09 on top is clean.
- **Deviation from the brief (recorded):** the brief's Tasks 1–2 call for cutting a fresh `phase/2.09-review-empty-state` branch off `main`. The operator explicitly instructed working **in the already-open PR #3** instead. So the 2.09 code was committed onto `phase/2.01i-vo-haosot-cover`. Consequence flagged: PR #3 now contains both the 2.01i cover content **and** the 2.09 code — a mixed-concern PR, which is the accepted tradeoff of the operator's "work in it, don't make a new one" instruction.

## What shipped

- **`src/app/[locale]/reviews/[slug]/page.tsx`** — three edits:
  1. `import { ArrowLeft, ExternalLink } from "lucide-react";` (added `ExternalLink`).
  2. Added `const sourceName = review.source?.sourceName;` / `const sourceUrl = review.source?.sourceUrl;` beside the existing `body` computation — read the same way `review-book-aside.tsx` reads them.
  3. Wrapped the body render in a `body ? (…) : (…)` conditional inside the `<div className="reveal reveal-2 min-w-0">` reading column. Truthy branch = the original `<PortableText value={body} dropCap lang={…} />` verbatim. Falsy branch = the new panel.
- **`src/messages/{mk,en,sr}.json`** — three keys added to the `reviews` namespace, exact copy from the brief (`fullTextAtSource`, `readFullReview`, `fullTextPending`); `sr` in Latin script to match the file.

### The empty-state panel

- Container: `<div className="max-w-prose rounded-card border border-border bg-surface p-6">` — a soft, quiet aside within the reading measure, existing tokens only (Decisions #20 / Style A). Sits at the top of the reading column; the topic chips, closing `<hr>`, and footer "Back to Reviews" link render beneath it unchanged.
- **Case A — source URL + name** (the normal imported case): a `text-body text-text-muted` note line `t("reviews.fullTextAtSource", { source: sourceName })`, then a prominent external link `t("reviews.readFullReview", { source: sourceName })` → `sourceUrl`, `target="_blank" rel="noopener noreferrer"`, trailing `ExternalLink` (`aria-hidden`), and the same visible focus ring used elsewhere on the page (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus`) — mirroring the aside's link pattern.
- **Case B — name only, no URL:** just the note line, no link.
- **Case C — no source at all:** the generic `t("reviews.fullTextPending")` line.

## Decisions made on the fly (with why)

1. **Landed in PR #3 (`phase/2.01i-vo-haosot-cover`) instead of a new branch** — direct operator instruction overrode the brief's Tasks 1–2. Recorded as a mixed-concern PR (2.01i content + 2.09 code); merge remains Lazar's call.
2. **Panel style = `rounded-card border border-border bg-surface p-6` within `max-w-prose`** — chose the "soft note" option from the brief's menu (over a bare `border-t` hairline) because the reviewed-book aside directly to its right is itself a `rounded-card border bg-surface` card, so a matching soft note reads as the same book/system rather than a competing loud card. Note text uses `text-body text-text-muted` (quiet); the link uses `text-body font-medium text-primary-strong` (prominent) — no new tokens.
3. **Gated on `sourceName` for the note, `sourceUrl` for the link** — matches the brief's three cases exactly. A hypothetical "URL but no name" review falls through to `fullTextPending` (a safe graceful line); this is not a real data state (imported reviews always carry a source name), so it is an acceptable edge fallback rather than a special case.
4. **Regression proof via a temporary local body injection, not a Sanity write** — the brief's DoD suggested "temporarily paste a paragraph into one review's `body` in the Studio," but a Sanity write is explicitly out of scope. Since all 20 reviews have empty bodies in the dataset, I temporarily injected a test block array into the local `body` computation, verified the drop-cap path in the browser, then reverted (see Tests). Zero Sanity/committed-state impact.

## Surprises or off-spec changes

- **The empty-array edge cannot occur** (worth recording as it was the one real correctness question): `body` is `localizedValue(review.body, locale)`. `localizedValue` uses `hasValue`, and `hasValue([])` returns `false` (empty array → length 0), so an all-empty localized body resolves to `undefined`, never `[]`. Therefore `body ?` is truthy **only** for real, non-empty prose — the drop-cap branch never receives an empty array, and the panel is never wrongly suppressed. Confirmed empirically (mk/en/sr all showed the panel) and by the temp-body regression test (drop-cap rendered, panel suppressed).
- No other surprises — the change matched the brief exactly.

## Files written / updated

- `src/app/[locale]/reviews/[slug]/page.tsx` — the `ExternalLink` import, the two source reads, and the `body ?` conditional panel.
- `src/messages/en.json` · `src/messages/mk.json` · `src/messages/sr.json` — three `reviews.*` keys each.
- `src/_project-state/current-state.md` — `Last updated:` log prepended with the 2.09 entry (2.01i demoted to *Prior*); a 2.09 line added to the Phase status list.
- `src/_project-state/file-map.md` — single-review page row extended with the 2.09 empty state; completion-report list extended (`…/01g/01h/01i/…/09-Completion.md`).
- `src/_project-state/Part-2-Phase-09-Completion.md` — this report.
- `00_stack-and-config.md` — **not touched** (no stack/config change, per the brief).

## Tests run + results

- `npm run typegen` → **no diff** (no schema/query change; `git status` shows `schema.json`/`sanity.types.ts` unchanged).
- `npm run lint` → **clean** (no output).
- `rm -rf .next && npm run build` → **clean, 98/98 static pages**, no errors/warnings — same page count as the prior clean build (no regression).
- **Live rendering, dev server** (`preview_start`/`preview_eval`/`preview_screenshot`), on `/…/reviews/albert-poeticna-teznja-slobodi` (a real review with a `source` URL + name = Booksa, body empty):
  - **`/mk`** — panel renders: note "Оваа критика прво беше објавена на Booksa." + link "Прочитајте ја целата критика на Booksa" → `https://booksa.hr/…`, `target=_blank`, `rel="noopener noreferrer"`, `ExternalLink` svg `aria-hidden="true"`; topic chip + hr + "Назад кон критиките" render beneath. Screenshot captured.
  - **`/en`** — note "This review was first published on Booksa." + link "Read the full review on Booksa"; same href/rel.
  - **`/sr`** — note "Ova kritika je prvobitno objavljena na Booksa." + link "Pročitajte celu kritiku na Booksa" (Latin); same href/rel.
  - `{source}` interpolates to "Booksa" correctly in all three.
- **Regression (body present):** temporarily injected a test Portable Text block into the local `body` computation → `/mk/reviews/albert-…` rendered the full drop-cap body (`.article-body` present, first paragraph = the PortableText `normal` class) and the empty-state panel did **not** appear (`panelStillPresent: false`, `fallbackNotePresent: false`). Reverted; `git diff` confirms the page contains only the three intended edits, no temp remnant.
- **axe-core** (`node_modules/axe-core/axe.min.js`, served transiently from a `public/__axe-tmp.js` — `public/` did not exist before and was removed again afterward, confirmed via `ls` + `git status`): **0 violations** (24 passes) on `/mk/reviews/albert-…`; **0 violations** on `/en` and `/sr` too. The historically-documented footer `color-contrast` false positive did not even reproduce here.
- **Console errors:** none observed on any checked page/locale.
- **Code-review pass on the diff:** no blocker/high findings. The one non-obvious correctness angle (empty-array truthiness making `body ?` render a blank `<PortableText>` instead of the panel) is **provably impossible** — `hasValue([])` is `false`, so `localizedValue` returns `undefined` for an empty body. Cross-file: no callers of the page are affected; the three i18n keys exist in all three locales with the matching `{source}` ICU param. Conventions/tokens respected. No reuse/simplification finding worth acting on (the panel deliberately mirrors — not extracts — the aside's link pattern, per the brief).

## Blocked / carryover items

- **The real finish is content, not code:** Dalibor pasting each review's prose into the `body` field in the Studio. Until then every review page shows this panel; each filled body auto-renders the full drop-cap prose with zero further work.
- **Merge to `main` pending Lazar** — PR #3 (which now carries both the 2.01i cover content and this 2.09 code) is pushed; the merge gate is his call.
- Out-of-scope-by-design (unchanged from prior reports): blog single-post page can mirror this later in its own phase if wanted (not touched here).

## What's next

- **Operator action:** review + merge PR #3 into `main` when ready (deploys to the Vercel production target — still noindexed validation, `PREVIEW_NOINDEX`).
- Content: Dalibor pastes review/post prose in the Studio (the standing gap). Also still pending from prior phases: the deferred `import:assets` for the book covers (needs `SANITY_WRITE_TOKEN`), the semantic embeddings backfill (needs a Voyage payment method), and 2.06 production promote + real domain.
