# file-map.md

> **Location in repo:** `src/_project-state/file-map.md`
> A live map of every meaningful file in the repo, each with a one-line description.

**How Claude Code maintains this:**
- At the end of every phase, add a row for each new file created and update the description of any file whose purpose changed.
- Remove rows for deleted files.
- Group rows by area (config, app/pages, i18n, components, lib, messages, sanity, styles, project-state, docs). Keep descriptions to one line.
- This file is the fast way for any Claude to understand the repo without reading all the code.

> _Excludes the generated/ignored trees `node_modules/` and `.next/`. Status: end of Phase 1.05._

### Root config
| File | Description |
|---|---|
| `package.json` | Manifest — deps (next, react, next-intl, **sanity, next-sanity, @sanity/vision, @sanity/image-url, styled-components**) + scripts (`dev`/`build` use `--webpack`; **`typegen`** = schema extract + generate). |
| `package-lock.json` | npm lockfile (exact installed tree). |
| `next.config.ts` | Next.js config, wrapped with `createNextIntlPlugin('./src/i18n/request.ts')`. |
| `tsconfig.json` | TS config; `@/*` → `./src/*`; includes root `*.ts` (so `sanity.config.ts`/`sanity.cli.ts` are checked). |
| `next-env.d.ts` | Next.js ambient types (generated; gitignored). |
| `eslint.config.mjs` | ESLint 9 flat config; **ignores generated `src/sanity/sanity.types.ts` + `sanity/seed/**`**. |
| `postcss.config.mjs` | PostCSS loading `@tailwindcss/postcss` (Tailwind v4). |
| `.gitignore` | Ignores `node_modules`, `.next`, `.env*` (**with `!.env.example` exception**), the local dossier, etc. |
| `.env.local` | Local env — real Sanity project id/dataset/apiVersion. **Gitignored, never committed.** |
| `.env.example` | **Committed** env template (empty values; no secrets). |
| `sanity.config.ts` | **Embedded Studio config** — basePath `/studio`, schema, `structureTool`+structure (singletons), `visionTool`, singleton action/template restrictions. |
| `sanity.cli.ts` | **Sanity CLI config** — `api` (projectId/dataset) + `typegen` (paths). |
| `schema.json` | **Generated** — extracted schema for TypeGen. |
| `.claude/launch.json` | Preview-tool launch config (`prod` → `npm start`, autoPort). |
| `README.md` | Project intro + how to run. |
| `AGENTS.md` / `CLAUDE.md` | Agent guidance ("Next.js 16 has breaking changes — read local docs"). |

### App / pages — `src/app/`
| File | Description |
|---|---|
| `src/app/[locale]/layout.tsx` | Root layout for all locales: fonts, tokens, `<html lang>`, `generateStaticParams`, `setRequestLocale`, provider, TEMP top bar (→ 1.06). |
| `src/app/[locale]/page.tsx` | Placeholder Home — resolves per-locale UI strings (real Home → 1.07). |
| `src/app/[locale]/reviews/page.tsx` | **TEMP 1.05 proof** — lists review titles from Sanity (+ cover/no-image + "available in"). |
| `src/app/[locale]/blog/page.tsx` | **TEMP 1.05 proof** — lists post titles from Sanity. |
| `src/app/[locale]/about/page.tsx` | **TEMP 1.05 proof** — reads the `author` singleton. |
| `src/app/[locale]/book/page.tsx` | **TEMP 1.05 proof** — reads the `book` singleton (+ cover). |
| `src/app/studio/layout.tsx` | **Second root layout** — `<html>`/`<body>` for the non-localized Studio branch. |
| `src/app/studio/[[...tool]]/page.tsx` | `/studio` route (server) — metadata/viewport (`robots:noindex`) + `force-static`. |
| `src/app/studio/[[...tool]]/Studio.tsx` | `'use client'` wrapper rendering `<NextStudio config>` (imports `sanity.config`). |
| `src/app/globals.css` | Global stylesheet — Tailwind v4 import + Style A `@theme` tokens. |
| `src/app/favicon.ico` | Default favicon. |

### i18n — `src/i18n/`
| File | Description |
|---|---|
| `src/i18n/routing.ts` | `defineRouting` — locales mk/en/sr, default mk, `localePrefix:'always'`, `localeDetection:false`. |
| `src/i18n/navigation.ts` | `createNavigation(routing)` → `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`. |
| `src/i18n/request.ts` | `getRequestConfig` — validates locale, loads `../messages/${locale}.json`. |

### Routing / types — `src/`
| File | Description |
|---|---|
| `src/proxy.ts` | next-intl `createMiddleware` as the Next 16 Proxy + matcher (**excludes `/studio`**). |
| `src/global.d.ts` | next-intl `AppConfig` augmentation (`Locale` + `Messages`). |

