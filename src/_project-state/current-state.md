# current-state.md

> **Location in repo:** `src/_project-state/current-state.md`
> A live snapshot of the repo. **Claude Code updates this at the end of every phase.** It reflects what actually exists — if it ever disagrees with the Plan, this file (and the live code) wins.

**Last updated:** 2026-06-06 — Phase 1.04 complete (next-intl trilingual routing + fonts + design tokens)

**Project:** Dalibor Plečić personal website — a trilingual (Macedonian default / English / Serbian), literary "well-made hardcover book" site consolidating his book reviews, blog, his own book, and an About page.

---

## Phase status
- **1.01 — Deep research on Dalibor Plečić:** ✅ complete. Dossier held by Lazar as `Dalibor-Research.md` (local-only / gitignored copy in the working folder).
- **1.02 — Project scaffolding:** ✅ complete.
- **1.03 — Design system & visual direction:** ✅ complete (Design phase). Handover + four HTML mockups in `docs/design-handovers/`. The `@theme` tokens + `next/font` were left for Code to apply — **done in 1.04**.
- **1.04 — Languages + Routing Foundation:** ✅ complete. next-intl v4 `[locale]` shell for `mk`/`en`/`sr`, root → `/mk`, language switcher, Playfair Display + Lora via `next/font`, Style A design tokens applied to `globals.css`, trilingual UI strings. Report: `Part-1-Phase-04-Completion.md`.
- **Next → 1.05** — Sanity CMS stand-up / content modeling (per the Phase Plan; Sanity pinned at 1.05).

## Tech stack (current)
*Locked plan: Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Lucide · Framer Motion · next-intl · Sanity · Formspree · Vercel AI SDK + Voyage + Supabase (pgvector) · Vercel · Playfair Display + Lora.*

**Installed now:** Next.js 16.2.7 · React 19.2.4 · TypeScript 5.9.3 · Tailwind CSS 4.3.0 · ESLint 9 · **next-intl 4.13.0**. Everything else is added in its own later phase. Exact pinned versions + config notes live in `00_stack-and-config.md`.

## What exists now
- **Trilingual App Router shell** under `src/app/[locale]/` (mk/en/sr). `src/app/[locale]/layout.tsx` is the root layout (renders `<html lang>`/`<body>`, loads fonts, applies tokens, mounts a **temporary** top bar with the switcher). The default create-next-app `layout.tsx`/`page.tsx` are **deleted**.
- **i18n layer** in `src/i18n/` (`routing.ts`, `navigation.ts`, `request.ts`) + the **proxy** at `src/proxy.ts` (Next 16's renamed Middleware). Root → `/mk`; no browser-language detection; unknown locale → 404.
- **Fonts**: Playfair Display + Lora via `next/font/google` (latin + cyrillic), self-hosted, wired to `--font-playfair`/`--font-lora`.
- **Design tokens**: handover Appendix A `@theme` block in `src/app/globals.css`. **No dark mode** (Decision #14 — the scaffold dark-mode block was removed).
- **Language switcher** (`src/components/language-switcher.tsx`) — accessible MK·EN·SR, preserves the current path.
- **UI strings**: `src/messages/{en,mk,sr}.json`, identical 20-key structure (mk Cyrillic; en/sr Latin). Values are **provisional — to review with Dalibor.**
- **Typed i18n config**: `src/global.d.ts` (`AppConfig` Locale + Messages).
- Base scaffold otherwise intact (`@/*` alias, Tailwind v4 CSS-first, ESLint 9 flat config). Builds, lints, and runs locally.

## Pages built
- **Placeholder Home** per locale (`/mk`, `/en`, `/sr`) — minimal, proves per-locale string resolution; the real Home is 1.07. Plus the framework's `/_not-found`.

## Components built
- **`language-switcher.tsx`** — accessible, reusable MK·EN·SR toggle (design §6.4). (The styled header/footer/nav are 1.06.)

## Integrations wired
- **next-intl** (routing, proxy, request config, navigation helpers). Sanity, Formspree, AI search are later phases.

## How to run it locally
```bash
npm install      # first time only
npm run dev      # then open http://localhost:3000  (redirects to /mk)
```
Other scripts: `npm run build`, `npm run lint`, `npm start`.
> Note: `dev`/`build` use `--webpack` because this machine's Application Control policy blocks Next's native SWC binding (Turbopack requires it). Details in `00_stack-and-config.md`.
> Preview tool: `.claude/launch.json` (config name `prod`) starts `npm start` for screenshots/inspection.

## Open carryover items
- **Webpack flag:** `dev`/`build` pinned to `--webpack` for the local platform; can be revisited for Vercel if Turbopack is wanted.
- **UI string values are provisional** — review with Dalibor. Open question: **критика/kritika vs рецензија/recenzija** for "reviews" (the 1.04 brief table used Критики/Kritike; the 1.03 mockups used Рецензии/Рецензије). Also `home.title` and `nav.about` wording.
- **2 moderate npm audit findings** (transitive `postcss` inside `next`); unchanged; await an upstream Next bump.
- **Styled header/footer/nav + shadcn/ui** → 1.06; real Home → 1.07; SEO/metadata/hreflang/sitemap → 1.12.

## Known issues
- None blocking. (Native SWC binding blocked locally → WASM + Webpack fallback; build, lint, dev, and `next start` all pass. After deleting route files, clear `.next` to drop stale generated types.)
