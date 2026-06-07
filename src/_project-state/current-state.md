# current-state.md

> **Location in repo:** `src/_project-state/current-state.md`
> A live snapshot of the repo. **Claude Code updates this at the end of every phase.** It reflects what actually exists — if it ever disagrees with the Plan, this file (and the live code) wins.

**Last updated:** 2026-06-07 — Phase 1.07 complete (real Style A Home page: hero / featured book / latest reviews / from-the-blog; `next/image` wired for Sanity)

**Project:** Dalibor Plečić personal website — a trilingual (Macedonian default / English / Serbian), literary "well-made hardcover book" site consolidating his book reviews, blog, his own book, and an About page.

---

## Phase status
- **1.01 — Deep research:** ✅ complete (dossier held locally by Lazar; gitignored).
- **1.02 — Project scaffolding:** ✅ complete.
- **1.03 — Design system & visual direction:** ✅ complete. Handover + four HTML mockups in `docs/design-handovers/`.
- **1.04 — Languages + Routing Foundation:** ✅ complete. next-intl v4 `[locale]` shell (mk/en/sr), root → `/mk`, switcher, Playfair+Lora, Style A tokens, trilingual UI strings.
- **1.05 — Sanity CMS + content models:** ✅ complete. Embedded Studio at `/studio`, five content types with field-level `{mk,en,sr}` localization, TypeGen, placeholder seed, connect-to-site proof. Report: `Part-1-Phase-05-Completion.md`.
- **1.06 — Core layout & shared components:** ✅ complete. shadcn/ui initialized + themed to Style A (Base UI base); real Style A header (sticky, wordmark, nav w/ active indicator, restyled MK·EN·SR switcher, accessible mobile menu), Style A footer (link groups from `site-links` + copyright + Privacy), shared primitives (Container/Section/PageHeader), skip-to-content link, trilingual chrome; `contact`/`privacy` stubs. Temp top bar removed. Report: `Part-1-Phase-06-Completion.md`.
- **1.07 — Home page:** ✅ complete. Real Style A Home at `[locale]/page.tsx` (hero / featured-book band / latest 3 reviews / latest 3 posts) in mk/en/sr, composed from `components/home/*`. `author` singleton extended with `tagline` (mk-required) + `heroIntro`; 4 new typed `HOME_*` queries; `next/image` wired for `cdn.sanity.io` (remotePatterns); mk→en→sr fallback + "available in" note on cards; page-load reveal (reduced-motion-gated). Report: `Part-1-Phase-07-Completion.md`.
- **Next → 1.08** — styled **Book** page (continuing the styled list/detail pages 1.08–1.11; the thin proof/stub routes for reviews/blog/about/book/contact/privacy remain until their phases).

## Tech stack (current)
*Locked plan: Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Lucide · Framer Motion · next-intl · Sanity · Formspree · Vercel AI SDK + Voyage + Supabase (pgvector) · Vercel · Playfair Display + Lora.*

**Installed now:** Next.js 16.2.7 · React 19.2.4 · TypeScript 5.9.3 · Tailwind CSS 4.3.0 · ESLint 9 · next-intl 4.13.0 · Sanity 5.30.0 + toolchain · **shadcn/ui (Base UI `@base-ui/react` 1.5.0) · lucide-react 1.17.0 · framer-motion 12.40.0 · class-variance-authority 0.7.1 · clsx 2.1.1 · tailwind-merge 3.6.0 · tw-animate-css 1.4.0** (+ `shadcn` 4.10.0 in devDeps). AI search stack → 1.09. Exact pins + notes in `00_stack-and-config.md`.

## What exists now
- **Trilingual App Router shell** under `src/app/[locale]/` (mk/en/sr). `[locale]/layout.tsx` is a root layout (fonts, tokens, `<html lang>`, provider) that now mounts the **real Style A chrome**: skip-to-content link → `<SiteHeader>` → `<main id="content" tabIndex=-1>` → `<SiteFooter>`. No `src/app/layout.tsx` (next-intl pattern).
- **Style A chrome (1.06):** sticky header (cream@85% + 8px blur + hairline; wordmark→home; desktop nav with caramel active underline + `aria-current`; restyled MK·EN·SR switcher; accessible Base UI Dialog mobile menu with focus trap/return + Escape + reduced-motion-gated Framer entrance); walnut footer (4 link groups from `site-links` + copyright + Privacy link). Shared primitives `Container`/`Section`/`PageHeader` + `SkipToContent`. shadcn primitives `Button`/`Separator`/`Sheet` restyled to Style A; `cn` in `src/lib/utils.ts`; nav source in `src/lib/nav.ts`; provisional links in `src/lib/site-links.ts`; brand icons in `src/components/brand-icons.tsx`.
- **Embedded Sanity Studio** at `/studio` — `src/app/studio/` is a **second root layout** sibling (its own `<html>`/`<body>`), so it is not localized. `[[...tool]]/page.tsx` (server: metadata/viewport/`force-static`) + `Studio.tsx` (`'use client'` → `<NextStudio config>`).
- **Sanity config** at repo root: `sanity.config.ts` (Studio: schema, structure w/ singletons, vision) + `sanity.cli.ts` (CLI: api + typegen).
- **Content model** in `src/sanity/schemaTypes/`: `post`, `review`, `book` (singleton), `author` (singleton — now incl. `tagline` mk-required + optional `heroIntro` for the Home hero), `topic`, shared `blockContent`, reusable localized `image`, and `localizedString/Text/BlockContent`. Field-level localization = plain `{mk,en,sr}` objects (NOT the i18n-array plugin — see report). Validation: mk-required titles/tagline, required slug, alt-required-when-image-set.
- **Data layer** `src/sanity/lib/`: `client.ts` (public read — published perspective, `useCdn`, **no token**), `image.ts` (`@sanity/image-url`), `queries.ts` (**8** typed `defineQuery`: the original 4 + 4 Home-scoped `HOME_*`), `localize.ts` (`localizedValue` mk→en→sr + `availableLanguages`). `env.ts` validates the public env vars.
- **`next/image` wired for Sanity** — `next.config.ts` `images.remotePatterns` allows `cdn.sanity.io/images/ndqmaath/**`; covers render via the optimizer (`fill` + `sizes` + 2:3 wrapper), with the graceful §6.11 placeholder when no image is set. Proof routes still use plain `<img>` (styled in their own phases).
- **TypeGen**: `schema.json` + `src/sanity/sanity.types.ts` (generated), `npm run typegen`; `client.fetch(QUERY)` is typed.
- **Seed** in `sanity/seed/`: `build-seed.mjs` (generator) → `seed.ndjson` (13 `[PLACEHOLDER]` docs) + `placeholder-cover.png`. Imported into the `production` dataset.
- **Proxy** `src/proxy.ts` now excludes `/studio` from locale routing.
- i18n layer, fonts, tokens, switcher, UI strings — unchanged from 1.04.

