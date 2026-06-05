# Part-1-Phase-04-Completion.md

> **Location in repo:** `src/_project-state/`

---

**Phase ID + name:** 1.04 — Languages + Routing Foundation (next-intl trilingual routing · Playfair + Lora fonts · Style A design tokens)

**Executing Claude:** Code

**Date completed:** 2026-06-06

---

### What shipped

- **next-intl v4 trilingual routing** for `mk` (default) / `en` / `sr`, `localePrefix: 'always'`, `localeDetection: false`:
  - `/` → **307 → `/mk`** (always; never by browser language — verified with `Accept-Language: en`, still `/mk`).
  - `/mk`, `/en`, `/sr` each render and prerender as **SSG** (build shows `● /[locale]` → `/mk`, `/en`, `/sr`).
  - Unknown locale `/de` → 307 → `/mk/de` → **404**.
- **`src/i18n/` routing layer** — single source of truth (`routing.ts`), navigation wrappers (`navigation.ts`: `Link, redirect, usePathname, useRouter, getPathname`), and per-request config (`request.ts`).
- **Proxy** at **`src/proxy.ts`** (Next 16's renamed Middleware convention) via `createMiddleware(routing)` — build reports `ƒ Proxy (Middleware)` active.
- **`[locale]` route structure**: `src/app/[locale]/layout.tsx` (now the root layout — renders `<html lang>`/`<body>`, loads fonts, `generateStaticParams`, `setRequestLocale`, `hasLocale`→`notFound()` guard, `NextIntlClientProvider`) + `src/app/[locale]/page.tsx` (minimal placeholder Home). Scaffold `src/app/layout.tsx` + `page.tsx` **deleted**.
- **Fonts via `next/font/google`** — Playfair Display (display) + Lora (body), each `subsets: ['latin','cyrillic']`, handover weights/styles, wired to `--font-playfair` / `--font-lora`. Self-hosted, no layout shift. **Cyrillic confirmed rendering in both faces** (screenshot of `/mk`: H1 «Далибор Плечиќ» in Playfair, body «Критичар…»/nav in Lora; 18 Cyrillic `@font-face` rules across both families, 22 woff2 bundled).
- **Style A design tokens** — handover Appendix A `@theme` block applied to `src/app/globals.css`; **dark-mode block removed** (Decision #14); scaffold Geist/`--background`/`--foreground` removed.
- **Language switcher** — `src/components/language-switcher.tsx`: accessible, reusable MK·EN·SR inline toggle (design §6.4). `aria-current` on active, real keyboard-focusable links for others, visible focus ring, localized `aria-label`. Preserves the current path (verified: on `/en` it links to `/mk` and `/sr`).
- **Trilingual UI strings** — `src/messages/{en,mk,sr}.json`, **identical 20-key structure** (verified), `{langs}` ICU placeholder retained in all three. mk = Cyrillic, en/sr = Latin.
- **Typed config** — `src/global.d.ts` augments next-intl `AppConfig` (`Locale` + `Messages`) for compile-time-checked `t('…')` keys and locales.
- `npm run build` and `npm run lint` both pass with the existing `--webpack` scripts; the next-intl plugin wraps the existing (empty) `next.config.ts` without disturbing the webpack arrangement.

### Decisions made on the fly (with why)

- **`AppConfig` augmentation added (`src/global.d.ts`)** — beyond the literal brief. It is the canonical next-intl v4 type-safety setup, benefits every later phase (autocomplete + key checking), and is "not throwaway." It also caught a real type bug before runtime (next item).
- **`hasLocale` guard duplicated into `page.tsx`** — the strict `Locale` type makes `setRequestLocale` require `'mk'|'en'|'sr'`, but route `params` legitimately arrive as `string` (matching Next 16's generated `PageProps` type). Rather than weaken the param type or cast, the page narrows with the same `hasLocale`→`notFound()` guard the layout uses. Type-safe and defensive.
- **`NextIntlClientProvider` used with no props** — in v4 it auto-inherits `locale` + `messages` from the server render (verified in its shipped types). Minimal and correct; avoids manually threading messages.
- **`home.title` is provisional placeholder copy** — "Critic, translator, and writer" (mk «Критичар, преведувач и писател» / sr «Kritičar, prevodilac i pisac»), taken from the design's Appendix D descriptor. §7.1 says Home leads with the name + a one-line "who he is" and **no slogan**. Flag for review with Dalibor.
- **Page-heading stubs** for `about/reviews/blog/book/contact/privacy/notFound` were made consistent with the nav terminology (e.g. reviews heading reuses the nav term). Provisional — to be reviewed with Dalibor.
- **`.claude/launch.json` added** (with `autoPort: true`) to drive the Preview tool for the visual Cyrillic-rendering check; reusable in later phases. Minor tooling artifact, not app code.
- **Parallel translation subagents** — per the brief's parallelization plan, two background agents produced mk (Cyrillic) and sr (Latin) from the fixed English canonical + the brief's authoritative table values; main agent then verified key parity (20/20), JSON validity, and `{langs}` retention.

### Surprises or off-spec changes

- **Middleware filename = `src/proxy.ts`, not `src/middleware.ts`.** Next.js 16 renamed the Middleware file convention to **Proxy** (confirmed in `node_modules/next/dist/docs/.../16-proxy.md` and `.../file-conventions/proxy.md`: "Middleware is deprecated and renamed to Proxy"). next-intl's `createMiddleware` is filename-agnostic, so `export default createMiddleware(routing)` mounts as the proxy. Build output confirms `ƒ Proxy (Middleware)`. **This is the one place the brief's older `middleware.ts` name did not apply.**
- **No next-intl/Next API symbol deviations otherwise.** Every symbol the brief named matched the installed **next-intl 4.13.0** types (verified against `node_modules/next-intl/dist/types/**` before writing): `defineRouting`, `createNavigation`, `createMiddleware`, `getRequestConfig`, `setRequestLocale`, `getTranslations`, `hasLocale`, `useTranslations`, `useLocale`, `NextIntlClientProvider`, and the `Locale` type (re-exported from `use-intl/core`).
- **Fonts: the handover's explicit `weight`/`style` arrays on variable fonts built without error.** The handover flagged a possible need to drop `weight` and serve the full variable axis; that fallback was **not** required — next/font/google requested the specific `ital,wght` instances and self-hosted them. Applied Appendix C verbatim.
- **Stale `.next` types caused a first-build failure.** After deleting `src/app/layout.tsx`, a leftover `.next/dev/types/app/layout.ts` referenced the gone module. Clearing `.next` fixed it. (Note for future route deletions: clear `.next`.)
- **`/de` 404s via a redirect** to `/mk/de` (the default-locale prefix is prepended by the proxy, then the missing child route 404s). Net behavior satisfies the DoD ("unknown locale returns 404").
- **⚠️ Terminology discrepancy to resolve with Dalibor — "критика/kritika" vs "рецензија/recenzija".** The 1.04 brief's Step 11 table uses **Критики / Kritike** for `nav.reviews` and **"…критики… / …kritike…"** in the search placeholder. The 1.03 handover's Appendix D used **Рецензии / Рецензије** and "рецензии" instead. Per this phase's brief I seeded the **brief's table values** (Критики/Kritike). The two are near-synonyms; **Dalibor should confirm the preferred term before content phases** — it affects `nav.reviews`, `common.searchPlaceholder`, and the reviews page heading.

### Files written / updated

| Path | Change |
|---|---|
| `package.json` | Added `next-intl: ^4.13.0` (installed 4.13.0). Scripts unchanged (`--webpack` preserved). |
| `next.config.ts` | Wrapped existing config with `createNextIntlPlugin('./src/i18n/request.ts')`. |
| `src/i18n/routing.ts` | **New.** `defineRouting` — locales `mk`/`en`/`sr`, default `mk`, prefix `always`, detection `false`. |
| `src/i18n/navigation.ts` | **New.** `createNavigation(routing)` → `Link, redirect, usePathname, useRouter, getPathname`. |
| `src/i18n/request.ts` | **New.** `getRequestConfig` — validates `requestLocale` via `hasLocale`, loads `../messages/${locale}.json`. |
| `src/proxy.ts` | **New.** `export default createMiddleware(routing)` + matcher (Next 16 Proxy convention). |
| `src/global.d.ts` | **New.** `AppConfig` augmentation (`Locale` + `Messages`). |
| `src/app/[locale]/layout.tsx` | **New.** Root layout: fonts, tokens, `lang`, `generateStaticParams`, `setRequestLocale`, provider, temporary top bar mounting the switcher. |
| `src/app/[locale]/page.tsx` | **New.** Minimal placeholder Home; resolves per-locale strings. |
| `src/components/language-switcher.tsx` | **New.** Accessible MK·EN·SR switcher (client). |
| `src/messages/en.json` | **New.** English canonical (20 keys). |
| `src/messages/mk.json` | **New.** Macedonian (Cyrillic), same structure. |
| `src/messages/sr.json` | **New.** Serbian (Latin), same structure. |
| `src/app/globals.css` | **Replaced.** Handover Appendix A `@theme` tokens + base rules; dark-mode + Geist tokens removed. |
| `src/app/layout.tsx` | **Deleted** (scaffold root layout). |
| `src/app/page.tsx` | **Deleted** (scaffold home). |
| `.claude/launch.json` | **New.** Preview-tool config (verification aid). |
| `src/_project-state/Part-1-Phase-04-Completion.md` | **New.** This report. |
| `src/_project-state/current-state.md` | Updated to end-of-1.04. |
| `src/_project-state/file-map.md` | Updated (new files; folded in the 1.03 `docs/` mockups + handover + 1.03 report). |
| `src/_project-state/00_stack-and-config.md` | Appended 1.04 entry (next-intl version, `proxy.ts`, `localeDetection:false`). |

### Tests run + results

- **`npm run build` (`next build --webpack`): PASS.** Compiled 2.2s; TypeScript 2.5s; `● /[locale]` SSG → `/mk` `/en` `/sr`; `○ /_not-found` static; `ƒ Proxy (Middleware)` active. (First attempt failed on a stale `.next` type referencing the deleted scaffold layout; resolved by clearing `.next`.)
- **`npm run lint` (`eslint`): PASS** (no errors, no warnings).
- **Message-file check (node):** all three valid JSON, **20/20 key parity**, `{langs}` placeholder present in all three.
- **Runtime (`next start`) — curl matrix:**
  - `/` → 307 `/mk`; `/` with `Accept-Language: en` → 307 `/mk` (localeDetection:false ✓).
  - `/mk` `/en` `/sr` → 200; `/de` → 307 `/mk/de`; `/mk/de` → 404.
  - `<html lang>` = `mk`/`en`/`sr` per locale, both font-variable classes applied.
  - Per-locale strings resolve (mk Cyrillic «Далибор Плечиќ»/«Почетна», en "Home", sr "Početna").
  - Switcher on `/en` links to `/mk` and `/sr` (path preserved).
  - Fonts: 18 Cyrillic `@font-face` rules, both families, 22 self-hosted woff2.
- **Visual (screenshot of `/mk`):** Cyrillic renders in **both** Playfair (H1, incl. Macedonian «ќ») and Lora (body/nav); cream/espresso/serif tokens visibly applied; temp bar + active MK switcher present.

### Blocked / carryover items

- **Styled Style A header / footer / nav** → **1.06** (this phase ships only a clearly-marked temporary top bar).
- **shadcn/ui init, Lucide, Framer Motion** → **1.06+**.
- **Real Home page** → **1.07**.
- **hreflang, schema, `sitemap.xml`, `robots.txt`, full per-page metadata, Lighthouse** → **1.12**.
- **UI string values are provisional** — review with Dalibor, especially: (a) **критика vs рецензија** terminology; (b) `home.title` descriptor; (c) `nav.about` wording («За Далибор» vs «За мене» from the mockups).
- **`src/messages/.gitkeep` + `src/components/.gitkeep`** now sit beside real files (harmless; left in place).
- **2 moderate `npm audit`** findings unchanged (transitive `postcss` inside `next`); next-intl added no new advisories.
- **Sanity, Formspree, AI search / embeddings** → later phases.

### What's next

- **1.05** per the Phase Plan — Sanity CMS stand-up / content modeling (Sanity is pinned at 1.05 in the stack log; the drop-cap editor note is also flagged for 1.05). Then **1.06** builds the real header/footer/nav (and drops this phase's switcher into the real header) with shadcn/ui.

---
*Reminder: `current-state.md`, `file-map.md`, and `00_stack-and-config.md` updated alongside this report.*
