# content-packet/

Source material for the Sanity content import (Phase 2.01 / 2.01b / 2.01c).

## Present

- `intake/Dalibor-Intake-Answers-MK.md` — Dalibor's returned intake answers
  (verbatim MK bio §1, book description §2, the 8 translations §5, contact §7,
  links §8). This is the source of truth for the Author + Book singletons and the
  Translations block. **Used by `scripts/import-content.mts`.**
- `topics.json` — the 13-topic launch taxonomy (`slug` + `{mk,en,sr}` title).
- `reviews.json` — the 20-review launch set (Croatian titles in the `sr` slot,
  reviewed-book title/author, topic assignments, and the "first published on …"
  `source` attribution). **Copyright-safe: no body text, no excerpts** — Dalibor
  pastes the prose into the Studio himself (intake §3).
- `posts.json` — the 1 blog post (title in all three slots, topic assignments,
  `source` attribution; body added in the Studio).

These three JSON files **superseded** the `.xlsx` workbook / `.docx` doc that the
2.01 completion report described but never committed. `scripts/import-content.mts`
reads them with Node's built-in `readFileSync` + `JSON.parse` (no spreadsheet
parser, no new dependency) and upserts reviews + posts idempotently (stable
`_id`s), then removes any leftover `[PLACEHOLDER]` seed docs.

### Topic reconciliation (2026-07-03)

By the time this import ran, the live `production` dataset already carried
**Dalibor's own 14-topic taxonomy** (ids `t-<slug>`), hand-built in the hosted
Studio after 2.01b. To avoid duplicate concepts, the importer does **not** create
the packet's `topic-<slug>` documents. Instead it **maps** each packet topic slug
onto Dalibor's existing `t-*` topic id (see `TOPIC_ID_BY_PACKET_SLUG` in the
script) and creates only the two concepts his taxonomy lacked:

- `t-essay` ("Есеј" / "Essay" / "Esej")
- `t-society-politics` ("Општество и политика" / "Society & politics" / "Društvo i politika")

Operator decisions (Lazar): `women-and-gender` → the existing `t-womens-writing`;
`essay` + `society-and-politics` created new. `topics.json` remains the canonical
record of the intended 13-topic launch taxonomy and the source for the map guard.

## Still pending from Dalibor (not blocking the 2.01c import)

- **Reviewed-book covers** — reviews import with the graceful Style A placeholder
  cover; real covers are added later (rights-checked) in the Studio or a follow-up
  pass.
- **Portrait + own-book cover** — the About portrait and the `Буники`/`Bunike`
  cover image are still to be supplied.
- **Review/post body prose** — added by Dalibor in the Studio (intentionally left
  empty on import; the copyright-safe model).