## Pages built
- **Real Style A Home** per locale (`/mk`,`/en`,`/sr`) — 1.07. Hero (typographic-only launch variant + dormant photo variant), featured-book parchment band, latest 3 reviews (horizontal cards), from-the-blog (3 posts, 2-up grid). Pulls live from Sanity; localized with mk→en→sr fallback; cards link to canonical `/[locale]/reviews/[slug]` + `/[locale]/blog/[slug]` (404 until 1.09/1.10).
- **Thin connect-to-site proof routes** (1.05, temporary): `[locale]/reviews`, `/blog`, `/about`, `/book` — fetch from Sanity, render localized titles (+ cover / no-image); MK-only review falls back to mk + shows "available in: MK" on `/en`/`/sr`. Now render **inside the new chrome**, unchanged otherwise. Replaced by styled pages in 1.08–1.10.
- **Thin `contact` + `privacy` stubs** (1.06, temporary): `PageHeader` + one localized "coming soon" line, so every nav/footer link resolves inside the chrome. Real pages in 1.11.
- **`/studio`** — embedded Sanity Studio (its own root layout; **no site chrome** — confirmed).

## Components built
- **`language-switcher.tsx`** — 1.04 logic, restyled to §6.4 in 1.06 (+ `className`/`onNavigate`).
- **Layout (1.06):** `layout/site-header.tsx`, `layout/primary-nav.tsx` (client), `layout/mobile-menu.tsx` (client), `layout/site-footer.tsx`, `layout/container.tsx`, `layout/section.tsx`, `layout/page-header.tsx`, `layout/skip-to-content.tsx`.
- **Home (1.07):** `components/home/` — `hero.tsx`, `featured-book.tsx`, `latest-reviews.tsx`, `review-card.tsx`, `from-the-blog.tsx`, `blog-card.tsx`, `section-heading.tsx`, `cover.tsx` (next/image + §6.11 placeholder). All server components, self-localizing via `getTranslations`. Helpers: `lib/datetime.ts` (sr→sr-Latn dates), `lib/strings.ts` (`monogramOf`).
- **shadcn primitives (1.06, Style A):** `ui/button.tsx` (exports `buttonVariants`, reused on Home CTAs), `ui/separator.tsx`, `ui/sheet.tsx`. Plus `brand-icons.tsx`.

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
- **критика vs рецензија** terminology still open (UI strings provisional, from 1.04; Home strings use "критики" to match the nav).
- **Sanity images via `next/image`** — ✅ done (1.07): `remotePatterns` for `cdn.sanity.io` in `next.config.ts`; Home covers go through the optimizer. The remaining proof routes still use plain `<img>` until their own phases.
- **Content refresh** — the build-time Sanity fetch is cached (keeps Home static `●`); after a seed re-import an *incremental* rebuild can serve stale data until `.next` is cleared (clean CI builds are unaffected). ISR/revalidate/webhooks deferred to a later phase.
- Styled header/footer/nav + shadcn/ui → ✅ done (1.06). Real pages → 1.07–1.11; SEO/metadata/hreflang/sitemap → 1.12; Dalibor's live login + Studio deploy → 2.04; AI search → 1.09/2.03.
- **`site-links.ts` is provisional** — confirm external URLs in 2.01, email in 2.02 (footer email slot is rendered but inert).
- **shadcn on Base UI (`base-nova`), not Radix** (current CLI default) — see `00_stack-and-config.md` for the deviation + globals.css reconciliation. `tw-animate-css` imported but currently unused.

## Known issues
- None blocking. (Webpack/WASM fallback unchanged; after deleting route files, clear `.next` to drop stale generated types.)
