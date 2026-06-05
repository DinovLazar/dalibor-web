# file-map.md

> **Location in repo:** `src/_project-state/file-map.md`
> A live map of every meaningful file in the repo, each with a one-line description.

**How Claude Code maintains this:**
- At the end of every phase, add a row for each new file created and update the description of any file whose purpose changed.
- Remove rows for deleted files.
- Group rows by area (config, app/pages, components, lib, messages, sanity, styles, project-state). Keep descriptions to one line.
- This file is the fast way for any Claude to understand the repo without reading all the code.

> _Excludes the generated/ignored trees `node_modules/` and `.next/`. Status: end of Phase 1.02._

### Root config
| File | Description |
|---|---|
| `package.json` | Project manifest — dependencies + scripts (`dev`/`build` use `--webpack`; see stack log). |
| `package-lock.json` | npm lockfile (the exact installed dependency tree). |
| `next.config.ts` | Next.js configuration (default/empty for now). |
| `tsconfig.json` | TypeScript config; defines the `@/*` → `./src/*` import alias. |
| `next-env.d.ts` | Next.js ambient TS types (generated; gitignored). |
| `eslint.config.mjs` | ESLint 9 flat config (extends `eslint-config-next`). |
| `postcss.config.mjs` | PostCSS config loading `@tailwindcss/postcss` (Tailwind v4). |
| `.gitignore` | Ignored paths: `node_modules`, `.next`, `.env*`, the local research dossier, etc. |
| `.env.local` | Local secret env vars — empty placeholder; **gitignored, never committed**. |
| `README.md` | Project intro: what the site is, the stack, and how to run it. |
| `AGENTS.md` | create-next-app agent guidance ("Next.js 16 has breaking changes — read local docs"). |
| `CLAUDE.md` | Imports `AGENTS.md` (guidance surfaced to Claude Code). |

### App / pages — `src/app/`
| File | Description |
|---|---|
| `src/app/layout.tsx` | Root layout (default scaffold: Geist fonts, `lang="en"`). Reworked in 1.03/1.04. |
| `src/app/page.tsx` | Default create-next-app home page (placeholder until 1.07). |
| `src/app/globals.css` | Global styles + Tailwind v4 import (`@import "tailwindcss"`). Default scaffold. |
| `src/app/favicon.ico` | Default favicon (placeholder). |

### Components / lib / messages / styles — `src/`
| File | Description |
|---|---|
| `src/components/.gitkeep` | Reserved for shared UI (header, footer, cards, search…). Built starting 1.06. |
| `src/lib/.gitkeep` | Reserved for helpers (Sanity client, search, embeddings…). |
| `src/messages/.gitkeep` | Reserved for next-intl UI strings (`mk.json`/`en.json`/`sr.json`). Filled in 1.04. |
| `src/styles/.gitkeep` | Reserved for future custom CSS beyond `globals.css`. |

### CMS — `sanity/`
| File | Description |
|---|---|
| `sanity/.gitkeep` | Reserved for Sanity Studio config. Stood up in 1.05. |

### Static assets — `public/`
| File | Description |
|---|---|
| `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Default create-next-app SVGs (placeholders). |

### Project-state — `src/_project-state/`
| File | Description |
|---|---|
| `current-state.md` | Live snapshot of the repo; updated at the end of every phase. |
| `file-map.md` | This file — one-line description of every file/folder. |
| `00_stack-and-config.md` | Append-only log of stack/config decisions + pinned versions. |
| `Part-X-Phase-YY-Completion.md` | Blank completion-report template (copied + filled per phase). |
| `Part-1-Phase-02-Completion.md` | Completion report for this phase (1.02). |

### Reserved docs — `docs/`
| File | Description |
|---|---|
| `docs/design-handovers/.gitkeep` | Reserved — Design-phase handovers land here (first one in 1.03). |

### Planning docs (repo root)
| File | Description |
|---|---|
| `Dalibor-Website-Plan.md` | Master spec for the finished site (the aspirational target). |
| `Dalibor-Website-Phase-Plan.md` | Living index of every phase + critical path/dependencies. |
| `Dalibor-Website-Decisions.md` | Append-only log of decisions made in Chat. |
| `compass_artifact_…text_markdown.md` | Phase 1.01 research dossier on Dalibor. **Local-only — gitignored**, not committed. |

### Generated / ignored (auto-built; not tracked in git)
| Path | Description |
|---|---|
| `node_modules/` | Installed dependencies. |
| `.next/` | Next.js build output. |
