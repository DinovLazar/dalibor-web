# Part-2-Phase-01b-Completion.md

> **Location in repo:** `src/_project-state/`

---

**Phase ID + name:** 2.01b — Merge Dalibor's intake & import the real content into Sanity (Code)

**Executing Claude:** Code

**Date completed:** 2026-06-26

**Outcome:** ✅ **PARTIAL pass shipped** (intake-only). The Cowork content packet (reviews/posts workbook + singletons docx + assets manifest) was **never committed to the repo and is absent from the machine**, so the reviews/posts/topics/covers import is **deferred to a follow-up, 2.01c**. Everything that depends only on Dalibor's intake answers was completed: schema edits, the idempotent import script, the real **Author + Book singletons + the 8 translations** (now live in `production`), the About "Translations" block, the live email + interview links, and the finalized SEO/JSON-LD.

---

### The blocker (and the decision)
Prerequisite verification found the write token present (as `SANITY_WRITE_TOKEN`, see below) and the intake file present **in `~/Downloads`** — but the **`content-packet/` directory did not exist** anywhere (repo, Downloads, Desktop, Documents). This matches the standing memory note ("the 2.01 packet was never committed to the repo"). The packet holds the ~78-review/blog **workbook**, the **singletons/topics docx**, and the **assets manifest** — i.e. everything needed for reviews, posts, topics, and covers.

Per the phase's "stop and report if prerequisites are missing" rule, I halted before any change and asked Lazar how to proceed. **He chose "Partial pass now":** do the intake-only subset and defer the workbook-driven content to **2.01c**. This report covers that partial pass.

---

### What shipped
- **Schema edits + `npm run typegen`** (clean): 
  - `review`: `reviewTitle` + `bookTitle` are **no longer mk-required** (most reviews are hr/sr/en-only and fall back mk→en→sr; the slug stays the required, language-neutral id); `coverImage` is now **optional** (graceful placeholder); the existing `source {sourceName, sourceUrl}` object was **re-documented as the "first published on …" attribution** (outlet + original URL) — reused, not duplicated (see Decisions).
  - `author`: new **`translations[]`** array (`title`, `originalAuthor`, `fromLang`, `toLang`, `publisher?`, `year?`, `kind: book|play|anthology`) + a new **`education`** localizedString.
  - `book`: `genre` confirmed settable (no new required fields).
- **`scripts/import-content.mts`** (+ `npm run import:content`) — an **idempotent** write-client importer:
  - Separate `@sanity/client`/next-sanity **write client** (token from `.env.local`, `useCdn:false`); the site's read client stays token-less.
  - Reads the **verbatim** MK bio (§1) and book description (§2) **from `content-packet/intake/Dalibor-Intake-Answers-MK.md`** (parser, not re-typed).
  - `createOrReplace` on fixed `_id`s (`author`, `book`) + stable child `_key`s → safe to re-run (reported `created=0 updated=2` on the live run).
  - **Zaporožac scrub** (`/zaporo|запорож/i`) walks the constructed docs and **aborts before any write** if a variant appears (0 hits).
  - **Workbook-aware:** detects the absent xlsx and logs the 2.01c deferral, leaving the placeholder reviews/posts/topics intact so the site keeps rendering content. Re-running after the packet lands will pick up the rest (the script is structured for that).
  - Supports `--dry-run`.
