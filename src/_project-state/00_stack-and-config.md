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
