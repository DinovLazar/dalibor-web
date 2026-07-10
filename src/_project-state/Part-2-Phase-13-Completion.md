# Part-2-Phase-13-Completion.md

> **Location in repo:** `src/_project-state/`
> Filled from the `Part-X-Phase-YY-Completion.md` template.

---

**Phase ID + name:** 2.13 — Header builder credit: Macedonian wording + single-line fit
*(Briefed as "Phase 2.12"; renumbered to 2.13 on execution — see "Surprises or off-spec changes" — because the 2.12 slot is already occupied by the open "EN/SR translations of Author + Book singleton prose" phase, [PR #6](https://github.com/DinovLazar/dalibor-web/pull/6), branch `phase/2.12-singleton-en-sr`.)*

**Executing Claude:** Code

**Date completed:** 2026-07-10

---

### What shipped
- The Macedonian header builder-credit lead-in `common.builtBy` in `src/messages/mk.json` changed from **"Изработено од"** → **"Изработиле"** (capital И kept — matches the label's sentence-initial position). English (`"Built by"`) and Serbian (`"Izradio"`) are byte-unchanged.
- The header builder credit `<p>` in `src/components/layout/site-header.tsx` now carries **`shrink-0 whitespace-nowrap`**, so the muted lead-in and the "Vertex Consulting" link sit together on **one line** at the `xl` breakpoint instead of collapsing into a two-line wrap. The link text/URL (`siteLinks.vertex` → `https://www.vertexconsulting.mk`), `target="_blank" rel="noopener noreferrer"`, colours (`text-primary-strong` caramel), and the `common.builtBy` key name are all untouched.
- Net diff: **2 lines** across the two files (one MK string, one className). No new routes, no new i18n keys, no dependency/schema/query/`.env`/Sanity/deploy change.

### Decisions made on the fly (with why)
- **Kept the `shrink-0` alongside `whitespace-nowrap`** (the brief specified only `whitespace-nowrap`). Reason: the credit `<p>` is one flex item in the header's `flex … gap-6` row, and **every sibling in that row is already `shrink-0`** — the wordmark `<Link>` uses the identical `shrink-0 whitespace-nowrap`, and `PrimaryNav`/`LanguageSwitcher` use `xl:shrink-0`. Adding `shrink-0` makes the credit read exactly like its siblings and guarantees it can't be shrink-collapsed by a wide MK nav. `whitespace-nowrap` alone is sufficient for the single-line result (default `min-width:auto` already prevents shrinking below the one-line min-content width — confirmed in-browser), so `shrink-0` is belt-and-suspenders and consistent-by-convention, not load-bearing.
- **Continued on the existing `phase/2.13-mk-builtby-oneline` branch rather than cutting the brief's `phase/2.12-header-credit-mk`.** Reason: the branch already existed off current `main` with exactly this phase's two edits staged in the working tree (a prior in-session pass), and the 2.12 name/number is already taken by the open singleton PR #6. Cutting a second, differently-numbered branch for the same change would collide with that PR and duplicate work. (Aligns with the standing "bundle new phase work into the in-progress branch/PR rather than spawning a fresh one" preference.)
- **Scoped the commit to the intended files instead of `git add -A`.** The brief's close-out snippet used `git add -A`, but the working tree also holds three untracked, out-of-scope files (`content-packet/intake/Dalibor-Intake-Form-MK.html`, `content-packet/review-summaries-draft.md`, `scripts/import-review-summaries.mts`) left from other work. `git add -A` would have swept them into this phase's commit, violating the DoD's "only these files changed." Added only `src/messages/mk.json`, `src/components/layout/site-header.tsx`, and the four state-doc files explicitly.

### Surprises or off-spec changes
- **Phase renumbered 2.12 → 2.13.** The brief was authored as "Phase 2.12," but on this machine the repo has already advanced: `phase/2.12-singleton-en-sr` (EN/SR singleton translations) is an open PR (#6) claiming the 2.12 slot, and the work branch for *this* task already existed as `phase/2.13-mk-builtby-oneline`. All deliverable names follow the real number: branch `phase/2.13-mk-builtby-oneline`, report `Part-2-Phase-13-Completion.md`, commit "Phase 2.13: …". Nothing about the actual code change differs from the brief's intent.
- **Doc drift corrected:** the header builder credit was not previously documented in `current-state.md` or `file-map.md`. Added a one-line note in each (the credit exists; MK wording is now "Изработиле"; single-line via `whitespace-nowrap`).
- Otherwise none — the code change is exactly the brief's intent (MK "Изработиле" + single-line credit).

### Files written / updated
- `src/messages/mk.json` — `common.builtBy`: "Изработено од" → **"Изработиле"** (MK only; still valid JSON).
- `src/components/layout/site-header.tsx` — credit `<p>` className gains `shrink-0 whitespace-nowrap` (single-line fit at `xl`).
- `src/_project-state/current-state.md` — new "Last updated 2.13" entry; documents the header credit + this change.
- `src/_project-state/file-map.md` — `site-header.tsx` row now mentions the Vertex builder credit + its `whitespace-nowrap` single-line treatment.
- `src/_project-state/Part-2-Phase-13-Completion.md` — this report.

### Tests run + results
- **In-browser (`npm run dev`, `--webpack`)** at `xl` widths **1280 / 1366 / 1440px** on `/mk`: credit renders **one line** (`<p>` height 16px = one 16px line, `white-space: nowrap`), reading "Изработиле Vertex Consulting"; "Vertex Consulting" is the caramel link (`rgb(135,86,33)` = `text-primary-strong`) → `https://www.vertexconsulting.mk`, `target="_blank"`. No header overflow (`scrollWidth == clientWidth`) and no nav collision (≈28px gap credit→nav at every tested width).
- **`/en` and `/sr`** spot-checked: lead-ins unchanged ("Built by" / "Izradio"), each on one line, no collision/overflow.
- **Mobile (375px):** credit `<p>` is `display:none` — absent from the bar (it lives in the mobile menu, unchanged); hamburger present; no horizontal overflow.
- **No browser console errors** on any of the above.
- **`npm run lint`** — clean.
- **`rm -rf .next && npm run build`** (`--webpack`) — clean; **98/98 static pages** (unchanged baseline; this change adds no routes).
- **axe** (axe-core `wcag2a/2aa/21a/21aa/22aa`, run in-browser) — **0 violations** on `/mk`; **0** on `/en` (spot-check). (axe-core was served from a throwaway `public/__axe-temp.js` and the whole temp `public/` dir was deleted afterward — not committed.)
- `typegen` intentionally **not run** (no schema change).

### Blocked / carryover items
- **Merge gate:** branch `phase/2.13-mk-builtby-oneline` pushed to the `fork` remote; PR opened → `DinovLazar/dalibor-web:main`. **Not merged** — Lazar merges via the GitHub UI (this machine's `gh` account is read-only on the upstream).
- Three untracked, out-of-scope files remain in the working tree (intake HTML, review-summaries draft + import script) — deliberately **not** part of this phase's commit; left for whatever phase owns them.

### What's next
- Lazar's merge of this PR (and of the separate open 2.12 singleton PR #6). Content-side, the real finish remains Dalibor pasting review/post prose in the Studio; go-live sequencing (2.06: promote + drop `PREVIEW_NOINDEX`) is unchanged by this phase.

---
*No `00_stack-and-config.md` entry — no stack/config change.*
