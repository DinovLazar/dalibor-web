# current-state.md

> **Location in repo:** `src/_project-state/current-state.md`
> A live snapshot of the repo. **Claude Code updates this at the end of every phase.** It reflects what actually exists — if it ever disagrees with the Plan, this file (and the live code) wins.

**Last updated:** 2026-06-06 — Phase 1.05 complete (Sanity CMS + content models + embedded Studio at `/studio`)

**Project:** Dalibor Plečić personal website — a trilingual (Macedonian default / English / Serbian), literary "well-made hardcover book" site consolidating his book reviews, blog, his own book, and an About page.

---

## Phase status
- **1.01 — Deep research:** ✅ complete (dossier held locally by Lazar; gitignored).
- **1.02 — Project scaffolding:** ✅ complete.
- **1.03 — Design system & visual direction:** ✅ complete. Handover + four HTML mockups in `docs/design-handovers/`.
- **1.04 — Languages + Routing Foundation:** ✅ complete. next-intl v4 `[locale]` shell (mk/en/sr), root → `/mk`, switcher, Playfair+Lora, Style A tokens, trilingual UI strings.
- **1.05 — Sanity CMS + content models:** ✅ complete. Embedded Studio at `/studio`, five content types with field-level `{mk,en,sr}` localization, TypeGen, placeholder seed, connect-to-site proof. Report: `Part-1-Phase-05-Completion.md`.
- **Next → 1.06** — real Style A header / footer / nav with shadcn/ui (replaces the temporary top bar; the thin 1.05 proof routes get replaced by styled pages in 1.06–1.10).

## Tech stack (current)
*Locked plan: Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Lucide · Framer Motion · next-intl · Sanity · Formspree · Vercel AI SDK + Voyage + Supabase (pgvector) · Vercel · Playfair Display + Lora.*

**Installed now:** Next.js 16.2.7 · React 19.2.4 · TypeScript 5.9.3 · Tailwind CSS 4.3.0 · ESLint 9 · next-intl 4.13.0 · **Sanity 5.30.0 · next-sanity 13.0.11 · @sanity/vision 5.30.0 · @sanity/image-url 2.1.1 · styled-components 6.4.2**. shadcn/ui · Lucide · Framer Motion → 1.06+. AI search stack → 1.09. Exact pins + notes in `00_stack-and-config.md`.

## What exists now
- **Trilingual App Router shell** under `src/app/[locale]/` (mk/en/sr). `[locale]/layout.tsx` is a root layout (fonts, tokens, `<html lang>`, provider, temporary top bar). No `src/app/layout.tsx` (next-intl pattern).
- **Embedded Sanity Studio** at `/studio` — `src/app/studio/` is a **second root layout** sibling (its own `<html>`/`<body>`), so it is not localized. `[[...tool]]/page.tsx` (server: metadata/viewport/`force-static`) + `Studio.tsx` (`'use client'` → `<NextStudio config>`).
- **Sanity config** at repo root: `sanity.config.ts` (Studio: schema, structure w/ singletons, vision) + `sanity.cli.ts` (CLI: api + typegen).
- **Content model** in `src/sanity/schemaTypes/`: `post`, `review`, `book` (singleton), `author` (singleton), `topic`, shared `blockContent`, reusable localized `image`, and `localizedString/Text/BlockContent`. Field-level localization = plain `{mk,en,sr}` objects (NOT the i18n-array plugin — see report). Validation: mk-required titles, required slug, alt-required-when-image-set.
- **Data layer** `src/sanity/lib/`: `client.ts` (public read — published perspective, `useCdn`, **no token**), `image.ts` (`@sanity/image-url`), `queries.ts` (4 typed `defineQuery`), `localize.ts` (`localizedValue` mk→en→sr + `availableLanguages`). `env.ts` validates the public env vars.
- **TypeGen**: `schema.json` + `src/sanity/sanity.types.ts` (generated), `npm run typegen`; `client.fetch(QUERY)` is typed.
- **Seed** in `sanity/seed/`: `build-seed.mjs` (generator) → `seed.ndjson` (13 `[PLACEHOLDER]` docs) + `placeholder-cover.png`. Imported into the `production` dataset.
- **Proxy** `src/proxy.ts` now excludes `/studio` from locale routing.
- i18n layer, fonts, tokens, switcher, UI strings — unchanged from 1.04.

## Pages built
- **Placeholder Home** per locale (`/mk`,`/en`,`/sr`) — from 1.04.
- **Thin connect-to-site proof routes** (1.05, temporary): `[locale]/reviews`, `/blog`, `/about`, `/book` — fetch from Sanity, render localized titles (+ cover / no-image); MK-only review falls back to mk + shows "available in: MK" on `/en`/`/sr`. Replaced by styled pages in 1.06–1.10.
- **`/studio`** — embedded Sanity Studio.

## Components built
- **`language-switcher.tsx`** — from 1.04. (Styled header/footer/nav → 1.06.)

## Integrations wired
- **next-intl** (routing/proxy/request/navigation) — 1.04.
- **Sanity** — embedded Studio, typed read client, TypeGen, seed. (Formspree, AI search → later.)

## How to run it locally
```bash
npm install            # first time only
npm run dev            # http://localhost:3000  (→ /mk).  Studio at /studio
npm run typegen        # regenerate schema.json + sanity.types.ts after schema changes
```
Other scripts: `npm run build`, `npm run lint`, `npm start`.
- `.env.local` (gitignored) holds `NEXT_PUBLIC_SANITY_PROJECT_ID` (=`ndqmaath`), `NEXT_PUBLIC_SANITY_DATASET` (=`production`), `NEXT_PUBLIC_SANITY_API_VERSION` (=`2026-06-06`). Template: `.env.example`.
- Sanity seed (re-import if needed): `npx sanity dataset import sanity/seed/seed.ndjson --dataset production --replace`.
- `dev`/`build` use `--webpack` (the SWC-native/Turbopack constraint from 1.02 is unchanged).

## Open carryover items
- **Studio content visual check** — confirm in a logged-in browser that `/studio` shows all types, singletons once, and mk/en/sr inputs (route/shell verified automatically; content needs login).
- **`review.coverImage` required** but most placeholder reviews have no cover (intentional no-image proof; real covers in 2.01).
- **21 moderate `npm audit`** findings (transitive in the Sanity toolchain) — revisit on upstream bumps. (Supersedes 1.02's 2 postcss findings.)
- **критика vs рецензија** terminology still open (UI strings provisional, from 1.04).
- **Sanity images via `next/image`** (remotePatterns for `cdn.sanity.io`) — set up with the real styled pages (1.06–1.10); the proof uses plain `<img>`.
- Styled header/footer/nav + shadcn/ui → 1.06; real pages → 1.06–1.10; SEO/metadata/hreflang/sitemap → 1.12; Dalibor's live login + Studio deploy → 2.04; AI search → 1.09/2.03.

## Known issues
- None blocking. (Webpack/WASM fallback unchanged; after deleting route files, clear `.next` to drop stale generated types.)
