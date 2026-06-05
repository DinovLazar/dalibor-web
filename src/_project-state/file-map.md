# file-map.md

> **Location in repo:** `src/_project-state/file-map.md`
> A live map of every meaningful file in the repo, each with a one-line description.

**How Claude Code maintains this:**
- At the end of every phase, add a row for each new file created and update the description of any file whose purpose changed.
- Remove rows for deleted files.
- Group rows by area (config, app/pages, i18n, components, lib, messages, sanity, styles, project-state, docs). Keep descriptions to one line.
- This file is the fast way for any Claude to understand the repo without reading all the code.

> _Excludes the generated/ignored trees `node_modules/` and `.next/`. Status: end of Phase 1.04._

### Root config
| File | Description |
|---|---|
| `package.json` | Project manifest — deps (`next`, `react`, `react-dom`, **`next-intl ^4.13.0`**) + scripts (`dev`/`build` use `--webpack`; see stack log). |
| `package-lock.json` | npm lockfile (the exact installed dependency tree). |
| `next.config.ts` | Next.js config, **wrapped with `createNextIntlPlugin('./src/i18n/request.ts')`** (preserves the existing config). |
| `tsconfig.json` | TypeScript config; defines the `@/*` → `./src/*` import alias. |
| `next-env.d.ts` | Next.js ambient TS types (generated; gitignored). |
| `eslint.config.mjs` | ESLint 9 flat config (extends `eslint-config-next`). |
| `postcss.config.mjs` | PostCSS config loading `@tailwindcss/postcss` (Tailwind v4). |
| `.gitignore` | Ignored paths: `node_modules`, `.next`, `.env*`, the local research dossier, etc. |
| `.env.local` | Local secret env vars — empty placeholder; **gitignored, never committed**. |
| `.claude/launch.json` | Preview-tool launch config (`prod` → `npm start`, autoPort) used for screenshots/inspection. |
| `README.md` | Project intro: what the site is, the stack, and how to run it. |
| `AGENTS.md` | Agent guidance ("Next.js 16 has breaking changes — read local docs"). |
| `CLAUDE.md` | Imports `AGENTS.md` (guidance surfaced to Claude Code). |

### App / pages — `src/app/`
| File | Description |
|---|---|
| `src/app/[locale]/layout.tsx` | **Root layout** for all locales: loads Playfair+Lora, applies tokens, sets `<html lang>`, `generateStaticParams`, `setRequestLocale`, `NextIntlClientProvider`, + a TEMPORARY top bar mounting the switcher (replaced in 1.06). |
| `src/app/[locale]/page.tsx` | Minimal placeholder Home — resolves per-locale UI strings (real Home is 1.07). |
| `src/app/globals.css` | Global stylesheet — Tailwind v4 import + the Style A `@theme` design tokens (1.03 Appendix A). No dark mode. |
| `src/app/favicon.ico` | Default favicon (placeholder). |

### i18n — `src/i18n/`
| File | Description |
|---|---|
| `src/i18n/routing.ts` | `defineRouting` — locales `mk`/`en`/`sr`, default `mk`, `localePrefix:'always'`, `localeDetection:false`. Single routing source of truth. |
| `src/i18n/navigation.ts` | `createNavigation(routing)` → `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` (use these for all internal locale routes). |
| `src/i18n/request.ts` | `getRequestConfig` — validates the request locale (`hasLocale`) and loads `../messages/${locale}.json`. |

### Routing / types — `src/`
| File | Description |
|---|---|
| `src/proxy.ts` | next-intl `createMiddleware(routing)` mounted as the Next 16 **Proxy** (renamed Middleware) + path matcher. Handles `/` → `/mk` and locale routing. |
| `src/global.d.ts` | next-intl `AppConfig` augmentation — strict `Locale` + `Messages` types for checked `t()` keys. |

### Components — `src/components/`
| File | Description |
|---|---|
| `src/components/language-switcher.tsx` | Accessible, reusable MK·EN·SR inline switcher (design §6.4); preserves the current path. |
| `src/components/.gitkeep` | Original folder placeholder (folder now populated; more shared UI from 1.06). |

### lib / messages / styles — `src/`
| File | Description |
|---|---|
| `src/lib/.gitkeep` | Reserved for helpers (Sanity client, search, embeddings…). |
| `src/messages/en.json` | English UI strings (canonical key set; 20 keys). |
| `src/messages/mk.json` | Macedonian (Cyrillic) UI strings — same structure as `en.json`. |
| `src/messages/sr.json` | Serbian (Latin) UI strings — same structure as `en.json`. |
| `src/messages/.gitkeep` | Original folder placeholder (folder now populated). |
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
| `Part-1-Phase-02-Completion.md` | Completion report for 1.02 (scaffolding). |
| `Part-1-Phase-03-Completion.md` | Completion report for 1.03 (design system). |
| `Part-1-Phase-04-Completion.md` | Completion report for 1.04 (languages + routing foundation). |

### Design handovers + mockups — `docs/`
| File | Description |
|---|---|
| `docs/design-handovers/.gitkeep` | Folder placeholder (Design-phase handovers land here). |
| `docs/design-handovers/Part-1-Phase-03-Handover.md` | Style A "Hardcover" spec — tokens, type scale, components, all 10 page layouts, a11y. **Source of truth for visuals.** |
| `docs/design-handovers/mockups/README.md` | Notes on the four HTML mockups. |
| `docs/design-handovers/mockups/home.html` | Static mockup — Home. |
| `docs/design-handovers/mockups/reviews-list.html` | Static mockup — Reviews list. |
| `docs/design-handovers/mockups/single-review.html` | Static mockup — single review (incl. Cyrillic drop cap). |
| `docs/design-handovers/mockups/components.html` | Static mockup — component gallery. |

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
