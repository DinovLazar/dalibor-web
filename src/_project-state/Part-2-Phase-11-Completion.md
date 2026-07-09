# Part 2 · Phase 11 — Transliterate 3 reviewed-book alt captions to Latin (en/sr): completion report

**Phase ID + name:** 2.11 — Fix 3 image alt captions that leak Macedonian Cyrillic into the English (and Serbian) text

**Executing Claude:** Code

**Date completed:** 2026-07-09

**Branch:** `phase/2.11-alt-caption-latin`, cut off the **now-current `main`** (`04de77d`, PR #4 merged) — `main` untouched, merge pending Lazar.

**Outcome:** Three reviewed-book cover captions in the asset manifest described the image with an English (`en`) / Serbian-Latin (`sr`) sentence but left the **book title** in Macedonian Cyrillic, so an English or Serbian reader — or an English screen reader / search engine reading the `alt` attribute — hit a run of Cyrillic mid-sentence. This phase transliterated the **title only** to Latin in the `en` and `sr` slots of those three entries so each caption is single-script, keeping the template words and author names as they were. The `mk` slot (correctly Cyrillic) was left untouched on all three, and **no book/review *title* was translated** — the fix is single-script transliteration of the site's own descriptive `alt` text, per the established caption convention. **Data-only change** to `content-packet/assets/assets.json`; no schema/query/component/dependency/i18n/`.env`/Sanity-write/deploy change. The corrected captions reach the live site only when the asset importer re-runs with `--force` on Lazar's machine (see Deferred).

---

## Sync check (Step 1)

- `git fetch origin` pulled `f5e7b9b..04de77d` onto `origin/main`. **PR #4 (`phase/2.10-review-summary`) had already merged into `main`** (`04de77d Merge pull request #4 …`), carrying the Phase 2.10 summary branch (`f8c6f44`). Local `main` was 2 commits behind → `git checkout main` + `git pull --ff-only origin main` fast-forwarded it cleanly.
- **No uncommitted tracked changes blocked the pull.** Three untracked files were present in the working tree (`content-packet/intake/Dalibor-Intake-Form-MK.html`, `content-packet/review-summaries-draft.md`, `scripts/import-review-summaries.mts`) — confirmed **not tracked in `origin/main`** and **unrelated to this phase**; they were left in place, not discarded, and deliberately **excluded from this phase's commit** (see Files / Decisions).
- Branched `phase/2.11-alt-caption-latin` off the fast-forwarded `main` before touching any file.

## What shipped

`content-packet/assets/assets.json` — **six string edits + three `note` appends**, all inside the top-level `reviewed_books[]` array, `en`/`sr`/`note` slots only:

| Entry (file) | Slot | Before → After |
|---|---|---|
| `reviewed-books/svijet-koji-sam-izabrala-zivot-u-suterenu.jpg` (Kalina Maleska) | `alt.en` | `“Светот што го избрав”` → `“Svetot što go izbrav”` |
| ″ | `alt.sr` | `„Светот што го избрав“` → `„Svetot što go izbrav“` |
| `reviewed-books/u-haosu-radosti-poetski-inat.jpg` (Kalija Dimitrova) | `alt.en` | `“Во хаосот радост”` → `“Vo haosot radost”` |
| ″ | `alt.sr` | `„Во хаосот радост“` → `„Vo haosot radost“` |
| `reviewed-books/nocni-autobus-izvan-jugoormana.jpg` (Stefan Alijević) | `alt.en` | `“Вечерен автобус”` → `“Večeren avtobus”` |
| ″ | `alt.sr` | `„Вечерен автобус“` → `„Večeren avtobus“` |

- Only the **title** was transliterated; the template words (`Cover of the book … by …` / `Korica knjige … —`) and the author names were already Latin and are unchanged. The curly-quote glyphs (`“ ”` in `en`, `„ “` in `sr`) were preserved exactly.
- Each of the three entries' existing `note` was **appended** (not replaced) with a per-entry provenance sentence recording the 2.11 transliteration (naming the specific Latin form — `Svetot što go izbrav` / `Vo haosot radost` / `Večeren avtobus`), that the caption is now single-script, that the `mk` slot is unchanged, and that the title was not translated, per the caption convention.
- **Every `mk` slot and all other 17 `reviewed_books` entries are byte-unchanged.** The diff is exactly **9 insertions / 9 deletions** (3 `en` + 3 `sr` + 3 `note` lines).

## Decisions made on the fly (with why)

1. **Commit scope narrowed from the brief's literal `git add -A`.** Three pre-existing untracked files (the MK intake form, a review-summaries draft, and an `import-review-summaries.mts` script) sit in the working tree from unrelated work; `git add -A` would have swept them into this phase's commit, violating the "only `assets.json` content changes" scope guard and the Definition of Done. I staged **only** the files this phase actually changes (`content-packet/assets/assets.json` + the two project-state docs + this report). The three untracked files were left untouched on disk for their own future handling. This is a scope-preserving deviation, not a content change.
2. **Per-entry `note` wording (not the brief's combined example verbatim).** The brief's example sentence listed all three transliterations together; I wrote each entry's note to name **only its own** title's Latin form (as the brief's "Use the transliteration that matches the entry" instruction directs), so each provenance line is accurate for the entry it lives on.

## Surprises or off-spec changes

- **None to the content.** The three `en`/`sr` strings matched the brief's "replace this" text exactly (curly quotes included), so all six replacements applied verbatim.
- The only procedural deviation is the `git add -A` → explicit-paths narrowing in Decision #1, forced by unrelated untracked files that predate this phase.

## Files written / updated

- `content-packet/assets/assets.json` — the six `en`/`sr` transliterations + three `note` appends (mk slots + the other 17 entries untouched).
- `src/_project-state/current-state.md` — `Last updated:` log prepended with the 2.11 entry (2.10 demoted to *Prior*); a 2.11 line added to the Phase-status list; the deferred-`import:assets` "Next →" note extended to record that the corrected captions ride along with the pending force run.
- `src/_project-state/Part-2-Phase-11-Completion.md` — this report.
- `src/_project-state/file-map.md` — **not touched** (no file added/removed/repurposed; the manifest row already exists).
- `00_stack-and-config.md` / `Dalibor-Website-Decisions.md` — **not touched** (no stack/config/decision change).
- `src/messages/*.json`, any schema/query/component — **not touched** (no i18n key, no code change).

## Tests run + results

- **Whole-manifest scan (Python):** JSON parses (`JSON valid ✓`); scanning every `en` and `sr` string across the entire manifest for U+0400–U+04FF → **0 Cyrillic characters remaining** in any `en`/`sr` alt (or any other) slot. (The `mk` slots still contain their correct Cyrillic — intentional.)
- **`git diff` audit:** exactly **9 insertions / 9 deletions**, all within the three named entries' `en`/`sr`/`note` lines; every `mk` line present unchanged in the diff context.
- `npm run lint` → **clean** (no output).
- `rm -rf .next && npm run build` → **clean, compiled successfully, 98/98 static pages**, no errors/warnings — **same baseline count** as the 2.09/2.10 clean builds (a content-packet data edit adds no routes, as expected; the manifest is consumed by the import scripts, not the Next build).
- **`npm run typegen`** — not run (no schema change; nothing to regenerate).

## Blocked / carryover items

- **DEFERRED — the corrected captions reach the live site only via a Sanity write, which needs `SANITY_WRITE_TOKEN` (not on this machine).** On Lazar's machine, run:
  ```bash
  npm run import:assets -- --force
  ```
  `--force` is required because these three reviewed-book docs already carry an `alt` on their `localizedImage` field, and the importer preserves already-set fields otherwise. **This dovetails with the `import:assets -- --force` run already pending from 2.01h** (the three operator-supplied cover *replacements*): the corrected `alt` for these three entries lands in that same run, and the other 17 unchanged entries are re-patched with byte-identical content (harmless — Sanity asset IDs are content-hash based). No separate run is needed for 2.11.
- **Out of scope — deliberately left alone:** the review *titles* and *book titles* on the review pages come from Sanity, exist only in the `sr` (Croatian) slot, and English pages show the Croatian title via the `mk→en→sr` fallback + an "available in" note. That is the project's **no-machine-translation** rule (Dalibor provides and approves his own wording). No `en`/`mk` title slot was added, no review title was translated, and the fallback behaviour is untouched. This phase corrected only the site's own descriptive `alt` captions.
- Unchanged from prior reports (out of scope here): the semantic embeddings backfill (needs a Voyage payment method), 2.06 production promote + real domain, the optional hi-res author portrait, the Formspree recipient switch, and Dalibor entering review/post prose + summaries in the Studio.

## What's next

- **Operator action:** review + merge `phase/2.11-alt-caption-latin` into `main` when ready (a push to `main` deploys to the Vercel production target — still the noindexed validation deploy, `PREVIEW_NOINDEX`). The merge-to-`main` question has been put to Lazar; `main` stays untouched until he approves.
- **Operator action (deferred write):** run `npm run import:assets -- --force` on the machine that has `SANITY_WRITE_TOKEN` — the same run already pending from 2.01h — to make the corrected captions (and the 2.01h cover replacements) live.