- **Real content live in `production`:** the **Author** singleton (name across 3 scripts, roles/tagline, verbatim bio, education, **8 translations**, public email) and the **Book** singleton (`Буники`/`Bunike`, verbatim description, `genre = збирка раскази` (data-only), publisher `ПНВ Публикации`, year 2022, Литература.мк purchase link). en/sr long-form slots left empty (fallback). Portrait + book cover left unset (pending → graceful placeholders).
- **About page "Translations" block** — new Style A `components/about/translations.tsx`: per entry, the work title over a quiet meta line (original author · localized language pair `from → to` · `kind` for plays/anthology · publisher · year), with absent parts dropped; returns `null` when empty. Plus a quiet **education line** under the bio. New `mk/en/sr` strings: `about.translations.*`, `about.langNames.*`, `about.kinds.*`, `about.education`.
- **Known facts wired into the site:**
  - `src/lib/site-links.ts`: real **email** (`plecicdalibor@gmail.com`) shown publicly; `interview`+`interviewVis` replaced by **`interviews[]`** (the 3 YouTube links); the X/Twitter slot **confirmed absent** (it was never added — nothing to remove).
  - **Email un-inerted** as a `mailto:` on the **Contact page + footer**; the **3 interview links render as a list** (Contact "Interviews" + a footer "Interviews" group, labelled "Interview 1/2/3").
  - **SEO `metadata`** finalized: dropped the unconfirmed **"journalist"** from the About description in all 3 locales; titles/descriptions otherwise concise + accurate (Dalibor signs off on copy at launch QA).
  - **JSON-LD:** `Person.jobTitle` "Journalist" removed (now Writer / Literary critic / Literary translator — his confirmed roles); `sameAs` unchanged (X never present); Person confidence guards intact (no birth date / nationality / residence); Book guard left in place (format is captured in `book.genre` data but not asserted in JSON-LD — clean-only rule).
