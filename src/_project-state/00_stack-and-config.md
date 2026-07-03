# 00_stack-and-config.md

> **Location in repo:** `src/_project-state/00_stack-and-config.md`
> Append-only log of stack and configuration decisions. **Claude Code records pinned versions here at scaffolding and appends a new dated entry whenever the stack or config changes.** Never edit past entries.

---

## 2026-06-05 — Locked stack (from planning)

| Layer | Choice | Pinned version |
|---|---|---|
| Framework | Next.js (App Router) | **16.2.7** (exact — pinned 1.02) |
| Language | TypeScript | **5.9.3** (range `^5`; recorded 1.02) |
| Styling | Tailwind CSS | **4.3.0** (range `^4`; `@tailwindcss/postcss` 4.3.0; recorded 1.02) |
| Components | shadcn/ui (Radix UI) | *pin at 1.06* |
| Icons | Lucide (`lucide-react`) | *pin at 1.06* |
| Animation | Framer Motion | *pin later (1.06+)* |
| i18n | next-intl | *pin at 1.04* |
| CMS | Sanity | *pin at 1.05* |
| Contact form | Formspree | n/a (hosted) |
| AI search | Vercel AI SDK (`ai`) + Voyage embeddings + Supabase (pgvector) | *pin at 1.09* |
| Hosting | Vercel | n/a |
| DNS / CDN | TBD (Cloudflare or Vercel DNS) | — |
| Fonts | Playfair Display + Lora | *via next/font at 1.03/1.04* |

> **Correction (1.02):** the original planning snapshot marked shadcn/ui, Lucide and Framer Motion as "pin at 1.02", but the Phase 1.02 brief defers them to their own phases (shadcn → 1.06; Lucide & Framer Motion → 1.06+). Labels above updated to match. **Only the Next.js + TypeScript + Tailwind base is installed in 1.02.**

**Config conventions to record here as they're set:**
- Default locale `mk`; locales `mk`, `en`, `sr`; root → `/mk`. *(wired in 1.04)*
- Environment variables (names only, never values): Sanity project/dataset, Voyage API key, Supabase URL + keys, Formspree form ID.
- `.env.local` is never committed. *(confirmed gitignored at 1.02 via the `.env*` rule)*
- Node version, package manager, and any build/runtime flags. *(recorded below at 1.02)*

*(Append new entries below as the stack or config evolves.)*

---

## 2026-06-05 — Phase 1.02 scaffolding (base stack installed + pinned)

