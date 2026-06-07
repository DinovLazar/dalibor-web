# Part-1-Phase-05-Completion.md

> **Location in repo:** `src/_project-state/`

---

**Phase ID + name:** 1.05 — Sanity CMS + Content Models (embedded Studio · field-level trilingual content modelling · TypeGen · placeholder seed · connect-to-site proof)

**Executing Claude:** Code

**Date completed:** 2026-06-06

---

### What shipped

- **Embedded Sanity Studio at `/studio`** (basePath, served by the Next app — not a separate `*.sanity.studio`). Loads under both `npm run dev` and `npm start` (webpack); route + shell verified (see Tests).
- **Sanity v5 stack** installed + pinned (caret) + recorded: `sanity 5.30.0`, `next-sanity 13.0.11`, `@sanity/vision 5.30.0`, `@sanity/image-url 2.1.1`, `styled-components 6.4.2`. Clean install under **React 19.2.4 / Next 16.2.7** — no peer conflicts, no `--force`/`--legacy-peer-deps`.
- **Five content types + two shared types**, editor labels in English, content per-language: `post`, `review`, `book` (singleton), `author` (singleton), `topic`, plus shared `blockContent` (Portable Text) and a reusable localized `image` object (hotspot + required localized `alt`).
- **Field-level localization** via a plain `{mk,en,sr}` object shape applied uniformly (strings, text, **and** Portable Text). Validation: mk required on core titles, required slug, alt required whenever an image is set.
- **One language-neutral ASCII slug per document**, suggested from the English title else a transliterated Macedonian title (mk+sr Cyrillic map), editable + required.
- **Data layer** in `src/sanity/lib/`: public read `client` (published perspective, `useCdn`, **no token**), `@sanity/image-url` builder, four typed `defineQuery` queries, and `localize.ts` (`localizedValue` mk→en→sr fallback + `availableLanguages`).
- **TypeGen** wired: `npm run typegen` → `schema.json` + `src/sanity/sanity.types.ts` (4 typed queries, 23 schema types) with the `@sanity/client` fetch augmentation, so `client.fetch(QUERY)` is fully typed.
- **Singletons** `book` + `author` enforced in the Studio (fixed `documentId` in `structure.ts` + create/delete/duplicate/unpublish removed + hidden from the global "+ New").
- **Proxy** updated: `src/proxy.ts` matcher now excludes `/studio` (and sub-paths) so it is never locale-redirected.
- **Placeholder seed** (`sanity/seed/`): 3 posts, 4 reviews (incl. **one MK-only**), the book + author singletons, 4 topics — 13 docs, all visible text `[PLACEHOLDER]`-prefixed; one generated placeholder cover PNG uploaded via the `_sanityAsset` import directive (exercises `@sanity/image-url` end to end). Reproducible via `sanity/seed/build-seed.mjs`.
- **Connect-to-site proof** (thin, temporary): `[locale]/{reviews,blog,about,book}` server components fetch from Sanity and render localized titles (+ cover / no-image). On `/en` and `/sr` the MK-only review renders its **Macedonian** title via fallback with an "available in: MK" note.

### Decisions made on the fly (with why)

