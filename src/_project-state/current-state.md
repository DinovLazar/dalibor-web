# current-state.md

> **Location in repo:** `src/_project-state/current-state.md`
> A live snapshot of the repo. **Claude Code updates this at the end of every phase.** It reflects what actually exists — if it ever disagrees with the Plan, this file (and the live code) wins.

**Last updated:** 2026-06-06 — Phase 1.03 design handover filed (Design phase; `src/` app code unchanged)

**Project:** Dalibor Plečić personal website — a trilingual (Macedonian default / English / Serbian), literary "well-made hardcover book" site consolidating his book reviews, blog, his own book, and an About page.

---

## Phase status
- **1.01 — Deep research on Dalibor Plečić:** ✅ complete. Dossier held by Lazar as `Dalibor-Research.md`. (A copy sits in the working folder as `compass_artifact_…text_markdown.md`, kept **local-only / gitignored** — not published to the public repo, as it aggregates personal data.)
- **1.02 — Project scaffolding:** ✅ complete.
- **1.03 — Design system & visual direction:** ✅ complete (Design phase). Handover at `docs/design-handovers/Part-1-Phase-03-Handover.md` (Style A "Hardcover" — tokens, type scale, components, all 10 page layouts, a11y) + four HTML mockups in `docs/design-handovers/mockups/`. Report: `Part-1-Phase-03-Completion.md`. **No `src/` app code changed** — Code applies the `@theme` tokens + `next/font` in 1.04.
- **Next → 1.04 — i18n + layout foundation** (next-intl `[locale]` shell, load Playfair+Lora, apply the design tokens to `globals.css`, build header/footer/language switcher).

## Tech stack (current)
*Locked plan: Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Lucide · Framer Motion · next-intl · Sanity · Formspree · Vercel AI SDK + Voyage + Supabase (pgvector) · Vercel · Playfair Display + Lora.*

**Installed now (base only):** Next.js 16.2.7 · React 19.2.4 · TypeScript 5.9.3 · Tailwind CSS 4.3.0 · ESLint 9. Everything else is added in its own later phase. Exact pinned versions + config notes live in `00_stack-and-config.md`.

## What exists now
- Base **Next.js (App Router) + TypeScript + Tailwind CSS + ESLint** scaffold, in a `src/` directory with the `@/*` import alias.
- The default create-next-app home page (`src/app/page.tsx`, `layout.tsx`, `globals.css`) — left **untouched**; the `[locale]` restructure and the Style A design come in 1.03/1.04.
- Folder tree per the Plan: reserved `docs/design-handovers/` and `src/_project-state/`; structural `src/components/`, `src/lib/`, `src/messages/`, `src/styles/`, and `sanity/` (empty ones tracked with `.gitkeep`).
- Project-state docs in `src/_project-state/`: this file, `file-map.md`, `00_stack-and-config.md`, the blank `Part-X-Phase-YY-Completion.md` template, and the filled `Part-1-Phase-02-Completion.md`.
- `.env.local` (empty, gitignored), a project `README.md`, and the planning docs at the repo root.
- Builds, lints, and runs locally (see below). First git commit made.

## Pages built
- None bespoke yet — only the default scaffold home page plus the framework's `/_not-found`.

## Components built
- None yet (`src/components/` is empty).

## Integrations wired
- None yet (next-intl, Sanity, Formspree, AI search are all later phases).

## How to run it locally
```bash
npm install      # first time only
npm run dev      # then open http://localhost:3000
```
Other scripts: `npm run build`, `npm run lint`, `npm start`.
> Note: `dev`/`build` use `--webpack` because this machine's Application Control policy blocks Next's native SWC binding (Turbopack requires it). Details in `00_stack-and-config.md`.

## Open carryover items
- **Webpack flag:** `dev`/`build` pinned to `--webpack` for the local platform; can be revisited for Vercel if Turbopack is wanted.
- **2 moderate npm audit findings** (transitive `postcss` bundled inside `next`); not fixable without downgrading Next — left for an upstream bump.
- Default scaffold home page + the dark-mode CSS block in `globals.css` get replaced during the design/layout phases (Decision #14: no dark mode in v1).

## Known issues
- None blocking. (Native SWC binding is blocked locally → WASM + Webpack fallback in use; build, lint and dev all pass.)
