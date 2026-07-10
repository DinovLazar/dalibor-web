# Part 2 · Phase 12 — EN/SR translations of the Author & Book singleton prose: completion report

**Phase ID + name:** 2.12 — Translate the untranslated singleton prose on About / Book / Home (EN + SR)

**Executing Claude:** Code

**Date completed:** 2026-07-09

**Branch:** `phase/2.12-singleton-en-sr`, cut off `main` (`04de77d`). `main` untouched, merge pending Lazar.

**Trigger:** Operator (Lazar) report — "on the home, about and book page the untranslated text isn't translated; when the switch is EN everything should be in English, same for MK and SR."

---

## Diagnosis (what was actually wrong)

This was **not** a frontend bug. The pages already switch language correctly for everything that *has* a translation; the untranslated text was **Sanity content entered only in Macedonian**, surfaced on EN/SR by `localizedValue`'s intentional `mk→en→sr` fallback. Confirmed against live `production`:

| Field | mk | en | sr |
|---|:-:|:-:|:-:|
| `author.roles` | ✓ | — | — |
| `author.tagline` | ✓ | — | — |
| `author.bio` | ✓ | — | — |
| `author.education` | ✓ | — | — |
| `book.description` | ✓ | — | — |

These drive: **About** (roles eyebrow, tagline, bio, education), **Book** (description), **Home** (hero tagline = `author.tagline`). All UI labels ("Where to find it", "by …", etc.) are already `t()`-translated; names, purchase-link labels, etc. are already trilingual. `author.heroIntro` is empty in all languages (renders nothing — not a gap).

## What shipped

- **`scripts/import-translations.mts`** (+ `npm run import:translations` in `package.json`) — a surgical, idempotent importer that fills **only** the 10 `en`/`sr` slots of the five fields above.
  - Uses `writeClient.patch("author"/"book").set({...})` on the specific keys — **never `createOrReplace`**. This is the critical design point: `import:content` fully specifies the singletons and carries no `photo`/`coverImage`, so re-running it would **wipe `author.photo` (2.01e) and `book.coverImage` (2.01h)**, both currently set in production. The patch touches nothing but the named en/sr keys; `mk`, photo, cover, `translations[]`, everything else survive.
  - Token-less **read** client does the diff, so `--dry-run` needs no secret; the **write** client is built only when `SANITY_WRITE_TOKEN` is present (real run aborts without it).
  - **Idempotent:** reads current values, sets only fields that differ; a no-change re-run is a genuine no-op.
  - Guards: **Zaporožac** scrub + a **Cyrillic-in-en/sr** guard abort before any write; a post-write re-read verifies all 10 slots match.
- The translations are a **machine-authored first draft** (see Decisions #26): proper-noun-faithful (book title rendered as the site's own **"Bunike"**; outlet/programme/place names — Booksa, The Literary Review, Beton, Zenit, Q21 Vienna, Strumica — kept), single-language, mirroring the mk source. SR is Latin script, matching the site's `sr`.

## Decisions made on the fly (with why)

1. **Overrode the "no machine translation of Dalibor's work" rule — but only because the operator explicitly instructed it**, and recorded it as **Decision #26** (qualifying #4). The shipped text is framed everywhere (script header, report, Studio) as an **interim draft for Dalibor to review/approve**, not a final substitute for his wording. He is a translator across exactly these languages, so the Studio is the right place for him to refine.
2. **Patch script, not extend `import-content.mts`.** Discovered `author.photo` + `book.coverImage` are both set in production; the existing importer's `createOrReplace` would destroy them on re-run. A dedicated `.patch().set()` script is the only safe mechanism. (Also keeps this change isolated from the reviews/posts/placeholder machinery.)
3. **Scoped to the two singletons; did NOT machine-translate review/book *titles*.** Those are `sr`-only (Croatian) across the whole Reviews/Blog surface (20 reviews + 1 post + reviewed-book titles), are the project's most-protected content, and affect far more than the three named pages. Flagged for a separate operator decision rather than silently ballooning scope.
4. **Left `book.publisher` ("ПНВ Публикации") as-is.** It is a **non-localized** flat field (a proper noun — the publisher's own name), so it shows Cyrillic on EN/SR (Book page + Home featured band). Making it per-locale needs a schema change (`localizedString`) + typegen + a hosted-Studio redeploy — out of proportion for a proper noun, and arguably better left in original script. Flagged, not changed.

## Surprises or off-spec changes

- The request read like a frontend fix but was a **content/data gap** — worth stating plainly so the fix (a Sanity write) isn't mistaken for a code deploy.
- **This machine has no `SANITY_WRITE_TOKEN`**, so the write itself is deferred to Lazar's machine (same constraint as every other importer in this project).

## Files written / updated

- `scripts/import-translations.mts` — the new patch importer (the translations live here as clearly-labelled constants, with the mk source in comments for review).
- `package.json` — `import:translations` script (same `node --conditions=react-server --import tsx --env-file=.env.local` runner as the other importers).
- `Dalibor-Website-Decisions.md` — **Decision #26** (operator-authorized machine translation of the singleton prose; interim draft).
- `src/_project-state/current-state.md` — `Last updated:` log prepended with the 2.12 entry.
- `src/_project-state/file-map.md` — new `import-translations.mts` row + the `package.json` row extended.
- `src/_project-state/Part-2-Phase-12-Completion.md` — this report.
- **No frontend/schema/query/i18n/`.env` file changed** — the pages render the new slots through the same path that renders `mk` today.

## Tests run + results

- `npm run lint` → **clean** (no output).
- `npm run import:translations -- --dry-run` (against live `production`, no token) → guards pass (**Zaporožac 0, Cyrillic-in-en/sr 0**); plan = **10 fields to set, 0 already current** (all 10 en/sr slots confirmed empty) — i.e. the script reads live state and would set exactly the intended keys.
- **No live end-to-end render proof** is possible from this machine (the change is Sanity data + there is no write token). Rationale it will render correctly: the change is **data-only** through an already-proven code path — the mk text renders on every locale today via the same `localizedValue`/`PortableText` render; filling the en/sr slots simply makes that path return the in-language value instead of the mk fallback. `contentLang` will then emit **no** `lang` attribute on the bio/description (they match the page locale) instead of the current `lang="mk"`.

## Blocked / carryover items

- **DEFERRED — make it live (needs `SANITY_WRITE_TOKEN`).** On Lazar's machine:
  ```bash
  npm run import:translations        # patches the 10 en/sr slots; prints a verify line
  ```
  Then **Dalibor reviews/refines** the EN/SR wording in the Studio (the draft is his to approve). A re-run after his edits is a no-op unless the text differs.
- **Review & book titles (site-wide) still Macedonian/Croatian on EN.** Not done here (see Decision #3). Needs an operator decision: leave as Dalibor's own titles (current behaviour, with the "available in" note), or take on a separate translation pass.
- **`book.publisher` still Cyrillic on EN/SR.** Non-localized proper-noun field (see Decision #4). Localizing it is a schema change + Studio redeploy if wanted.
- Unchanged from prior reports: the two still-pending `import:assets` runs (2.01h `--force` + the 2.11 caption fix riding along), the semantic embeddings backfill, 2.06 production promote, the Formspree recipient switch, Dalibor entering review/post prose + summaries.

## What's next

- **Operator action:** review + merge `phase/2.12-singleton-en-sr`; run `npm run import:translations` with the write token; hand the EN/SR wording to Dalibor for approval in the Studio.
- Decide on the two flagged follow-ups (review/book titles; publisher localization) if desired.