- **ESLint `dist/**` ignore** — a pre-existing config gap (the 2.04 hosted-Studio `dist/` build artifact OOM'd ESLint); now ignored like `.next`/`out`/`build`.

### Decisions made on the fly (with why)
- **Reused `review.source` as the firstPublished attribution instead of adding a `firstPublished {outlet,url}` field.** The schema already had `source {sourceName, sourceUrl}` ("where this review first appeared"), which is functionally identical. The phase's own ruling says *"if an equivalent field already exists, reuse it"* — so I re-titled/-documented it (outlet + original URL) rather than ship a duplicate. (The DoD line names `firstPublished`; this satisfies its intent. The 2.01c review import will populate `source`.)
- **Added an `author.education` field + a quiet About render** — the baked rulings list an education fact, but there was no field for it and the §1 bio (used verbatim) doesn't include it. A dedicated localized field keeps the bio strictly verbatim and makes education editable; it renders as one muted line. (Slightly beyond the literally-listed schema edits, but within the About-page scope and faithful to the ruling.)
- **`translations[]` stores ISO-ish language codes (mk/sr/bg/hr/en/fr), localized to display names at render** via `about.langNames` — cleaner content model than hard-coding language names per entry; the pair reads in the visitor's language.
- **Book year `2022` is dossier-sourced, not intake-confirmed** (intake §2 gave only the publisher). Flagged in-code + here.
- **`Книга` purchase link = `https://www.literatura.mk` (site root), not the exact product page.** The book is confirmed on literatura.mk (≈350 MKD), but 4 searches + 2 fetches couldn't resolve the specific `Буники` product URL (only the PNV short-prose category page, which lists other titles). Per the ruling, linked the root and **flagged for Cowork to refine**.
- **Nothomb (`Kozmetika neprijatelja`) recorded as `fromLang: bg`** — the original is French, but Dalibor stated he translated from the Bulgarian edition; his stated source language is preserved (per "do not 'correct' a stated source language").
- **`roles`/`tagline`/`bio`/`description`/`genre` set in mk only; en/sr fall back** (no machine translation of his content). Dalibor can add en/sr in the Studio (he's a translator).
- **Removed the unconfirmed "journalist"** from the About description + JSON-LD `jobTitle` — his intake roles are writer / literary critic / translator (+ professor, editor); "journalist" was a dossier attribution he didn't confirm.
- **Intake file copied into the repo** at `content-packet/intake/Dalibor-Intake-Answers-MK.md` (SHA-verified vs the Downloads copy) so the import reads it from the repo path the phase specifies; added `content-packet/README.md` documenting what's present vs pending for 2.01c.

### Surprises or off-spec changes
- **The content packet is entirely absent** (the headline surprise — see "The blocker"). 2.01's completion report claimed `content-packet/` was assembled, but it was never committed. `current-state.md` was stale on this; now corrected.
- **The write-token variable is `SANITY_WRITE_TOKEN`, not the phase's expected `SANITY_API_WRITE_TOKEN`.** `.env.example` defines no write-token name at all. The token is present + non-empty; the import script reads `SANITY_WRITE_TOKEN`. (Token never printed or committed.)
- **`npm run lint` OOM'd** — ESLint was linting the gitignored `dist/` hosted-Studio bundles (huge minified files) from 2.04. Fixed by adding `dist/**` to the ESLint `globalIgnores` (a build artifact, like the already-ignored `.next`/`out`/`build`). Pre-existing gap, not introduced here.
- **axe reports 10 footer color-contrast "violations" — a confirmed false positive.** axe misreads the footer background as cream (`#f4ede1`) instead of the real walnut (`rgb(91,66,40)`, verified via `getComputedStyle`); the cream-on-walnut text is ≈8:1 (the locked 1.06 design). The flagged rows include **unchanged** chrome (Instagram/Facebook/…) that passed in 2.02, and my new email/interview links use the identical 88%-opacity pattern. The **main page content** (`#content`, incl. the new Translations block + education) is **0 violations** on About, Book, and a sample review. The locked Style A footer was not altered for an axe bg-detection bug.

### Files written / updated
- `scripts/import-content.mts` — **new**; the idempotent content importer.
- `package.json` — **new** `import:content` script.
- `content-packet/intake/Dalibor-Intake-Answers-MK.md` — **new** (relocated into the repo, SHA-verified).
- `content-packet/README.md` — **new**; packet status (present vs pending-for-2.01c).
- `src/sanity/schemaTypes/author.ts` — `translations[]` + `education`; refreshed `email` description.
- `src/sanity/schemaTypes/review.ts` — relaxed mk-required titles, optional `coverImage`, `source` re-documented as firstPublished.
- `schema.json`, `src/sanity/sanity.types.ts` — regenerated (typegen).
- `src/sanity/lib/queries.ts` — `ABOUT_QUERY` now selects `education` + `translations[]`.
- `src/components/about/translations.tsx` — **new** Translations block.
- `src/app/[locale]/about/page.tsx` — renders education + the Translations block.
- `src/components/contact/contact-links.tsx`, `src/components/layout/site-footer.tsx` — live email mailto + 3-interview list.
- `src/lib/site-links.ts` — real email, `interviews[]`, X confirmed-absent.
- `src/lib/seo/jsonld.ts` — dropped "Journalist" from `jobTitle`.
- `src/messages/{en,mk,sr}.json` — new `about.*` + `contact.links.interviewItem` + `footer.interview {n}` strings; removed obsolete `footer.email`/`footer.emailPending`/`contact.links.emailDesc`; dropped "journalist" from About description.
- `eslint.config.mjs` — ignore `dist/**`.
- `src/_project-state/{current-state,file-map,00_stack-and-config}.md` — updated.
- `src/_project-state/Part-2-Phase-01b-Completion.md` — this report.

### Tests run + results
- `npm run import:content` (dry-run then live) → **`created=0 updated=2 skipped=0`**; Zaporožac scrub 0 hits.
- **Production verification** (`sanity documents query`): Author — name `Далибор Плечиќ`, roles/tagline/education set, bio.mk verbatim (no Croatia/birthdate/Zaporožac), `translationsCount=8`, email set, bio.en/sr null. Book — `Буники`/`Bunike`, `genre.mk = збирка раскази`, publisher `ПНВ Публикации`, year 2022, no ISBN, no cover, description.mk verbatim, Литература.мк link.
- **Dataset tallies:** `author:1 book:1 topic:4 review:4 post:4`. Docs still carrying `[PLACEHOLDER]`: **12** (the deferred 4 reviews + 4 posts + 4 topics; the two singletons are now real — was 14 pre-import).
- **Zaporožac scan:** 0 across all production docs; **0 files** in the built output (`.next`).
- `npm run typegen` clean; `npm run lint` exit 0; `npm run build` clean — **58/58 static pages**, type-check passed (no new routes).
- **axe** (in-browser, WCAG 2.0/2.1/2.2 A+AA): **0 violations** in `#content` on About (the new block), Book, and a sample single review. (Footer flags = the documented false positive above.)
- **Keyword search:** `POST /api/reviews/search` → **200**, `mode:"keyword"`, 4 results in the `ReviewSummary` shape (correct here — semantic stays off until the backfill).
- **Visual (preview):** About renders the verbatim bio + education line + portrait placeholder + the 8-entry Translations block (localized pairs, "драма"/"антологија" tags); Book shows `Bunike` + publisher + Литература.мк + no genre badge; Contact/footer show the live email + Interview 1/2/3. No console errors.
- **Code-review:** two parallel review subagents (correctness/Sanity + i18n/a11y/fidelity) → **no BLOCKER, no HIGH**; fixed the one MEDIUM (dead `emailDesc` key) + 2 LOW cosmetics (stale `author.email` description, a `answerAfter` single-paragraph note).

### Blocked / carryover items
- **➡ Phase 2.01c — the reviews/posts/topics/covers import (the rest of 2.01b's original scope).** Requires the Cowork packet dropped into `content-packet/`: the **`…Reviews-and-Posts.xlsx`** workbook, the **`…Singletons-and-Copy.docx`** (the ~17-topic taxonomy), and the **`assets/`** manifest. Then: add a pinned **xlsx parser** (devDep, log it in `00_stack-and-config.md`), implement `importFromWorkbook()` in `scripts/import-content.mts` (reviews with `source` attribution + topic refs + Croatian Booksa text in the `sr` slot; posts; the localized topic taxonomy; rights-OK cover uploads), run it, then **delete the leftover `[PLACEHOLDER]` docs** (the placeholder cleanup was intentionally NOT done now — deleting them would empty Reviews/Blog/Topics with nothing to replace them). The schema + import scaffolding are already in place.
- **Semantic embeddings backfill** (`npm run embed:reviews`) — still out of scope; runs after a **Voyage payment method** is added and after the 2.01c review import. Keyword search covers the reviews meanwhile.
- **Formspree recipient switch** — unchanged (2.02/2.05 Cowork hand-off): Cowork must add + verify `plecicdalibor@gmail.com` as a Formspree Linked Email and switch the recipient. This phase only **displays** the email on the site; the form still posts to the existing endpoint.
- **Author portrait + book cover** — still pending from Dalibor ("will send later"); graceful placeholders render. A tiny follow-up adds them.
- **Литература.мк exact product URL** — refine the purchase link from the site root to the `Буники` product page when located (Cowork).
- **en/sr long-form slots** (bio, book description, roles/tagline) — intentionally empty (fallback). Dalibor can add them in the Studio.
- **Launch-QA sign-off** on the SEO `metadata` strings + the (still placeholder) Privacy copy — Dalibor (a translator) is the right approver at launch.
- **No deploy / no Vercel env changes** were made (out of scope — 2.05/2.06).

### Proactive suggestions (for the maintainer)
- **`firstPublished` vs `source`:** if a clearer editor label is wanted, rename `review.source` → `firstPublished {outlet, url}` in 2.01c (touch the GROQ + the review aside) — but reuse is the lower-churn choice and is what shipped.
- **`answerAfter` is single-paragraph** by design (the 2.01b bio/description are each one paragraph). If a future intake answer is multi-paragraph, upgrade it to emit one Portable Text block per paragraph (commented in the script).
- **`home.title`** (the hero-tagline fallback) still lists roles in a different order than the confirmed `tagline`; it's now a dead fallback (author.tagline is always set), so harmless — align it at launch QA if desired.
- **2.01c idempotency:** keep the stable-id pattern (`review-<slug>`, `post-<slug>`, `topic-<slug>`) so the workbook import is re-runnable, and have it reconcile/delete `[PLACEHOLDER]` docs in the same pass.

### What's next
- **2.01c** — drop the packet, import reviews/posts/topics/covers, remove placeholders. Then the **semantic backfill** (post-Voyage-payment), and the Cowork hand-offs (**Formspree recipient**, **Vercel env + webhook**, **portrait/cover images**). Production promote + real domain + final field/Lighthouse check remain **2.06**.

---
*Reminder: `current-state.md`, `file-map.md`, and `00_stack-and-config.md` updated. This report → Lazar pastes it back to Chat to close the phase.*
