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