- **i18n field shape = plain `{mk,en,sr}` object, NOT `sanity-plugin-internationalized-array`.** The plugin (5.1.3) *is* version-compatible with Studio v5, but its `fieldTypes` only wrap simple types (string/number/boolean/text/image/file/date/url/reference + object aliases) — **not Portable Text / arrays**. This model localizes rich text (`post.body`, `review.body`, `book.description`, `author.bio`), and the phase rule is "pick one approach, **don't mix**." Forcing block content through the plugin would mean either an unsupported, fragile wrapper (and a deeply-nested, error-prone NDJSON) or mixing two mechanisms. The object shape is the doc's **sanctioned fallback**, is uniform across all field types, yields clean typed queries, and matches the DoD wording "localized fields show **mk / en / sr inputs**" most literally. I installed the plugin to evaluate it, then **removed it** (`npm uninstall`). *This is the single biggest deviation from the brief's primary choice — chosen on a suitability ground, not a version-compat ground.*
- **Slug strategy.** One ASCII slug/document (shared across `/mk`,`/en`,`/sr`). `localizedSlug(titleField)` (in `schemaTypes/slug.ts`) sources `<titleField>.en` first, else `<titleField>.mk`; a custom `slugify` transliterates Macedonian + Serbian Cyrillic (digraph-aware: ѓ→gj, ќ→kj, ж→zh, ч→ch, ш→sh, џ→dj, љ→lj, њ→nj, ђ→dj, …) and NFKD-strips Latin diacritics (č→c, ž→z) plus the non-decomposing đ→dj. Required; `maxLength 96`. Seed slugs are `placeholder-…` so they read as placeholders.
- **Singleton method.** `structure.ts` pins one fixed `documentId` per singleton (`book`, `author`); `sanity.config.ts` removes `delete`/`duplicate`/`unpublish` actions for those types, hides them from the global "+ New", and filters their creation templates. The seed imports them with `_id: "book"` / `_id: "author"` to line up with the pinned ids.
- **Drop-cap ruling (per Step 0 default).** The handover (§3.6, §10) specifies the drop cap as a render-time CSS `::first-letter` treatment with the DOM text intact — **no markup, no editor toggle**. Its only editor-facing note ("start the first paragraph with a letter, not punctuation") I surfaced as a `description` on each `body` field. **No drop-cap schema field added.**
- **Second root layout for `/studio`.** 1.04 deleted `src/app/layout.tsx` and made `src/app/[locale]/layout.tsx` the root layout. Since `/studio` is a sibling (not localized), it gets its own root layout `src/app/studio/layout.tsx` (renders `<html>`/`<body>`). Next 16 allows multiple root layouts — confirmed by the build (`○ /studio/[[...tool]]`). The interactive `<NextStudio>` is rendered by a small `'use client'` wrapper (`Studio.tsx`) that imports `sanity.config` directly, keeping the non-serializable config off the server→client props boundary; `page.tsx` (server) owns metadata/viewport (incl. `robots: noindex`) + `dynamic = 'force-static'`.
- **`src/sanity/` refinement.** Code lives in `src/sanity/` (the conventional code-adjacent home); the Plan's root `sanity/` folder is **repurposed for seed data** (`sanity/seed/`). Removed the now-redundant `sanity/.gitkeep`.
- **TypeGen config.** Started with `sanity-typegen.json`, but the CLI deprecates it; **migrated to a `typegen` key in `sanity.cli.ts`** and deleted the json (no more deprecation warning).
- **`.env.example` committed despite `.env*`.** Added a `!.env.example` negation to `.gitignore` so the template (empty values, no secrets) is committed while `.env.local` stays ignored.
- **Reviews terminology left as-is.** Kept the existing message keys (`Критики`/`Kritike`/`Reviews`); the **критика vs рецензија** question is still open and is not this phase's call (placeholders only).
- **Proxy scope.** Only `/studio` needs excluding — the embedded Studio talks to Sanity's own domains (`*.sanity.io`, `cdn.sanity.io`), not our origin, so there are no Sanity asset/API paths on our domain to exclude. `api`, `_next`, `_vercel`, and dotted files were already excluded.

### Surprises or off-spec changes