**Environment**
- Node.js **v24.14.0** (well above Next.js's 18.18 minimum / 20 LTS recommendation).
- npm **11.9.0**.
- Package manager: **npm** (lockfile: `package-lock.json`).
- OS: Windows 11 Pro (win32 x64).

**Installed & pinned (exact versions from `npm ls`)**

| Package | Installed | In `package.json` |
|---|---|---|
| next | 16.2.7 | `16.2.7` (exact) |
| react | 19.2.4 | `19.2.4` (exact) |
| react-dom | 19.2.4 | `19.2.4` (exact) |
| typescript | 5.9.3 | `^5` |
| tailwindcss | 4.3.0 | `^4` |
| @tailwindcss/postcss | 4.3.0 | `^4` |
| eslint | 9.39.4 | `^9` |
| eslint-config-next | 16.2.7 | `16.2.7` |

- `next`, `react`, `react-dom` are pinned to **exact** versions (no `^`) as required. `create-next-app` already writes these three exact, so no edit was needed.
- `typescript` and `tailwindcss` are left at caret ranges (only the three above are required to be pinned exact).

**Scaffold configuration (`create-next-app@latest`, non-interactive)**
- TypeScript · Tailwind CSS · ESLint · App Router · `src/` directory · import alias `@/*` → `./src/*` · npm.
- **Tailwind v4** is CSS-first: there is **no `tailwind.config.*`** — configured in `src/app/globals.css` (`@import "tailwindcss"`) + `postcss.config.mjs` (`@tailwindcss/postcss`).
- **ESLint v9** uses a flat config (`eslint.config.mjs`, extends `eslint-config-next`).
- `next.config.ts` is the default (empty) config.
- create-next-app also generated `AGENTS.md` + `CLAUDE.md` (agent guidance, noting Next 16 has breaking changes). Kept as-is.

**Build/runtime flag — Webpack instead of Turbopack (environment-forced)**
- Next.js 16 defaults to **Turbopack** for both `next dev` and `next build`. Turbopack requires the **native** SWC binding (`@next/swc-win32-x64-msvc`).
- On this machine that native `.node` binary is **blocked by a Windows Application Control policy**, so Next falls back to **WASM** SWC — which Turbopack cannot use. `next build` errored: *"Turbopack is not supported on this platform … use Webpack instead."*
- **Fix applied:** the `dev` and `build` npm scripts use the **`--webpack`** flag (`next dev --webpack`, `next build --webpack`). WASM SWC + Webpack build and run successfully.
- This is a **local-platform** constraint. On Linux build envs (e.g. Vercel) the native binding loads normally and Turbopack would work — a maintainer may drop `--webpack` there if desired. Left as Webpack so local and prod behave identically.

**Known `npm audit` findings (1.02)**
- **2 moderate** advisories, both the same transitive issue: `postcss <8.5.10` (GHSA-qx2v-qp2m-jg93, XSS in CSS stringify) pulled in **inside** `next@16.2.7` (`node_modules/next/node_modules/postcss`).
- npm's only offered "fix" is `npm audit fix --force`, which downgrades `next` to **9.3.3** (breaking, unacceptable) — **not applied**.
- Build-time tooling, low practical risk for this site. Expected to clear when Next.js bumps its bundled postcss; re-check in a later phase.

---

## 2026-06-06 — Phase 1.04 (next-intl trilingual routing + fonts + design tokens)

**Added dependency**

| Package | Installed | In `package.json` |
|---|---|---|
| next-intl | 4.13.0 | `^4.13.0` |

- Installed `next-intl@^4` → resolved **4.13.0**. Peer-compatible with `next ^16` and `react ^19` (verified in the package's `peerDependencies`).
- No new `npm audit` advisories from next-intl (the 2 moderate `postcss`-in-`next` findings from 1.02 are unchanged).
- The pinned **`--webpack`** `dev`/`build` scripts are unchanged; the next-intl plugin only wraps `next.config.ts`.

**i18n / routing config (wired this phase)**
- Locales: **`mk` (default)**, `en`, `sr`. Root → `/mk`, always.
- `localePrefix: 'always'` — every URL carries its prefix (`/mk`, `/en`, `/sr`).
- **`localeDetection: false`** — no `Accept-Language`/cookie redirect; `/` → `/mk` regardless of browser language (Decision #5). Verified at runtime.
- Serbian script = **Latin** (architecture is script-agnostic; a future Cyrillic flip touches only `sr.json` + the switcher label).
- Source of truth: `src/i18n/routing.ts` (shared by the proxy, navigation helpers, and request config).

**Middleware filename — `src/proxy.ts` (NOT `middleware.ts`)**
- Next.js **16 renamed the Middleware file convention to Proxy** (`middleware` is deprecated). Confirmed in the bundled docs: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` and `.../03-api-reference/03-file-conventions/proxy.md`.
- next-intl's `createMiddleware(routing)` is filename-agnostic; mounted as `export default createMiddleware(routing)` in `src/proxy.ts`. Build output reports `ƒ Proxy (Middleware)` active.

**Fonts (via `next/font/google`)**
- **Playfair Display** (display) weights `500/600/700` + italic; **Lora** (body) weights `400/500/600` + italic; both `subsets: ['latin','cyrillic']`, `display:'swap'`, exposed as `--font-playfair` / `--font-lora`.
- The handover's explicit variable-font `weight`/`style` arrays built fine (the "drop weight → full axis" fallback was not needed). Self-hosted; Cyrillic confirmed rendering in both faces.

**Design tokens**
- Style A `@theme` block (1.03 Appendix A) applied to `src/app/globals.css`. **Dark-mode block removed (Decision #14).**

**Type safety**
- `src/global.d.ts` augments next-intl `AppConfig` (`Locale` from `routing.locales`, `Messages` from `en.json`).

**Notes**
- Deleting an `app/` route file can leave a stale generated type under `.next/dev/types/…`; clear `.next` before rebuilding.
- `.claude/launch.json` added (config `prod`, `autoPort:true`) to drive the Preview tool for visual checks.

---

## 2026-06-06 — Phase 1.05 (Sanity CMS + content models + embedded Studio)

**Added dependencies (exact resolved versions)**

| Package | Installed | In `package.json` |
|---|---|---|
| sanity | 5.30.0 | `^5.30.0` |
| next-sanity | 13.0.11 | `^13.0.11` |
| @sanity/vision | 5.30.0 | `^5.30.0` |
| @sanity/image-url | 2.1.1 | `^2.1.1` |
| styled-components | 6.4.2 | `^6.4.2` |

- Installed the latest stable of each. **React 19.2.4 / Next 16.2.7 satisfy every peer** (sanity `react ^19.2.2`; next-sanity `react ^19.2.3`, `next ^16`, `sanity ^5.29 || ^6`). No ERESOLVE, **no `--force`/`--legacy-peer-deps`**. `styled-components` added explicitly (Studio peer). Node 24.14.0 satisfies the toolchain `engines` (`>=22.12`).
- Evaluated `sanity-plugin-internationalized-array@5.1.3` (version-compatible with Studio v5) but **removed it** — it cannot cleanly localize Portable Text, and the model needs localized rich text. Used the plain `{mk,en,sr}` **object** shape uniformly instead (fallback in `src/sanity/lib/localize.ts`). Full rationale in the 1.05 completion report.
- **21 moderate `npm audit`** findings appeared (transitive in the Sanity toolchain). `npm audit fix --force` would break (downgrades) — not applied; revisit on upstream bumps. (Supersedes 1.02's 2 postcss-in-next findings.)

**Sanity project + env**
- Project id **`ndqmaath`** ("Dalibor Plečić Website"); **`production`** dataset set **Public**; CORS origin `http://localhost:3000` (allow credentials).
- Env vars (names only — all PUBLIC, no token): `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` (=`production`), `NEXT_PUBLIC_SANITY_API_VERSION` (=`2026-06-06`). `.env.local` gitignored; **`.env.example` committed** (added `!.env.example` negation to `.gitignore`).

**Config + conventions wired this phase**
- Embedded Studio at **`/studio`** (basePath) — root `sanity.config.ts` (schema + `structureTool`/structure + `visionTool` + singleton enforcement) and `sanity.cli.ts` (`api` + `typegen`).
- Read client (`src/sanity/lib/client.ts`): **`perspective:'published'` + `useCdn:true`, no token.**
- **Localization shape:** plain `{mk,en,sr}` objects for ALL localized fields (NOT the i18n-array plugin); graceful fallback mk→en→sr.
- **Singletons:** `book` + `author` — pinned `documentId` in `structure.ts` + create/delete/duplicate/unpublish + template restrictions in `sanity.config.ts`.
- **TypeGen:** `npm run typegen` = `sanity schema extract && sanity typegen generate`. Config lives in the `sanity.cli.ts` **`typegen`** key (the standalone `sanity-typegen.json` is deprecated and not used). Outputs `schema.json` (root) + `src/sanity/sanity.types.ts` (gitignored by ESLint, type-checked by tsc).
- **Proxy:** `src/proxy.ts` matcher excludes `/studio` (`(?!api|_next|_vercel|studio|.*\..*)`).
- **Second root layout:** `src/app/studio/layout.tsx` renders the Studio branch's `<html>`/`<body>` (sibling of `[locale]`, no top-level `app/layout.tsx`) — valid multiple-root-layouts setup; build confirms `○ /studio/[[...tool]]`.
- **Folders:** code in `src/sanity/`; the Plan's root `sanity/` repurposed for seed data (`sanity/seed/`).

**Notes / gotchas**
- Sanity CLI env: ran `schema extract` / `typegen` / `dataset import` with the three `NEXT_PUBLIC_SANITY_*` vars injected inline (robust regardless of whether the CLI auto-loads `.env.local`). Next loads `.env.local` for `dev`/`build` automatically.
- Seed import: `npx sanity dataset import sanity/seed/seed.ndjson --dataset production --replace` (idempotent; the dataset had been seeded once already). The placeholder cover is uploaded via the `_sanityAsset` `image@file://./placeholder-cover.png` directive (asset ref merged while preserving `_type` + localized `alt`).
- `@sanity/image-url`: use the **named** `createImageUrlBuilder` (the default export is deprecated); it builds `cdn.sanity.io` URLs.
- `dev`/`build` remain pinned to `--webpack` (1.02 constraint unchanged).

---

## 2026-06-07 — Phase 1.06 (Core layout & shared components: shadcn/ui + header/footer/nav)

**Added dependencies (exact resolved versions)**

| Package | Installed | In `package.json` | Where |
|---|---|---|---|
| @base-ui/react | 1.5.0 | `^1.5.0` | dependencies |
| lucide-react | 1.17.0 | `^1.17.0` | dependencies |
| framer-motion | 12.40.0 | `^12.40.0` | dependencies |
| class-variance-authority | 0.7.1 | `^0.7.1` | dependencies |
| clsx | 2.1.1 | `^2.1.1` | dependencies |
| tailwind-merge | 3.6.0 | `^3.6.0` | dependencies |
| tw-animate-css | 1.4.0 | `^1.4.0` | dependencies |
| shadcn | 4.10.0 | `^4.10.0` | **devDependencies** |

- Installed via the official shadcn CLI (`npx shadcn@latest init -d`, then `add separator sheet`; `button` came from init). Clean install under **React 19.2.4 / Next 16.2.7 / Tailwind 4.3.0** — no peer conflicts, no `--force`/`--legacy-peer-deps`. `framer-motion@12` is React-19-compatible (also deduped via `sanity`'s `motion@12`).
- `--webpack` `dev`/`build` scripts unchanged.

**shadcn/ui setup — deviations from the plan (reported per "no silent ratifications")**

- **Base UI, not Radix.** The current CLI (`shadcn@4.10`) defaults to **Base UI** (`style: "base-nova"`, `@base-ui/react`); `init -d --base radix` needs an interactive "switch base?" confirmation that `-d` does not auto-answer. The plan's locked sub-choice was "shadcn/ui (Radix UI)". Per the 1.06 brief ("use the current CLI; report deviations"), kept Base UI — React 19 / Next 16 / TW4 compatible, same lineage, equivalent Dialog a11y. `components.json` records `base-nova`.
- **`shadcn init` overwrites `globals.css` destructively.** It injected a neutral oklch `:root`, a `.dark` block, an `@theme inline` var-remap that **clobbered `--color-primary` (→ caramel) and `--color-border`**, and an `@layer base { body { @apply bg-background text-foreground } }`. Restored the Style A `globals.css` and instead added a controlled set of **shadcn alias tokens mapped to the literal Style A hexes** (`--color-background/foreground/card/card-foreground/popover/popover-foreground/muted/muted-foreground/accent/accent-foreground/secondary/secondary-foreground/primary-foreground/input/ring/destructive/destructive-foreground`) + a `--radius` scale (10px base). **`--color-primary` (caramel) and `--color-border` (hairline) are deliberately NOT remapped** (preserves §2.5). No dark mode (Decision #14): dropped the `.dark` + `@custom-variant dark` blocks.
- **Primitives made self-sufficient.** Dropped the `@import "shadcn/tailwind.css"` line; the restyled `button`/`separator`/`sheet` use standard Tailwind v4 `data-[...]` variants instead of that file's custom variants, so the build does not depend on the `shadcn` package's CSS subpath. Kept `@import "tw-animate-css"` (standard shadcn TW4 setup; currently unused by chrome).
- **`shadcn` moved to devDependencies** (init had added it to `dependencies`; it's CLI-only, not a runtime dep).
- **lucide-react 1.x removed brand icons** (`Instagram/Facebook/Youtube`). Re-created them as MIT Lucide-outline components in `src/components/brand-icons.tsx`. Generic icons still from `lucide-react`. Icon stroke-width set to 1.75 per handover §5.

**Mobile-menu architecture note**

- Base UI Dialog's transition-gated unmount/focus (CSS `transitionend` / rAF) is unreliable — it leaves a closed-but-focusable panel when transitions are zeroed (**`prefers-reduced-motion`**) or in throttled renderers. Mitigation: the `Sheet` is **transition-free**; the mobile menu **conditionally renders** the panel on `open` (synchronous unmount) and manages **focus-in / focus-return explicitly** (rAF-free). Base UI still provides the focus trap, Escape, backdrop close, modal isolation, and dialog ARIA. The single entrance animation uses **Framer Motion**, gated by `useReducedMotion`.

---

## 2026-06-07 — Phase 1.07 (Home page)

**No new dependencies.** Built entirely on the already-installed stack (next-intl, Sanity, `@sanity/image-url`, next/image, Tailwind v4 tokens, framer-motion not used here — the Home reveal is pure CSS).

**Config change — `next.config.ts` `images.remotePatterns`**
- Added `images.remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/ndqmaath/**" }]` so `next/image` can optimize Sanity-hosted covers. Scoped to this project's image path (the docs advise "be as specific as possible"). Works regardless of the `--webpack` flag. The wrapper `createNextIntlPlugin(...)` is unchanged.
- Default image `quality` (75) is used, so Next 16's `images.qualities` allowlist is not required.

**Schema/content**
- `author` singleton gained `tagline` (`localizedString`, **mk-required** via `requireMk`) and `heroIntro` (`localizedText`, optional) for the CMS-editable hero. TypeGen regenerated (`schema.json` + `sanity.types.ts`): now **8** typed queries (4 original + 4 `HOME_*`), 23 schema types.
- Seed (`build-seed.mjs`) updated: author hero text (`[PLACEHOLDER]`, all three languages) and the MK-only review re-dated newest (so Home's "latest 3" window exercises the mk→en→sr fallback + "available in" note). Re-imported with `--replace`.

**Build/data note (not a config change, recorded for future phases)**
- The build-time Sanity `client.fetch` (`useCdn: true`) is cached in `.next/cache`, which is what keeps the locale homes statically prerendered (`●`). After a dataset re-import, an **incremental** local rebuild can serve the previous result until `.next` is cleared (`Remove-Item -Recurse -Force .next`). Clean CI/Vercel builds start with no cache, so this is local-only. A content-refresh strategy (ISR / `revalidate` / Sanity webhooks) is deferred to a later phase.
- `dev`/`build` remain pinned to `--webpack` (1.02 constraint unchanged).

---

## 2026-06-07 — Phase 1.08 (About + Book pages + shared Portable Text renderer)

**New dependency — `@portabletext/react` `^6.2.0`** (promoted to a **direct** dependency in `package.json`). It was already present transitively via `next-sanity`/`sanity`; making it direct guarantees it survives a clean install. RSC-compatible (renders as a server component — no `"use client"`, no client hooks). Used by `src/components/portable-text.tsx`.

**Schema/content**
- `book.purchaseLinks[].url` is now `.required()` (was URL-validated only) — the single schema edit this phase. All other fields the brief mentioned (`author.bio`, `book.description`, `purchaseLinks`, flat `publisher`/`publicationYear`) already existed from 1.05/1.07 and were **reused**; the "portrait" reuses the existing `author.photo`. **No `format` field added.**
- **Discrepancy guard:** the seeded `book.genre` value was **removed** from `build-seed.mjs` (the field remains in the schema, editable, but is never seeded and never rendered). Seed `author.bio` + `book.description` expanded to 3 `[PLACEHOLDER]` paragraphs each (mk/en/sr). Regenerated + re-imported (`--replace`).
- TypeGen regenerated: still **8** typed queries — `AUTHOR_QUERY` removed, `ABOUT_QUERY` added, `BOOK_QUERY` repurposed for the Book page (now selects `description`/`purchaseLinks` + a cross-document `"authorName"`, drops `genre`).

**i18n** — added `book.byline` / `book.whereToFind` / `book.findIt` to `messages/{en,mk,sr}.json` (mk Cyrillic; en/sr Latin; `byline` uses the `{name}` ICU param).

**No other config changes.** `next.config.ts`, the next-intl plugin wrapper, and the `--webpack` pin are unchanged. Page-load reveal still uses the pure-CSS `.reveal` classes (no Framer Motion).

---

## 2026-06-07 — Phase 1.09 (Reviews list + topic search + single-review pages; AI-search stack built dormant)

**Added dependencies (exact resolved versions)**

| Package | Installed | In `package.json` | Where |
|---|---|---|---|
| ai | 6.0.197 | `^6.0.197` | dependencies |
| voyage-ai-provider | 4.0.0 | `^4.0.0` | dependencies |
| @supabase/supabase-js | 2.107.0 | `^2.107.0` | dependencies |
| server-only | 0.0.1 | `^0.0.1` | dependencies |

- Clean install under **React 19.2.4 / Next 16.2.7 / Tailwind 4.3.0** — no peer conflicts, no `--force`/`--legacy-peer-deps`. `voyage-ai-provider@4` declares no `ai` peer; both it and `ai@6` resolve to the single hoisted `@ai-sdk/provider@3`, so `embed`/`embedMany` accept the Voyage `EmbeddingModelV3` with **no provider-spec mismatch and no `@ts-ignore`**.
- `--webpack` `dev`/`build` scripts unchanged.
- **`npm audit`** is now **19 moderate** (transitive; Sanity toolchain + the new ai/supabase chains). `--force` would break (downgrades); not applied — revisit on upstream bumps.

**AI-search decisions recorded here (built in 1.09, goes live in 2.03)**

- **Two-tier, semantic-with-keyword-fallback, all server-side.** Semantic runs only when `VOYAGE_API_KEY` + `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are all present (derived from env presence, single-sourced via `semanticConfigured()`); otherwise the always-on keyword path runs. The semantic path is wrapped in `try/catch` so a runtime failure also falls back. The API returns an honest `mode: 'semantic' | 'keyword'` flag. The browser only ever calls our own `POST /api/reviews/search`.
- **Embedding model + dimension:** `VOYAGE_MODEL` defaults to **`voyage-3.5`** (multilingual, 1024-dim, cheap); the pgvector column is **`vector(1024)`** (documented constant `EMBEDDING_DIMENSIONS = 1024`). `voyage-3.5` and `voyage-4` both default to 1024 dims, so 2.03 can pick the final model without touching the migration. **The migration was NOT run.**
- **Voyage ↔ AI SDK — flagged deviation (no first-party provider):** Voyage is reached through the **community `voyage-ai-provider`** via the Vercel AI SDK core (`ai`: `embed`/`embedMany`). All Voyage access is isolated behind `src/lib/search/embeddings.ts` (`embedQuery`/`embedDocuments`), so 2.03 can swap to the Vercel AI Gateway or a direct REST call without touching call sites. Verified API: `createVoyage().embeddingModel('voyage-3.5')` (the `textEmbeddingModel` alias is deprecated), `providerOptions.voyage.inputType: 'query'|'document'`.
- **Vector store:** Supabase pgvector, **HNSW** index with `vector_cosine_ops`, cosine distance (`<=>`), **one embedding row per review** (language-neutral slug; the multilingual model matches cross-lingually from a single combined-language source). Match logic lives in the `match_reviews` SQL RPC (invoked via `supabase.rpc(...)`); topic-scoping is applied to the hydrated Sanity set in JS (topics aren't in the vector table — no `.eq()` chained onto the RPC). Migration file: `supabase/migrations/0001_review_embeddings.sql` (written, **not executed**).
- **Server-only isolation:** `embeddings.ts`, `supabase.ts`, `reviews-search.ts` start with `import "server-only"`; the Voyage/Supabase modules are additionally **dynamically imported** inside the configured branch so the keyword path never loads them.

**Env vars (names only — values only in gitignored `.env.local`, set in 2.03):** `VOYAGE_API_KEY`, `VOYAGE_MODEL` (=`voyage-3.5`), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only — never `NEXT_PUBLIC`), `SANITY_WEBHOOK_SECRET` (guards the dormant re-index route). Template added to `.env.example`.

**No other config changes.** `next.config.ts`, the next-intl plugin wrapper, the proxy matcher (already excludes `/api`), and the `--webpack` pin are unchanged.

---

## 2026-06-08 — Phase 1.12 (SEO, schema, accessibility & Lighthouse pass — Part 1 close)

**No new runtime dependencies.** The whole phase is built on the installed stack + Next's metadata APIs (`Metadata`, `MetadataRoute`, `next/og` `ImageResponse`). Lighthouse + axe were run as **verification tooling via `npx`** (`lighthouse@12`, whose accessibility category is powered by axe-core) — deliberately **not** added to `package.json` (one-off audit tools, not app code). `--webpack` `dev`/`build` pins unchanged. `npm audit` unchanged (19 moderate, transitive).

**New env var — `NEXT_PUBLIC_SITE_URL` (optional).** Added to `src/sanity/env.ts` as `siteUrl` (default `http://localhost:3000`; trailing slash stripped) + `.env.example`. Used as `metadataBase` and the base for every canonical / hreflang / Open Graph / sitemap / robots URL. The real domain is set at deploy (2.05) — one env change flips every absolute URL. Never hard-fails when unset.

**Bundled OG fonts (new repo assets, not deps).** `src/lib/seo/og-fonts/*.ttf` — five static, single-subset OFL-licensed TTFs (Playfair Display latin + latin-ext @700; Lora latin + latin-ext + cyrillic @400). **Satori (the engine behind `next/og`) cannot parse variable fonts** (it threw on the variable Playfair/Lora), so static instances are bundled and stacked in `fontFamily` for full glyph coverage — the wordmark's č/ć (Latin-ext) and the Macedonian Cyrillic tagline. Read from disk at build via `process.cwd()`.

**LazyMotion — applied.** The Plan flagged switching Framer Motion to `LazyMotion`+`m` if it cost Performance budget. Mobile Performance was below target, so the mobile menu (the only Framer consumer) was converted to `LazyMotion` + the lightweight `m` component, with the DOM animation features **dynamically imported** — Framer now loads lazily on menu-open rather than in the header's upfront JS on every page (the `useReducedMotion` gate is preserved). It trimmed TBT/JS but did not, on its own, lift the localhost mobile Performance score (see the mobile-Performance note below).

**Fonts left as the handover spec (variable-font experiment reverted).** Both families still load via `next/font` as static instances with `display: swap` (Playfair 500/600/700, Lora 400/500/600, latin+cyrillic, normal+italic) exactly as 1.04. A variable-font swap + `preload: false` + `display: optional` were each trialled to cut the LCP-gating font payload on mobile; none moved the localhost lab score, so the faithful, known-good config was kept.

**Mobile Performance — accepted on localhost, re-measure on the deployed domain (decision recorded with the operator).** Lighthouse Performance is **99–100 desktop** and **~79–85 mobile** on `npm run build && npm start` (localhost); mobile Accessibility/Best-Practices/SEO are all ≥95. The mobile-Performance gap is structural: an LCP gated by the two-serif webfont swap + an FCP floored by Lighthouse's simulated Slow-4G model, on a localhost server with **no CDN, HTTP/2, or brotli**. The design-preserving levers above don't move that localhost number. Per the operator's call, the locked typography-forward design is kept intact and **mobile Performance is to be re-measured on the deployed Vercel build (real CDN/HTTP-2/brotli + real content) in Part 2 (2.05)** — the environment that reflects real users. The non-Performance categories meet the ≥95 bar everywhere now.

**Next 16 metadata-merge gotcha (recorded for later phases).** A page's `generateMetadata` `openGraph` **replaces** (not deep-merges) an ancestor segment's `openGraph`, which drops the file-convention `opengraph-image`'s auto-injected `og:image` on any route deeper than the `[locale]` segment. Fix: `buildPageMetadata` references the same OG image route explicitly for non-root pages, while Home keeps the file-convention injection — net exactly one `og:image` + one `twitter:image` per page, no duplicates. (When real per-page photo cards land in Part 2 by dropping `opengraph-image.*` into deeper segments, those segments' own file convention will take over and the explicit reference can be revisited.)

**Proxy matcher updated.** `src/proxy.ts` now also excludes `/sitemap.xml` + `/robots.txt` (matcher negative-lookahead + in-code guard) so the crawl files are never locale-redirected (supersedes the 1.09 note that the matcher only excluded `/api`/`/studio`).

## 2026-06-13 — Phase 2.05 (Vercel preview validation pass)

**No new dependencies.** Verification-only tooling (`npx lighthouse@12`) again, not added to `package.json`. `--webpack` pins unchanged.

**New env var — `PREVIEW_NOINDEX` (server-side, optional).** Added to `src/sanity/env.ts` as `previewNoindex` (`/^(1|true|yes|on)$/i` on the trimmed value; unset = off) + `.env.example`. **Not** `NEXT_PUBLIC_` — it's read server-side at build time (the pages prerender statically). When on, `src/app/[locale]/layout.tsx` `generateMetadata` emits a site-wide `robots: { index:false, follow:false }` (inherited by every child page — no page sets `robots`) **and** `src/app/robots.ts` returns a blanket `Disallow: /` (no sitemap/host). This is a belt-and-suspenders noindex so a validation deploy can never be indexed regardless of Vercel's branch/target logic. Turn ON for 2.05; remove at real launch (2.06).

**`NEXT_PUBLIC_SITE_URL` re-classified REQUIRED on Vercel.** The 1.12 fallback (`http://localhost:3000`) is correct *locally* but on the deployed build it leaks `localhost` into canonical / hreflang / OG / sitemap / robots / JSON-LD — and fails Lighthouse's `canonical` audit (the only SEO miss on real infra, capping SEO at 92). `.env.example` now states it must be set to the deploy's own origin (validation deploy → `https://dalibor-web.vercel.app`; launch → the production domain). No code change — the code already reads it; it just was never set on the Vercel project.

**On-infra Lighthouse (real Vercel CDN/HTTP-2, `https://dalibor-web.vercel.app/mk`, `lighthouse@12`, isolated runs):**
| | Performance | Accessibility | Best-Practices | SEO |
| --- | --- | --- | --- | --- |
| **Desktop** | **100** (FCP 0.4s · LCP 0.8s · TBT 20ms · CLS 0) | 100 | 100 | 92 ¹ |
| **Mobile** | **79** (FCP 2.0s · LCP 4.0s · TBT 260ms · CLS 0) | 100 | 100 | 92 ¹ |

¹ SEO 92 on both = a single failing audit, `canonical` ("Document does not have a valid `rel=canonical`"), caused entirely by the localhost canonical → expected to return to ~100 once `NEXT_PUBLIC_SITE_URL` is set + redeployed (no code fix needed).

**Mobile-Performance unknown — RESOLVED, and the 1.12 hypothesis disproved.** 1.12 deferred the mobile number on the expectation that real CDN/HTTP-2/brotli would lift it. It did **not**: mobile is confirmed **79 on real infra**, because Lighthouse's mobile config **simulates Slow-4G + 4× CPU on top of** the real network — a faster server barely moves the *simulated* score (hence desktop's lighter throttle scores 100 while mobile stays 79). The gap is a single, content-independent lab artifact: **LCP render-delay 3.3s on the header wordmark** (`font-display`/Playfair, always Latin "Dalibor Plečić") waiting on the webfont swap. Render-blocking = none, CLS = 0, TBT = 260ms, A11y/BP = 100; the only JS opportunities are trivial (~150ms each). The design-preserving font levers were already exhausted in 1.12 (variable font, `preload:false`, `display:optional` — none moved it). **Decision (unchanged from 1.12, now evidence-backed):** keep the locked typography-forward Style A; do **not** chase the lab number with design- or a11y-disturbing changes. Re-validate after real content lands (2.01/2.03 — a hero portrait may displace the wordmark as LCP) and, definitively, against **field data (CrUX)** post-launch (2.06), which reflects real users rather than the lab simulation.

---

## 2026-06-15 — Phase 2.03 (Reviews semantic search turned ON)

**Added dependency**

| Package | Installed | In `package.json` | Where |
|---|---|---|---|
| tsx | ^4.22.4 | `^4.22.4` | **devDependencies** |

- `tsx` runs the new TypeScript Node scripts so they can reuse the app's real `@/lib/search/*` modules (the Voyage wrapper, the Supabase client, the shared content builder) instead of duplicating that logic. Scripts run as `node --conditions=react-server --import tsx --env-file=.env.local …`: `--conditions=react-server` lets a plain Node process import the `server-only`-guarded wrapper modules; `--env-file` loads the keys. No app/runtime dependency added — `tsx` is dev-only tooling.

**Embedding model + dimension — FINAL: `voyage-3.5` @ 1024 dims.**
- Confirmed live: `voyage-3.5` embeds at **1024** dimensions for both `inputType: "document"` (storage) and `inputType: "query"` (search) — matching the migration's `vector(1024)` column + the `match_reviews(query_embedding vector(1024))` RPC + HNSW `vector_cosine_ops` index. The wrapper already distinguishes query vs document `inputType`; verified end-to-end.
- **`voyage-4` considered, not adopted.** The newer family also supports 1024 dims (a clean swap that would leave the table/index untouched), but `voyage-3.5` is proven, operator-selected (`VOYAGE_MODEL=voyage-3.5`), multilingual-suitable, and already validated cross-lingually here — so it stays. A future `voyage-4` swap remains a one-line `VOYAGE_MODEL` change *iff* the output dimension is pinned to 1024 (re-embed via the backfill afterward).

**Code changes (search layer)**
- New `src/lib/search/review-embedding-text.ts` (no `server-only`) — `buildReviewEmbeddingText(review)` (combined mk+en+sr title/book/body, flattened with the 1.09 `blocksToPlainText`) + `reviewEmbeddingHash(content)` (SHA-256). The **single source of truth** for the embedded text, so the reindex route and the backfill embed identically (and the content hash stays a reliable "unchanged?" check).
- `src/app/api/reviews/reindex/route.ts` refactored to use that builder (replacing its inline content-building). Now **LIVE**: `x-webhook-secret`-authenticated (wrong/missing → 401; unconfigured env → 503), embeds + upserts one row by slug.
- `src/lib/search/embeddings.ts` gained `embedQueries(texts)` — a batched query-embed (Voyage `inputType: "query"`) used by tooling (the ranking test) to stay within Voyage's request-rate limit; the live search still uses singular `embedQuery`.

**Vector store — migration APPLIED.**
- Run in the **`dalibor-web`** Supabase project (ref **`wjqgkauzjrgnamacldgx`**, a clean DB whose ref matches `SUPABASE_URL`). **No Supabase MCP** was available in this environment and the service-role key can't execute DDL via PostgREST, so `supabase/migrations/0001_review_embeddings.sql` was applied by the operator in the **Supabase SQL editor**; the table, the `match_reviews` RPC, and the 1024-dim vector column were then verified from here via a service-role round-trip (the backfill upsert/count) + the fixture ranking test (which exercises the RPC). The HNSW index is created by the same migration script.

**New npm scripts**
- `embed:reviews` → `scripts/embed-reviews.mts` (backfill / full resync; idempotent content-hash skip + orphan-prune; doubles as the one-shot re-embed after the 2.01 import).
- `test:semantic` → `scripts/test-semantic-ranking.mts` (content-independent multilingual ranking proof; fixtures in a `zfixture-` namespace, torn down).

**Voyage free-tier rate limit — operational finding (for Cowork / launch).**
- Without a payment method on the Voyage account, limits are **3 RPM / 10K TPM** (the API says so in its 429 body); the 200M free `voyage-3.5` tokens still apply. Implications: (a) the real **~78-review 2.01 backfill** will exceed 10K TPM in one pass and needs a Voyage **payment method added** (stays free under 200M tokens) or heavy throttling; (b) live search can intermittently 429 under burst — which the orchestrator turns into a graceful **keyword fallback** (proven), not an error. **Recommendation: add a Voyage payment method before the 2.01 backfill + launch.**

**Verification evidence (local).**
- Backfill: 4 reviews → 4 rows (`rows == reviews`); re-run idempotent (embedded=0, skipped=4).
- Live route `POST /api/reviews/search`: `mode:"semantic"`, result shape matches `types.ts` `ReviewSummary`; latency ~1.2s warm / ~2.2s cold (dev server, free-tier Voyage embed dominates).
- Ranking test: 4/4 pass incl. a **cross-lingual** (EN query → MK snippet, sim 0.572 vs 0.30) and a **no-verbatim-keyword** case (0.577).
- Fallback: keys-unset → `keyword`; keys-present-but-Voyage-invalid (runtime error) → `keyword` (caught) — the search box never dies.
- Reindex: missing/wrong secret → 401; correct secret → 200 + row `updated_at` refreshed.

**Env.** The four search vars (`VOYAGE_API_KEY` + `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` + `SANITY_WEBHOOK_SECRET`) are now **REQUIRED** for semantic search + auto-reindex — present in gitignored `.env.local` locally; **to be set on the Vercel project at/after deploy** (until then production runs the keyword fallback — by design, not a bug). `.env.example` updated to say so (placeholders only). **No real secret in any tracked file.**

**No other config changes.** `next.config.ts`, the next-intl plugin wrapper, the proxy matcher, and the `--webpack` `dev`/`build` pin are unchanged. `npm audit` unchanged in character (transitive; the new `tsx` is dev-only).

## 2026-06-26 — Phase 2.01b (intake merge + content import — PARTIAL pass)

**No new dependency added.** The xlsx parser the phase anticipated is **NOT** added in 2.01b — the reviews/posts workbook was absent, so the workbook import is deferred to **2.01c** (which will add a pinned xlsx parser, e.g. SheetJS `xlsx`, and log it here then). The new `import:content` script reuses the existing `.mts` toolchain (`tsx`, dev-only) — no runtime dependency.

**New npm script.**
- `import:content` → `scripts/import-content.mts` (idempotent Author/Book singleton + translations import; `--dry-run` supported), run via `node --conditions=react-server --import tsx --env-file=.env.local …` — the same pattern as `embed:reviews`/`test:semantic`.

**Schema-validation POLICY change (deliberate).**
- `review.reviewTitle` and `review.bookTitle` are **no longer Macedonian-required** (the `requireMk` custom validation was removed from both). Rationale: most reviews exist only in hr/sr/en; the site falls back mk→en→sr and shows the "available in: …" note. The **slug remains the required, language-neutral identifier**. Author `name`/`tagline` and Book `title` keep `requireMk` (those documents are authored in Macedonian).
- `review.coverImage` is now **optional** (the previous custom "cover required" rule is gone) — most reviews have no cover; the graceful Style A placeholder renders. Alt text is still required once an image is set (unchanged, in `localizedImage`).

**Schema additions / reuse.**
- `author.translations[]` (object array: `title`, `originalAuthor`, `fromLang`, `toLang`, `publisher?`, `year?`, `kind: book|play|anthology`) + `author.education` (localizedString). Language values are stored as **codes** (mk/sr/bg/hr/en/fr) and localized to display names at render (`about.langNames.*`) — a separation-of-concerns choice.
- **Reuse over duplication:** the requested `review.firstPublished {outlet,url}` attribution is served by the **existing** `review.source {sourceName, sourceUrl}` (re-titled/-documented), not a new field.

**ESLint config — `dist/**` ignored.**
- Added `dist/**` to the flat-config `globalIgnores`. The 2.04 hosted-Studio build (`sanity deploy`) writes large minified bundles to the gitignored `dist/`; ESLint was linting them and **OOM-crashed** (`Ineffective mark-compacts near heap limit`). `dist/` is a build artifact (like the already-ignored `.next`/`out`/`build`). Pre-existing gap exposed by 2.04, fixed here.

**Repo content.**
- `content-packet/` now exists in the repo with **`intake/Dalibor-Intake-Answers-MK.md`** (relocated from `~/Downloads`, SHA-verified — the verbatim MK bio/book-description source the import reads) + a `README.md` documenting the still-pending workbook/docx/assets for 2.01c. The reviews/posts workbook, singletons docx, and assets manifest remain **absent**.

**Token.** The Sanity **write** token lives in gitignored `.env.local` as **`SANITY_WRITE_TOKEN`** (the phase expected `SANITY_API_WRITE_TOKEN`; `.env.example` defines no write-token name — the public read client stays token-less). The import script reads `SANITY_WRITE_TOKEN`. No secret in any tracked file; never printed.

## 2026-07-03 — Phase 2.01c (reviews/posts/topics import)

**No new dependency added.** The xlsx parser 2.01b anticipated is **still not added** — the reviews/posts/topics content arrived as three plain JSON files (`content-packet/{topics,reviews,posts}.json`), read with Node's built-in `readFileSync` + `JSON.parse`. No spreadsheet parser, no runtime dependency; the import reuses the existing `.mts`/`tsx` toolchain.

**Schema addition — `post.source`.**
- Added an optional `source` object (`sourceName` string + `sourceUrl` url, `https`-validated) to the **`post`** document, mirroring `review.source` — the "first published on …" attribution. Renders as a quiet Style-A "Source → outlet" link on the single-post page.
- **Factored, not duplicated:** the inline `source` object was extracted to a shared **`sourceField()`** factory (`src/sanity/schemaTypes/source.ts`), consumed by **both** `review.ts` and `post.ts` (same idiom as `localizedSlug()`). `review`'s generated schema is **byte-identical** after the refactor — the `schema.json` diff is purely the additive `post.source`. Typegen regenerated.
- New neutral i18n string `blog.source` ("Source" / "Извор" / "Izvor") in all three message files, matching the existing `reviews.source` wording.

**Topic taxonomy — reconciliation (data, not stack).**
- The live `production` dataset already carried **Dalibor's own 14-topic taxonomy** (ids `t-<slug>`), hand-built in the hosted Studio after the 2.01b snapshot. Rather than import a parallel `topic-<slug>` set, the importer **maps** the packet's topic slugs onto his `t-*` ids and creates only two missing concepts (`t-essay`, `t-society-politics`). Operator decision (Lazar, 2026-07-03): `women-and-gender` → existing `t-womens-writing`. Dataset ends at **16 topics** (his 14 + the 2 new), not the packet's 13. Recorded so future phases don't expect a 13-topic count.

**Reviews list — used-topic chip filter.**
- The Reviews list page now filters its topic chips to only topics referenced by reviews (mirrors the existing Blog list behavior), preventing dead chips now the taxonomy is broader than the content. Behavioural change only; no config.

**No deploy / no Vercel env / no dependency / no `npm audit` change.**