### Sanity — `src/sanity/`
| File | Description |
|---|---|
| `src/sanity/env.ts` | Reads + validates the public Sanity env vars. |
| `src/sanity/structure.ts` | Studio desk structure; `book` + `author` singletons (pinned documentId). |
| `src/sanity/sanity.types.ts` | **Generated** TypeGen output — schema types + 4 query result types + `@sanity/client` fetch augmentation. |
| `src/sanity/schemaTypes/index.ts` | Schema registry (array of all types). |
| `src/sanity/schemaTypes/slug.ts` | ASCII slug field + Cyrillic (mk/sr) transliteration + `slugify`. |
| `src/sanity/schemaTypes/localized.ts` | `localizedString`/`Text`/`BlockContent` ({mk,en,sr}) + reusable `localizedImage` (hotspot + required alt) + `requireMk`. |
| `src/sanity/schemaTypes/blockContent.ts` | Shared Portable Text (normal/h2-h4/quote, bullet/number, strong/em/link). No drop-cap block. |
| `src/sanity/schemaTypes/post.ts` | `post` document. |
| `src/sanity/schemaTypes/review.ts` | `review` document (reviewed-book fields, source, required cover). |
| `src/sanity/schemaTypes/book.ts` | `book` singleton (Dalibor's own book). |
| `src/sanity/schemaTypes/author.ts` | `author` singleton (profile/bio). |
| `src/sanity/schemaTypes/topic.ts` | `topic` taxonomy. |
| `src/sanity/lib/client.ts` | Public read client (published perspective, `useCdn`, no token). |
| `src/sanity/lib/image.ts` | `@sanity/image-url` builder (`urlForImage`). |
| `src/sanity/lib/queries.ts` | Four typed `defineQuery` queries (reviews, posts, book, author). |
| `src/sanity/lib/localize.ts` | `localizedValue(field, locale)` (mk→en→sr) + `availableLanguages(field)`. |

### CMS seed — `sanity/`
| File | Description |
|---|---|
| `sanity/seed/build-seed.mjs` | Generator — emits the placeholder cover PNG + `seed.ndjson`. |
| `sanity/seed/seed.ndjson` | **Generated** — 13 `[PLACEHOLDER]` documents (3 posts, 4 reviews incl. 1 MK-only, book, author, 4 topics). |
| `sanity/seed/placeholder-cover.png` | **Generated** — clearly-marked 2:3 placeholder cover. |

### Components — `src/components/`
| File | Description |
|---|---|
| `src/components/language-switcher.tsx` | Accessible MK·EN·SR inline switcher (design §6.4); preserves the current path. |
| `src/components/.gitkeep` | Original folder placeholder. |

### lib / messages / styles — `src/`
| File | Description |
|---|---|
| `src/lib/.gitkeep` | Reserved for non-Sanity helpers (search, embeddings…). |
| `src/messages/{en,mk,sr}.json` | UI strings — identical 20-key structure (mk Cyrillic; en/sr Latin). |
| `src/messages/.gitkeep`, `src/styles/.gitkeep` | Folder placeholders. |

### Static assets — `public/`
| File | Description |
|---|---|
| `public/*.svg` | Default create-next-app SVGs (placeholders). |

### Project-state — `src/_project-state/`
| File | Description |
|---|---|
| `current-state.md` | Live snapshot (end of 1.05). |
| `file-map.md` | This file. |
| `00_stack-and-config.md` | Append-only stack/config log (1.02 → 1.05). |
| `Part-X-Phase-YY-Completion.md` | Blank completion-report template. |
| `Part-1-Phase-02-Completion.md` … `Part-1-Phase-05-Completion.md` | Per-phase completion reports. |

### Design handovers + mockups — `docs/`
| File | Description |
|---|---|
| `docs/design-handovers/Part-1-Phase-03-Handover.md` | Style A "Hardcover" spec — source of truth for visuals. |
| `docs/design-handovers/mockups/*.html` | Static mockups (home, reviews-list, single-review, components) + README. |

### Planning docs (repo root)
| File | Description |
|---|---|
| `Dalibor-Website-Plan.md` | Master spec for the finished site. |
| `Dalibor-Website-Phase-Plan.md` | Living index of phases + critical path. |
| `Dalibor-Website-Decisions.md` | Append-only decisions log (Chat). |
| `compass_artifact_…md` | Phase 1.01 research dossier. **Local-only — gitignored.** |

### Generated / ignored (not tracked or auto-built)
| Path | Description |
|---|---|
| `node_modules/` | Installed dependencies. |
| `.next/` | Next.js build output. |