- **The proof routes did not exist.** The brief said "make the existing reviews/blog/about/book routes fetch from Sanity," but only `src/app/[locale]/page.tsx` (Home) existed (1.04 shipped only Home). Per Step 0 (live code wins), I **created** thin, clearly-temporary proof routes. *Noted as a plan-vs-live conflict.*
- **The dataset was already seeded** (documents existed before my first import — likely imported during the bootstrap). I re-ran with `--replace` for an idempotent, authoritative import.
- **A stale `next start` (PID 16020, from 01:30) was holding port 3000** and served an *old* build during the first runtime check (showed `/studio`→`/mk/studio`, proof 404). Killed it, started the fresh build, re-verified — all correct.
- **`count(*) = 14`** after import = 13 content docs + 1 uploaded image asset (`sanity.imageAsset`).
- **`@sanity/image-url` builds `cdn.sanity.io` URLs** (asset CDN), not `apicdn.sanity.io` (query CDN) — a first grep used the wrong domain (false negative); the cover URL is present and correct.
- **`@sanity/image-url` default export is deprecated** → used the named `createImageUrlBuilder`.
- **21 moderate `npm audit` findings** appeared (transitive in the Sanity toolchain). `npm audit fix --force` would downgrade/break, so **not applied**; revisit on upstream bumps. (1.02's 2 postcss-in-next findings are a subset.)

### Files written / updated

| Path | Change |
|---|---|
| `package.json` | Added `sanity`, `next-sanity`, `@sanity/vision`, `@sanity/image-url`, `styled-components`; added `typegen` script. |
| `package-lock.json` | Updated dependency tree. |
| `sanity.config.ts` | **New.** Embedded Studio config (basePath `/studio`, schema, `structureTool`+structure, `visionTool`, singleton enforcement). |
| `sanity.cli.ts` | **New.** CLI config (`api` projectId/dataset + `typegen` config). |
| `schema.json` | **New (generated).** Extracted schema for TypeGen. |
| `src/sanity/env.ts` | **New.** Validated public env (projectId/dataset/apiVersion). |
| `src/sanity/structure.ts` | **New.** Desk structure with `book`/`author` singletons. |
| `src/sanity/sanity.types.ts` | **New (generated).** TypeGen output (schema + 4 query result types + client augmentation). |
| `src/sanity/schemaTypes/index.ts` | **New.** Schema registry. |
| `src/sanity/schemaTypes/slug.ts` | **New.** ASCII slug field + Cyrillic transliteration. |
| `src/sanity/schemaTypes/localized.ts` | **New.** `localizedString/Text/BlockContent` + reusable `localizedImage` + `requireMk`. |
| `src/sanity/schemaTypes/blockContent.ts` | **New.** Shared Portable Text (no drop-cap block). |
| `src/sanity/schemaTypes/{post,review,book,author,topic}.ts` | **New.** The five content types. |
| `src/sanity/lib/client.ts` | **New.** Public read client (published, CDN, no token). |
| `src/sanity/lib/image.ts` | **New.** `@sanity/image-url` builder. |
| `src/sanity/lib/queries.ts` | **New.** Four `defineQuery` queries. |
| `src/sanity/lib/localize.ts` | **New.** `localizedValue` + `availableLanguages`. |
| `src/app/studio/layout.tsx` | **New.** Second root layout (html/body) for the Studio branch. |
| `src/app/studio/[[...tool]]/page.tsx` | **New.** Studio route (server; metadata/viewport/`force-static`). |
| `src/app/studio/[[...tool]]/Studio.tsx` | **New.** `'use client'` wrapper rendering `<NextStudio>`. |
| `src/app/[locale]/reviews/page.tsx` | **New.** Proof: review titles + cover/no-image + available-in. |
| `src/app/[locale]/blog/page.tsx` | **New.** Proof: post titles. |
| `src/app/[locale]/about/page.tsx` | **New.** Proof: author singleton. |
| `src/app/[locale]/book/page.tsx` | **New.** Proof: book singleton + cover. |
| `src/proxy.ts` | **Updated.** Matcher excludes `/studio`. |
| `sanity/seed/build-seed.mjs` | **New.** Seed generator (PNG + NDJSON). |
| `sanity/seed/seed.ndjson` | **New (generated).** 13 placeholder documents. |
| `sanity/seed/placeholder-cover.png` | **New (generated).** Clearly-marked 2:3 placeholder cover. |
| `.env.example` | **New (committed).** Template, empty values. |
| `.env.local` | **Updated** (gitignored, not committed) — real project id `ndqmaath`, dataset `production`, apiVersion `2026-06-06`. |
| `.gitignore` | **Updated.** `!.env.example` negation. |
| `eslint.config.mjs` | **Updated.** Ignore generated `sanity.types.ts` + `sanity/seed/**`. |
| `sanity/.gitkeep` | **Removed.** Folder repurposed to `sanity/seed/`. |
| `sanity-typegen.json` | Created then **removed** (migrated into `sanity.cli.ts`). |
| `src/_project-state/Part-1-Phase-05-Completion.md` | **New.** This report. |
| `src/_project-state/{current-state,file-map,00_stack-and-config}.md` | **Updated.** |

### Tests run + results

- **`npm install`** — clean (exit 0); 870 packages; React 19.2.4 satisfies every Sanity peer. 21 moderate audit findings (transitive; not auto-fixed).
- **`npm run typegen`** — `schema.json` + `src/sanity/sanity.types.ts` generated (4 queries, 23 schema types); config loaded from `sanity.cli.ts` (no deprecation warning).
- **`npx tsc --noEmit`** — **PASS** (0 errors) — full project type-checks against the generated query types.
- **`npm run lint`** — **PASS** (0 errors, 0 warnings).
- **`npm run build` (`next build --webpack`)** — **PASS.** Compiled 42s; TypeScript OK; 18/18 static pages. Routes: `● /[locale]`→`/mk`,`/en`,`/sr` (SSG); `● /[locale]/{about,blog,book,reviews}` (SSG); `○ /studio/[[...tool]]` (static); `ƒ Proxy (Middleware)` active.
- **Public read (no token)** — `GET …/data/query/production?query=count(*)` → **HTTP 200**, result 14 (13 docs + 1 asset). Dataset is public.
- **Seed import** — `sanity dataset import … --replace` → 13 documents + cover asset, references strengthened.
- **Data-shape check (GROQ)** — `review-essay-on-silence`: cover ✓, mk/en/sr ✓; `review-mk-only`: mk only (en/sr absent), no cover; other two: mk/en/sr ✓, no cover.
- **Runtime curl matrix (fresh `npm start`, port 3000):**
  - `/` → **307 `/mk`**; `/` with `Accept-Language: en` → **307 `/mk`** (localeDetection:false ✓).
  - `/mk` `/en` `/sr` → 200; `/de` → 307 `/mk/de` (→ 404).
  - **`/studio` → 200 (no `/mk/studio` redirect)**; `/studio/structure` → 200.
  - `/mk/reviews` `/en/reviews` `/sr/reviews` `/mk/blog` `/mk/book` `/en/about` → 200.
  - `/en/reviews` contains **"Available in: MK"**; `/sr/reviews` contains **"Dostupno na: MK"**; the MK-only Macedonian title **"Само на македонски"** renders on `/en` (fallback).
  - `/mk/reviews` contains a **`cdn.sanity.io/images/ndqmaath/…`** cover URL (via `@sanity/image-url`); reviews/book/about carry `[PLACEHOLDER]` data.
- **Independent code review** — a `superpowers:code-reviewer` subagent reviewed the whole implementation against this spec: **0 Critical, 0 Important**; verdict **"spec-compliant and ready to mark Phase 1.05 done."** It confirmed uniform `{mk,en,sr}` localization (plugin fully absent), correct alt/mk/cover validation, slug transliteration (incl. the real `[̀-ͯ]` diacritic strip), singleton enforcement, the no-token published client + clean secrets (only `.env.example` tracked), the `/studio` proxy exclusion, the second root layout, and TypeGen/`schema.json`/seed mutual consistency. Five cosmetic nits, none blocking (one fixed; rest deferred — see carryover).

### Blocked / carryover items

- **Studio content visual confirm** — the `/studio` route + shell are verified (200, no redirect, builds), but "shows all types · singletons appear once · localized fields show mk/en/sr inputs" is best confirmed in a **logged-in browser** (the headless check only reaches the login wall). → Asked Lazar to open `http://localhost:3000/studio` and confirm.
- **`review.coverImage` is `required`** but most placeholder reviews intentionally have no cover (no-image proof state). Validation is Studio-advisory and not enforced on import, so this is accepted for placeholders; real covers arrive in **2.01**.
- **21 moderate `npm audit`** findings (transitive Sanity toolchain) — revisit on upstream bumps.
- **критика vs рецензија** terminology still open (affects `nav.reviews`, search placeholder, headings) — confirm with Dalibor before content phases.
- **Code-review minor nits (deferred to 1.06; none blocking).** Fixed now: the `localizedValue` fallback-order array no longer duplicates the current locale. Deferred (they live on the *temporary* proof pages or are trivial): (a) the proof's "available in" note also renders on `/mk` for the MK-only review (the brief only required it on `/en`/`/sr`) — refine when the real "available in" component is built; (b) `localizedValue`'s `locale` param is typed `string` (cast to `AppLocale`) and could be narrowed; (c) `publicationYear` validation floor is `0` (could be ~`1000`).
- **`author.email` blank** (2.02); real content/photos/covers (2.01); Dalibor's live Studio login + Studio deploy (2.04); AI/topic search + embeddings (1.09 / 2.03); `next/image` + remotePatterns for Sanity images (with the real pages, 1.06–1.10).

### What's next

- **1.06** — real Style A header / footer / nav with shadcn/ui (drops the temporary top bar; reuses the language switcher). The styled Reviews/Blog/Single/About/Book/Home pages (1.06–1.10) replace these thin proof routes and will consume the same typed queries + `localize.ts`.

---
*Reminder: `current-state.md`, `file-map.md`, and `00_stack-and-config.md` updated alongside this report.*
