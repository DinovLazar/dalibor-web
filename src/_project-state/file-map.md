# file-map.md

> **Location in repo:** `src/_project-state/file-map.md`
> A live map of every meaningful file in the repo, each with a one-line description.

**How Claude Code maintains this:**
- At the end of every phase, add a row for each new file created and update the description of any file whose purpose changed.
- Remove rows for deleted files.
- Group rows by area (config, app/pages, i18n, components, lib, messages, sanity, styles, project-state, docs). Keep descriptions to one line.
- This file is the fast way for any Claude to understand the repo without reading all the code.

> _Excludes the generated/ignored trees `node_modules/` and `.next/`. Status: end of Phase 2.01e (Dalibor's portrait uploaded to `author.photo`; App-Router icon.png/apple-icon.png replace the default favicon; scaffold SVGs removed)._

### Root config
| File | Description |
|---|---|
| `package.json` | Manifest — deps (next, react, next-intl, sanity+toolchain, @base-ui/react, lucide-react, framer-motion, class-variance-authority, clsx, tailwind-merge, tw-animate-css, @portabletext/react, **ai, voyage-ai-provider, @supabase/supabase-js, server-only (1.09)**; `shadcn` + **`tsx` (2.03, for the `.mts` scripts)** in devDeps) + scripts (`dev`/`build` use `--webpack`; `typegen` = schema extract + generate; **(2.03) `embed:reviews` backfill + `test:semantic` ranking test, both run via `node --conditions=react-server --import tsx --env-file=.env.local`**). |
| `components.json` | **New (1.06).** shadcn/ui config — `base-nova` (Base UI) style, css → `globals.css`, aliases (`@/components`, `@/lib/utils`, `@/components/ui`). |
| `package-lock.json` | npm lockfile (exact installed tree). |
| `next.config.ts` | Next.js config, wrapped with `createNextIntlPlugin('./src/i18n/request.ts')`; **(1.07)** `images.remotePatterns` allows `cdn.sanity.io/images/ndqmaath/**` for `next/image`. |
| `tsconfig.json` | TS config; `@/*` → `./src/*`; includes root `*.ts` (so `sanity.config.ts`/`sanity.cli.ts` are checked). |
| `next-env.d.ts` | Next.js ambient types (generated; gitignored). |
| `eslint.config.mjs` | ESLint 9 flat config; **ignores generated `src/sanity/sanity.types.ts` + `sanity/seed/**` + (2.01b) `dist/**`** (the 2.04 hosted-Studio build artifact — linting its minified bundles OOM'd ESLint). |
| `package.json` (2.01b) | + `import:content` script → `scripts/import-content.mts` (same `node --conditions=react-server --import tsx --env-file=.env.local` pattern). **(2.01e)** + `import:assets` → `scripts/import-assets.mts` (same runner) + `make:favicon` → `scripts/make-favicon.mts` (`node --import tsx`); **`sharp@0.34.5` pinned in devDeps** (favicon generation only — not shipped). |
| `content-packet/` | `intake/Dalibor-Intake-Answers-MK.md` (verbatim MK bio §1 + book description §2 source) + `README.md`. **(2.01c)** + `topics.json` (13), `reviews.json` (20), `posts.json` (1) — the launch packet (copyright-safe: no body/excerpt). Read by `import-content.mts` via `readFileSync`+`JSON.parse` (no xlsx parser). `topics.json` is the canonical intended taxonomy + drives the importer's map-sync guard; the actual topic upsert **reconciles** onto Dalibor's live `t-*` taxonomy (see README). **(2.01e — now tracked)** + `assets/` — Cowork's image packet: `assets.json` manifest + `README.md` + `author/portrait.jpg` (720² interim author portrait) + `author/avatar-square.jpg` (512² favicon source crop). Read by `import-assets.mts`. Book cover HELD (no file); reviewed-book/blog/banner arrays empty. |
| `postcss.config.mjs` | PostCSS loading `@tailwindcss/postcss` (Tailwind v4). |
| `.gitignore` | Ignores `node_modules`, `.next`, `.env*` (**with `!.env.example` exception**), the local dossier, etc. |
| `.env.local` | Local env — real Sanity project id/dataset/apiVersion + **(2.02)** the live `NEXT_PUBLIC_FORMSPREE_ENDPOINT` + **(2.03)** the live search keys (`VOYAGE_API_KEY`/`VOYAGE_MODEL`/`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/`SANITY_WEBHOOK_SECRET`). **Gitignored, never committed.** |
| `.env.example` | **Committed** env template (no real secrets) — Sanity vars + **(1.09→2.03) review-search vars** (`VOYAGE_API_KEY`/`VOYAGE_MODEL`/`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/`SANITY_WEBHOOK_SECRET`, now documented **REQUIRED** for semantic search + auto-reindex; absent ⇒ keyword fallback) + **(1.11→2.02)** `NEXT_PUBLIC_FORMSPREE_ENDPOINT` (placeholder value + comment; real endpoint in `.env.local`, set on Vercel at deploy) + **(2.05)** `NEXT_PUBLIC_SITE_URL` (now flagged REQUIRED on Vercel) + new `PREVIEW_NOINDEX` (server-side noindex gate). |
| `sanity.config.ts` | **Embedded Studio config** — basePath `/studio`, schema, `structureTool`+structure (singletons), `visionTool`, singleton action/template restrictions. |
| `sanity.cli.ts` | **Sanity CLI config** — `api` (projectId/dataset) + `typegen` (paths) + **(2.04) `deployment.appId`** (pins the hosted Studio app `daliborplecic.sanity.studio` so deploys are non-interactive). |
| `schema.json` | **Generated** — extracted schema for TypeGen. |
| `.claude/launch.json` | Preview-tool launch config (`prod` → `npm start`, autoPort). |
| `README.md` | Project intro + how to run. |
| `AGENTS.md` / `CLAUDE.md` | Agent guidance ("Next.js 16 has breaking changes — read local docs"). |

### App / pages — `src/app/`
| File | Description |
|---|---|
| `src/app/[locale]/layout.tsx` | Root layout for all locales: fonts, tokens, `<html lang>`, `generateStaticParams`, `setRequestLocale`, provider; **mounts SkipToContent → SiteHeader → `<main id="content">` → SiteFooter** (1.06). **(1.12)** `generateMetadata` sets `metadataBase` (env base), the `%s — siteName` title template + default title/description, and default OG/Twitter. **(2.05)** emits a site-wide `robots: { index:false, follow:false }` when `previewNoindex` is on (inherited by every child page — no page sets `robots`). |
| `src/app/sitemap.ts` | **(1.12)** Native `MetadataRoute.Sitemap` — every static route × 3 locales + every review/blog slug × 3, each carrying mk/en/sr + `x-default` hreflang alternates; uses the env base URL. |
| `src/app/robots.ts` | **(1.12)** `MetadataRoute.Robots` — allow all, disallow `/studio` + `/api`, points at `/sitemap.xml`, declares host (env base). **(2.05)** when `previewNoindex` is on, flips to a blanket `Disallow: /` (no sitemap/host) so a validation deploy can't be crawled. |
| `src/app/[locale]/opengraph-image.tsx` | **(1.12)** Default branded OG card via `next/og` `ImageResponse` (Style A wordmark + caramel rule + localized role line; no photography). Loads bundled static subset fonts (full Latin/Latin-ext/Cyrillic coverage via a font stack); `generateStaticParams` → one 1200×630 card per locale. |
| `src/app/[locale]/twitter-image.tsx` | **(1.12)** Twitter share card — re-exports the `opengraph-image` generator (single source of truth). |
| `src/app/[locale]/not-found.tsx` | **(1.12)** Localized, accessible 404 in Style A chrome (`notFound` namespace); emits a `noindex` robots tag (+ HTTP 404). |
| `src/app/[locale]/page.tsx` | **Real Style A Home (1.07)** — fetches the 4 `HOME_*` queries and composes Hero / Featured book / Latest reviews / From the blog (server, localized). **(1.12)** `generateMetadata` (absolute title) + `Person` JSON-LD. |
| `src/app/[locale]/contact/page.tsx` | **Real Style A Contact (1.11)** — `PageHeader` (title+intro) + two-column (`ContactForm` left, `ContactLinks` right; form-first on mobile). **(1.12)** `generateMetadata` via `buildPageMetadata`. Static (`●`). |
| `src/app/[locale]/privacy/page.tsx` | **Real Style A Privacy (1.11)** — `<h1>` + §6.16 double rule + lede + six `<h2>`/`<p>` sections in `max-w-prose`. **(1.12)** `generateMetadata` via `buildPageMetadata`. Static (`●`). |
| `src/app/[locale]/reviews/page.tsx` | **Real Style A Reviews list (1.09)** — `REVIEWS_LIST_QUERY` + `TOPICS_QUERY`; Archive header, SSR `?topic=` chip filter, progressively-enhanced `ReviewSearch` over the SSR `ReviewsList`. **(1.12)** `generateMetadata`. Dynamic (`ƒ`). |
| `src/app/[locale]/reviews/[slug]/page.tsx` | **Real Style A single review (1.09)** — `REVIEW_BY_SLUG_QUERY` (`cache()`d, shared w/ metadata); back link/breadcrumb, `<h1>`+double rule, Portable Text body w/ drop cap, sticky `ReviewBookAside`, topic chips; `generateStaticParams`, `notFound()`. **(1.12)** full `generateMetadata` (og:type article) + `Article`+`BreadcrumbList` JSON-LD + `lang` on title/body. |
| `src/app/[locale]/blog/page.tsx` | **Real Style A Blog list (1.10)** — `POSTS_LIST_QUERY` + `TOPICS_QUERY`; Archive header, SSR `?topic=` chip filter (no dead chips), `PostCard` stack, empty state. **No search box.** **(1.12)** `generateMetadata`. Dynamic (`ƒ`). |
| `src/app/[locale]/blog/[slug]/page.tsx` | **Real Style A single post (1.10)** — `POST_BY_SLUG_QUERY` (`cache()`d, shared w/ metadata); back link/breadcrumb, `<h1>`+double rule, Portable Text body w/ drop cap, topic chips; no book aside; `generateStaticParams`, `notFound()`. **(1.12)** full `generateMetadata` (og:type article) + `BlogPosting`+`BreadcrumbList` JSON-LD + `lang` on title/body. |
| `src/app/api/reviews/search/route.ts` | **(1.09)** `POST` search route — the only search surface the browser sees; calls `searchReviews` (semantic→keyword fallback), returns `{mode, results}`, never leaks keys/errors. |
| `src/app/api/reviews/reindex/route.ts` | **(1.09→2.03 LIVE)** `POST` re-index route — `x-webhook-secret`-authenticated (wrong/missing → 401; unconfigured → 503); builds the combined-language text via the shared `review-embedding-text` builder, embeds it, upserts the review's vector row by slug. Proven locally; live Sanity webhook registered by Cowork at the prod URL. |
| `src/app/[locale]/about/page.tsx` | **Real Style A About (1.08)** — `ABOUT_QUERY`; name `<h1>` + roles/tagline, two-column portrait \| bio via Portable Text, quiet Contact link. **(1.12)** `generateMetadata` + `Person` JSON-LD + `lang` on the bio fallback. **(2.01b)** + a quiet education line under the bio + the `<Translations>` block. |
| `src/app/[locale]/book/page.tsx` | **Real Style A Book (1.08)** — `BOOK_QUERY` (React-`cache()`d, shared w/ metadata); title `<h1>` + double rule, `Cover` + credit + publisher·year + purchase buttons, description via Portable Text. **No genre/format** (guard). **(1.12)** `generateMetadata` (title from doc) + `Book` JSON-LD (no genre/format) + `lang` on the description fallback. |
| `src/app/studio/layout.tsx` | **Second root layout** — `<html>`/`<body>` for the non-localized Studio branch. |
| `src/app/studio/[[...tool]]/page.tsx` | `/studio` route (server) — metadata/viewport (`robots:noindex`) + `force-static`. |
| `src/app/studio/[[...tool]]/Studio.tsx` | `'use client'` wrapper rendering `<NextStudio config>` (imports `sanity.config`). |
| `src/app/globals.css` | Global stylesheet — Tailwind v4 + `tw-animate-css` imports + Style A `@theme` tokens **+ shadcn semantic alias tokens (1.06)** + the `.reveal` page-load animation (1.07) **+ (1.12) `scroll-margin-top` on focusable targets/headings (SC 2.4.11 — clear of the sticky header)**. |
| `src/app/icon.png` | **(2.01e)** Browser-tab / general app icon — 512×512 PNG generated from `content-packet/assets/author/avatar-square.jpg`. Next auto-emits `<link rel="icon" href="/icon.png" sizes="512x512">`. Replaces the deleted default `favicon.ico`. |
| `src/app/apple-icon.png` | **(2.01e)** Apple-touch-icon — 180×180 PNG from the same avatar. Next auto-emits `<link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180">`. |

### i18n — `src/i18n/`
| File | Description |
|---|---|
| `src/i18n/routing.ts` | `defineRouting` — locales mk/en/sr, default mk, `localePrefix:'always'`, `localeDetection:false`. |
| `src/i18n/navigation.ts` | `createNavigation(routing)` → `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`. |
| `src/i18n/request.ts` | `getRequestConfig` — validates locale, loads `../messages/${locale}.json`. |

### Routing / types — `src/`
| File | Description |
|---|---|
| `src/proxy.ts` | next-intl `createMiddleware` as the Next 16 Proxy + matcher (**excludes `/studio`** and **(1.12) `/sitemap.xml` + `/robots.txt`** — matcher + in-code guard). |
| `src/global.d.ts` | next-intl `AppConfig` augmentation (`Locale` + `Messages`). |

### Sanity — `src/sanity/`
| File | Description |
|---|---|
| `src/sanity/env.ts` | Reads + validates the public Sanity env vars. **(1.12)** also exports `siteUrl` (`NEXT_PUBLIC_SITE_URL`, optional, localhost fallback, trailing slash stripped) — the base for every canonical/hreflang/OG/sitemap/robots URL. **(2.05)** also exports `previewNoindex` (server-side `PREVIEW_NOINDEX` flag, truthy = `1/true/yes/on`) — gates the site-wide noindex. |
| `src/sanity/structure.ts` | Studio desk structure; `book` + `author` singletons (pinned documentId). |
| `src/sanity/sanity.types.ts` | **Generated** TypeGen output — schema types + **14** query result types (incl. `REVIEWS_LIST_QUERY_RESULT` / `REVIEW_BY_SLUG_QUERY_RESULT` / `TOPICS_QUERY_RESULT`, 1.09; `POSTS_LIST_QUERY_RESULT` / `POST_BY_SLUG_QUERY_RESULT` / `POST_SLUGS_QUERY_RESULT`, 1.10) + `@sanity/client` fetch augmentation. |
| `src/sanity/schemaTypes/index.ts` | Schema registry (array of all types). |
| `src/sanity/schemaTypes/slug.ts` | ASCII slug field + Cyrillic (mk/sr) transliteration + `slugify`. |
| `src/sanity/schemaTypes/source.ts` | **New (2.01c).** Shared `sourceField()` factory (`source {sourceName, sourceUrl}` — the "first published on …" attribution). Used by **both** `review` and `post` so the two can't drift. |
| `src/sanity/schemaTypes/localized.ts` | `localizedString`/`Text`/`BlockContent` ({mk,en,sr}) + reusable `localizedImage` (hotspot + required alt) + `requireMk`. |
| `src/sanity/schemaTypes/blockContent.ts` | Shared Portable Text (normal/h2-h4/quote, bullet/number, strong/em/link). No drop-cap block. |
| `src/sanity/schemaTypes/post.ts` | `post` document. **(2.01c)** + `source` field via the shared `sourceField()` (the "first published on …" attribution; renders on the single-post page). |
| `src/sanity/schemaTypes/review.ts` | `review` document (reviewed-book fields). **(2.01b)** `reviewTitle`/`bookTitle` no longer mk-required (fall back mk→en→sr; slug stays required); `coverImage` now optional; `source {sourceName,sourceUrl}` = the **firstPublished** attribution. **(2.01c)** the inline `source` object was extracted to the shared `sourceField()` — schema output unchanged. |
| `src/sanity/schemaTypes/book.ts` | `book` singleton (Dalibor's own book); **(1.08)** `purchaseLinks[].url` now `.required()`. `genre` field kept but intentionally unseeded/unrendered. |
| `src/sanity/schemaTypes/author.ts` | `author` singleton (profile/bio); **(1.07)** + `tagline` (mk-required) + `heroIntro` for the Home hero. **(2.01b)** + `translations[]` (title/originalAuthor/fromLang/toLang/publisher?/year?/kind; lang codes mk/sr/bg/hr/en/fr) + `education` (localizedString); `email` now shown publicly. |
| `src/sanity/schemaTypes/topic.ts` | `topic` taxonomy. |
| `src/sanity/lib/client.ts` | Public read client (published perspective, `useCdn`, no token). |
| `src/sanity/lib/image.ts` | `@sanity/image-url` builder (`urlForImage`). |
| `src/sanity/lib/queries.ts` | **Fourteen** typed `defineQuery` queries (reviews/blog list+single+slugs, topics, about, book, 4 Home `HOME_*`). **(1.12)** `REVIEW_BY_SLUG_QUERY` + `POST_BY_SLUG_QUERY` also select `_updatedAt` (JSON-LD `dateModified`). **(2.01b)** `ABOUT_QUERY` also selects `education` + `translations[]`. |
| `src/sanity/lib/localize.ts` | `localizedValue(field, locale)` (mk→en→sr) + `availableLanguages(field)` + **(1.09)** `availableInLabel(...)` + `resolveTopics(...)` + **(1.12)** `resolvedLanguage(field, locale)` (which lang resolved) + `contentLang(field, locale)` / `contentLangFromList(langs, locale)` (the `lang` attr value for fallback content — SC 3.1.2). |

### CMS seed — `sanity/`
| File | Description |
|---|---|
| `sanity/seed/build-seed.mjs` | Generator — emits the placeholder cover PNG + `seed.ndjson`; **(1.07)** author has `tagline` + `heroIntro`; MK-only review dated newest; **(1.08)** `author.bio` + `book.description` expanded to 3 `[PLACEHOLDER]` paras each, `book.genre` removed (discrepancy guard); **(1.10)** added a mk+en-only post (dated newest) for the blog "available in" demo. |
| `sanity/seed/seed.ndjson` | **Generated** — 14 `[PLACEHOLDER]` documents (4 posts incl. 1 mk+en-only, 4 reviews incl. 1 MK-only, book, author, 4 topics). |
| `sanity/seed/placeholder-cover.png` | **Generated** — clearly-marked 2:3 placeholder cover. |

### CMS / search migrations — `supabase/`
| File | Description |
|---|---|
| `supabase/migrations/0001_review_embeddings.sql` | **(1.09 written, 2.03 APPLIED)** — `review_embeddings` table (`vector(1024)`), HNSW `vector_cosine_ops` index, RLS enabled, `match_reviews` RPC (cosine `<=>`). Run in the `dalibor-web` Supabase project (ref `wjqgkauzjrgnamacldgx`). |

### Scripts — `scripts/` (Node, run via `tsx`)
| File | Description |
|---|---|
| `scripts/embed-reviews.mts` | **(2.03)** Backfill / full resync — reads every review, builds embedding text via the shared builder, embeds (Voyage `document`), upserts one vector row per review by slug; idempotent (content-hash skip) + orphan-prune; asserts `rows == reviews`. `npm run embed:reviews`. Doubles as the one-shot re-embed after the 2.01 import. |
| `scripts/test-semantic-ranking.mts` | **(2.03)** Content-independent ranking proof — seeds multilingual fixtures (`zfixture-` namespace), asserts meaning-queries retrieve the right snippet incl. a cross-lingual + a no-verbatim-keyword case, tears fixtures down in `finally`. `npm run test:semantic`. |
| `scripts/import-content.mts` | Idempotent content importer — separate write client (`SANITY_WRITE_TOKEN`, read client stays token-less); Zaporožac scrub aborts pre-write; `--dry-run`. **(2.01b)** `createOrReplace` the real **Author + Book singletons + 8 translations** from `content-packet/intake/…` (untouched in 2.01c). **(2.01c)** reads `topics/reviews/posts.json`; **reconciles** review/post topic refs onto Dalibor's live `t-*` taxonomy (map `TOPIC_ID_BY_PACKET_SLUG` + guards) and creates only `t-essay`/`t-society-politics`; upserts reviews+posts **idempotently** (skip-if-unchanged via a system-field-stripped `canonical()`/`sameDoc()` compare → no `_rev` churn on re-run); deletes any leftover `[PLACEHOLDER]` docs (reviews→posts→topics, drafts incl.); prints an integrity report. `npm run import:content`. |
| `scripts/import-assets.mts` | **(2.01e)** Idempotent image importer — reads `content-packet/assets/assets.json`, uploads each `use:true` image (`writeClient.assets.upload`, content-hash id → naturally idempotent) and sets the target `localizedImage` field via **patch** (never `createOrReplace`, so sibling fields survive). **Preserve-if-set:** skips any field that already has an `asset._ref` (a Studio upload is never clobbered) unless `--force`. Same write client / `SANITY_WRITE_TOKEN` / Zaporožac scrub as `import-content.mts`; `--dry-run`; prints a `uploaded/set/skipped/held` tally. Ignores `favicon_source` (handled by `make:favicon`). Fails loudly on a missing file / missing `alt.mk` / unknown docId. `npm run import:assets`. |
| `scripts/make-favicon.mts` | **(2.01e)** Generates `src/app/icon.png` (512²) + `src/app/apple-icon.png` (180²) from `content-packet/assets/author/avatar-square.jpg` via `sharp` (resize + PNG re-encode; the avatar is already a square crop). `npm run make:favicon`. |

### Components — `src/components/`
| File | Description |
|---|---|
| `src/components/ui/button.tsx` | shadcn Button (Base UI) **restyled to Style A §6.1** — default/outline/ghost variants, §2.5-safe (`primary-strong` fills, never caramel-behind-text). |
| `src/components/ui/separator.tsx` | shadcn Separator (Base UI) — hairline; orientation from prop. |
| `src/components/ui/sheet.tsx` | shadcn Sheet (Base UI Dialog) **restyled to Style A**, transition-free (robust mount/unmount); used by the mobile menu. |
| `src/components/ui/input.tsx` | **(1.11)** Style-A text input (§6.12) — hand-rolled native `<input>` (no new dep); 48px, border-strong, focus → caramel border + soft ring, error via `aria-invalid` (colour-only width → no layout shift). |
| `src/components/ui/label.tsx` | **(1.11)** Style-A `<label>` (§6.12) — hand-rolled native element (no Radix dep); Lora 500/15px; required `*` + "(optional)" passed in by the form. |
| `src/components/ui/textarea.tsx` | **(1.11)** Style-A `<textarea>` (§6.12) — hand-rolled native element; min-h 140px, vertical resize; same focus/error treatment as `input`. |
| `src/components/contact/contact-form.tsx` | **(1.11, live 2.02)** `'use client'` — the accessible Contact form (Name*/Email*/Subject/Message* + honeypot `_gotcha`); client validation + focus-first-error + `aria-invalid`/`aria-describedby`; idle/submitting/success/error/preview states via a polite `aria-live` region + focused success panel; **env-gated** submit (`NEXT_PUBLIC_FORMSPREE_ENDPOINT`) — **real AJAX send live since 2.02** (preview notice retained only as a missing-env safety net); AJAX JSON payload = name · `email` (reply-to) · subject · message · **`locale`** (mk/en/sr via `useLocale`) · `_subject` · `_gotcha`; progressively enhanced (`method=POST`+`action`). |
| `src/components/contact/contact-links.tsx` | **(1.11; 2.01b)** Server — Dalibor's links beside the form, from `lib/site-links` (no hardcoded URLs). **(2.01b)** email is now a **live `mailto:`** (showing the address); Instagram/Facebook/Booksa rows; the **3 interview links render as a small list** (Interview 1/2/3); externals `target=_blank rel="noopener noreferrer"`. |
| `src/components/about/translations.tsx` | **New (2.01b).** Server — the About "Translations" block; renders `author.translations[]` (title over a muted meta line: original author · localized language pair `from → to` · play/anthology tag · publisher · year; absent parts dropped). `<section aria-labelledby>` + `<ul>`; returns `null` when empty. |
| `src/components/layout/site-header.tsx` | **Style A sticky header** (Server Component) — wordmark→home, desktop nav, switcher, mobile menu. |
| `src/components/layout/primary-nav.tsx` | Desktop primary nav (`'use client'`) — `aria-current` + caramel active underline; reads `lib/nav`. |
| `src/components/layout/mobile-menu.tsx` | Accessible mobile menu (`'use client'`) — Base UI Dialog panel, explicit focus-in/return, Framer entrance (reduced-motion gated). |
| `src/components/layout/site-footer.tsx` | **Style A footer** (Server Component) — 4 link groups from `lib/site-links` + copyright + Privacy link. **(1.12)** Privacy link given a ≥24px hit area (SC 2.5.8). **(2.01b)** email is a **live `mailto:`** (address shown), the inert "Coming soon" slot removed; Interviews group maps the **3 interview links** (Interview 1/2/3). |
| `src/components/layout/container.tsx` | Shell-width wrapper + §4.6 responsive gutters. |
| `src/components/layout/section.tsx` | §4.1 vertical-rhythm section wrapper. |
| `src/components/layout/page-header.tsx` | Eyebrow + title + description page/section head. |
| `src/components/layout/skip-to-content.tsx` | Visible-on-focus skip link (targets `#content`). |
| `src/components/home/hero.tsx` | **(1.07)** Home hero (§7.1) — typographic-only launch variant + dormant photo-present variant; name `<h1>` + tagline + heroIntro + double rule + CTAs. |
| `src/components/home/featured-book.tsx` | **(1.07)** Featured-book parchment band — cover + eyebrow + title + publisher·year + blurb + link to `/book`. |
| `src/components/home/latest-reviews.tsx` | **(1.07)** "Latest reviews" section — heading + single-column stack of `ReviewCard`. |
| `src/components/home/review-card.tsx` | **(1.07)** Horizontal review "library row" card (§6.6) — whole card links to `/[locale]/reviews/[slug]`; fallback + "available in" note; stacks <420px. |
| `src/components/home/from-the-blog.tsx` | **(1.07)** "From the blog" section — heading + 2-up grid of `BlogCard` (sits flush under reviews). |
| `src/components/home/blog-card.tsx` | **(1.07)** Date-ordered blog card (§6.7) — links to `/[locale]/blog/[slug]`; fallback + "available in" note. |
| `src/components/home/section-heading.tsx` | **(1.07)** Eyebrow + H2 + optional "see all →" link (§6.15). |
| `src/components/cover.tsx` | **(promoted 1.09, was `home/cover.tsx`)** Book-cover (§6.11) — `next/image` (`fill`+`sizes`, 2:3) or the graceful parchment placeholder (book-open glyph + monogram). No server-only deps → renders client-side too. Shared by Home / Book / Reviews. |
| `src/components/reviews/review-card.tsx` | **(1.09)** Shared **sync** library-row card (§6.6) — already-localized props; rendered by both the SSR list and the client search results; reuses `Cover`/`monogramOf`/`formatMonthYear`. |
| `src/components/reviews/reviews-list.tsx` | **(1.09)** SSR Reviews list (async server) — resolves each review + the "available in" note, renders `ReviewCard` rows or the empty state. |
| `src/components/topic-filter.tsx` | **(generalized 1.10, was `reviews/topic-filter.tsx`)** Shared SSR topic-chip filter (§6.8) — `basePath` prop (`/reviews` or `/blog`); "All" + per-topic links to `?topic=<slug>`, active chip `aria-current`. Consumed by Reviews + Blog. |
| `src/components/blog/post-card.tsx` | **(1.10)** Async server `PostCard` (§6.7/§7.5) — whole-card link, title/date/2-line excerpt, optional non-interactive topic chips (+N) + optional 72×72 square cover thumbnail, mk→en→sr fallback + "available in" note. |
| `src/components/reviews/review-search.tsx` | **(1.09)** `'use client'` search box (§6.9) wrapping the SSR list; POSTs to `/api/reviews/search`, swaps in `ReviewResults`, Clear restores the list. No layout shift. |
| `src/components/reviews/review-results.tsx` | **(1.09)** `'use client'` search results — header + Clear, the §6.9 empty state, or `ReviewCard` rows (rebuilds a minimal cover from `coverRef`). |
| `src/components/reviews/review-book-aside.tsx` | **(1.09)** The §7.4 reviewed-book card (async server) — cover, "Reviewed book" eyebrow, title + alternate-script subtitle, author·year, publisher, original `source` link. |
| `src/components/portable-text.tsx` | **(1.08, +1.09, +1.12)** Shared Style A Portable Text renderer (`@portabletext/react`) — locale-agnostic server component; styles every `blockContent` block/list/mark (Playfair h2–h4, Lora body, §6.10 quote, §3.5 lists, §2.2 links w/ focus ring + auto external new-tab/`rel`); `max-w-prose` measure; `null` when empty. **(1.09) opt-in `dropCap`**; **(1.12) opt-in `lang`** (SC 3.1.2 — set on the body wrapper only when content falls back to another language). |
| `src/components/seo/json-ld.tsx` | **(1.12)** Server component that renders one or more `<script type="application/ld+json">` tags from the `jsonld` builders; escapes `<` to prevent `</script>` breakout. |
| `src/components/brand-icons.tsx` | Instagram/Facebook/YouTube glyphs (MIT Lucide outlines; lucide-react 1.x removed brand icons). |
| `src/components/language-switcher.tsx` | Accessible MK·EN·SR inline switcher (§6.4); preserves the current path; `className`/`onNavigate` props. |
| `src/components/.gitkeep` | Original folder placeholder. |

### lib / messages / styles — `src/`
| File | Description |
|---|---|
| `src/lib/utils.ts` | `cn` (clsx + tailwind-merge) — from shadcn init. |
| `src/lib/nav.ts` | Primary-nav source of truth (`primaryNav` + `isNavItemActive`). |
| `src/lib/site-links.ts` | **Finalized (2.01b)** external links + email (data-only). Read by the footer, `ContactLinks`, **and the Person JSON-LD `sameAs` (1.12)**. Real public **email**; `interview`/`interviewVis` replaced by **`interviews[]`** (3 YouTube links); X/Twitter intentionally absent; IG @daliborac + Booksa/Versopolis/Partizanska/LinkedIn/Facebook kept. |
| `src/lib/seo/metadata.ts` | **(1.12)** `buildPageMetadata({locale,page,path,title?,description?,absoluteTitle?,ogType?})` → Next `Metadata` with title (template-aware), description, self canonical, mk/en/sr + x-default hreflang, OG + Twitter; references the OG image route on non-root pages (Home uses the file convention). |
| `src/lib/seo/jsonld.ts` | **(1.12; 2.01b)** Pure schema.org builders — `personJsonLd` (no birth/nationality/location; `sameAs` from site-links; **(2.01b)** `jobTitle` minus the unconfirmed "Journalist"), `articleJsonLd` (Article/BlogPosting), `bookJsonLd` (no genre/format — format kept in `book.genre` data only), `breadcrumbJsonLd`. |
| `src/lib/seo/og-fonts/*.ttf` | **(1.12)** Bundled static subset TTFs (Playfair latin/latin-ext 700; Lora latin/latin-ext/cyrillic 400) read by the OG image — OFL-licensed; static (Satori can't parse variable fonts). |
| `src/lib/datetime.ts` | **(1.07)** `formatMonthYear` / `formatFullDate` for cards (Intl; sr→`sr-Latn`). |
| `src/lib/strings.ts` | **(1.07)** `monogramOf` — first letter for the no-cover placeholder (strips the `[PLACEHOLDER]` marker). |
| `src/lib/search/types.ts` | **(1.09)** The Reviews search contract — `ReviewSummary` / `SearchRequest` / `SearchResponse` / `SearchMode`. |
| `src/lib/search/reviews-search.ts` | **(1.09)** Orchestrator (server-only) — one `REVIEWS_SEARCH_QUERY` fetch feeds both paths; semantic→keyword fallback, honest `mode`; exports `semanticConfigured()`. |
| `src/lib/search/keyword.ts` | **(1.09)** Always-on keyword fallback — `normalizeForSearch` (diacritic/case fold), `blocksToPlainText`, `keywordSearch` (AND-match). |
| `src/lib/search/embeddings.ts` | **(1.09, +2.03)** Voyage wrapper (server-only) — the SOLE Voyage access point: `embedQuery` / `embedDocuments` / **`embedQueries` (2.03 batched query embed)**; `EMBEDDING_MODEL` (=`voyage-3.5`), `EMBEDDING_DIMENSIONS` (=1024) — confirmed live (1024-dim; `query` vs `document` `inputType`). |
| `src/lib/search/supabase.ts` | **(1.09)** Server-only service-role Supabase client (`getSupabaseAdmin`); bypasses RLS, never imported client-side. |
| `src/lib/search/review-embedding-text.ts` | **(2.03)** Shared, server-safe (no `server-only`) builder of a review's combined-language embedding text (reuses the 1.09 `blocksToPlainText` flattener + `localizedValue`) + its SHA-256 content hash. Used by BOTH the reindex route and the backfill script so they embed identically. |
| `src/messages/{en,mk,sr}.json` | UI strings — `nav` / `common` / per-page titles / `footer` / `home` / `book` / **`reviews`** (1.09) / **`blog`** (1.10) / **`contact`** + **`privacy`** (1.11: full namespaces — contact intro/`form.*`/`links.*`, privacy intro + six `sections.*`; mk/sr copy is a plain-language placeholder pending Dalibor) namespaces (mk Cyrillic; en/sr Latin). **(1.11)** removed the now-unused `common.comingSoon`. **(1.12)** added the `metadata` namespace (`siteName` + per-page `title`/`description`, incl. `default` + `notFound`) — the source for every page's SEO copy; expanded `notFound` with `body`/`cta`; dropped `contact`/`privacy` `metaDescription` (superseded). **(2.01b)** metadata copy finalized (dropped the unconfirmed "journalist" from the About description); added the `about.*` block (`translations.*`, `langNames.*`, `kinds.*`, `education`) + `contact.links.interviewItem` + parameterized `footer.interview {n}`; removed obsolete `footer.email`/`footer.emailPending`/`contact.links.emailDesc`. Metadata still gets Dalibor's launch-QA sign-off. |
| `src/messages/.gitkeep`, `src/styles/.gitkeep` | Folder placeholders. |

### Static assets — `public/`
| File | Description |
|---|---|
| _(none)_ | **(2.01e)** The unused create-next-app scaffold SVGs (`vercel/next/file/globe/window.svg`) were deleted (confirmed unreferenced); `public/` is now empty. App icons live under `src/app/` (see `icon.png`/`apple-icon.png`), not `public/`. |

### Project-state — `src/_project-state/`
| File | Description |
|---|---|
| `current-state.md` | Live snapshot (end of 2.01e — Dalibor's portrait live on About/Home; site favicon set). |
| `file-map.md` | This file. |
| `00_stack-and-config.md` | Append-only stack/config log (1.02 → 2.01e). |
| `Part-X-Phase-YY-Completion.md` | Blank completion-report template. |
| `Part-1-Phase-02-Completion.md` … `Part-1-Phase-12-Completion.md`, **`Part-2-Phase-01b/01c/01d/01e/02/03/04/05-Completion.md`** | Per-phase completion reports. |

### Design handovers + mockups — `docs/`
| File | Description |
|---|---|
| `docs/design-handovers/Part-1-Phase-03-Handover.md` | Style A "Hardcover" spec — source of truth for visuals. |
| `docs/design-handovers/mockups/*.html` | Static mockups (home, reviews-list, single-review, components) + README. |
| `docs/dalibor-publishing-guide.md` | **(2.04)** Non-technical publishing how-to for the live Studio (login → 3-language model → create post/review → cover+book metadata → draft vs publish). EN draft; MK version placeholder at top. |

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
