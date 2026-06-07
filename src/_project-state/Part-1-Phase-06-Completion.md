# Part-1-Phase-06-Completion.md

> **Location in repo:** `src/_project-state/`

---

**Phase ID + name:** 1.06 — Core Layout & Shared Components (Style A header / nav / mobile menu · footer · shared layout primitives · skip link · shadcn/ui init + theming · trilingual chrome)

**Executing Claude:** Code

**Date completed:** 2026-06-07

---

### What shipped

- **shadcn/ui initialized and themed to Style A.** `components.json` + the `cn` util (`src/lib/utils.ts`) created via the official CLI; `lucide-react`, `framer-motion`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` installed. Three primitives pulled and **restyled** to Hardcover: `Button`, `Separator`, `Sheet`. The Style A `@theme` block is intact; a minimal set of shadcn semantic alias tokens was added on top (see Decisions).
- **Real Style A header** (`src/components/layout/site-header.tsx`) replaces the temporary 1.04 top bar on every `/[locale]` route: lightly-sticky bar (cream @ 85% + `backdrop-blur(8px)`, single bottom hairline, no shadow, 56px mobile / 64px desktop, `z-40`); wordmark **"Dalibor Plečić"** (always Latin) linking to localized home; desktop primary nav with a 2px caramel active underline + `aria-current="page"`; the restyled MK·EN·SR language switcher; and an accessible mobile menu.
- **Accessible mobile menu** (`src/components/layout/mobile-menu.tsx`) on a Base UI Dialog (via the `Sheet` primitive): full-width panel dropping over the bar, wordmark + close (X) top row, 48px stacked nav rows with active indication, and the language switcher centered at the bottom. Opens with `aria-expanded`, moves focus into the panel, traps focus, closes on Escape / backdrop / nav-selection, returns focus to the trigger, and unmounts cleanly. A single subtle Framer Motion content entrance, gated by `useReducedMotion`.
- **Real Style A footer** (`src/components/layout/site-footer.tsx`) on every `/[locale]` route: walnut ground, cream text (8.0:1), 2px caramel top-rule; four groups (Contact · Social · Writing · Interviews) reading URLs from `src/lib/site-links.ts`, copyright with the current year, and a Privacy link; cream focus rings on the dark ground; icon links carry visible text labels.
- **Shared layout primitives:** `Container` (shell width + §4.6 responsive gutters), `Section` (§4.1 vertical rhythm), `PageHeader` (eyebrow + title + description, mobile-downsized H1), and a visible-on-focus `SkipToContent` link.
- **Single-source config modules:** `src/lib/nav.ts` (primary nav items + `isNavItemActive`) and `src/lib/site-links.ts` (provisional external links) — read by header, mobile menu and footer.
- **Chrome mounted** in `src/app/[locale]/layout.tsx`: `SkipToContent` (first focusable) → `<SiteHeader>` → `<main id="content" tabIndex={-1}>` wrapping `{children}` → `<SiteFooter>`. Temporary top bar removed.
- **Thin stubs** `src/app/[locale]/contact/page.tsx` and `…/privacy/page.tsx` (PageHeader + one localized "coming soon" line) so every nav/footer link resolves inside the new chrome.
- **Trilingual chrome:** all new visible strings added to `mk.json`, `en.json`, `sr.json` (`nav.primaryLabel`; `common.{wordmark,openMenu,closeMenu,menu,comingSoon}`; a full `footer.*` namespace). No hardcoded UI strings in the chrome.
- **Brand icons** (`src/components/brand-icons.tsx`): Instagram / Facebook / YouTube inlined as MIT Lucide outlines (see Surprises — lucide-react 1.x removed brand icons).

### Decisions made on the fly (with why)

- **shadcn base = Base UI (`base-nova`), not Radix — precedence call.** The current shadcn CLI (`shadcn@4.10.0`) defaults to **Base UI** (`@base-ui/react`), and `init -d --base radix` requires an interactive "switch base?" confirmation that `-d` does not auto-answer. The locked stack docs say "shadcn/ui (Radix UI)", but the brief explicitly says *use the current CLI and report deviations*; Base UI is from the same lineage, is React 19 / Next 16 / Tailwind v4 compatible, and its Dialog gives equivalent focus-trap/Escape/focus-return a11y. **Kept Base UI; documented as a deviation from the plan's Radix sub-choice.** (`00_stack-and-config.md` updated.)
- **globals.css reconciliation.** `shadcn init` overwrote `globals.css` with a neutral oklch `:root`, a `.dark` block, an `@theme inline` var-remap (which **clobbered `--color-primary` → caramel and `--color-border`**), and an `@layer base { body { @apply bg-background text-foreground } }` that would have turned the site white/neutral with the wrong fonts. **I restored the Style A `globals.css` and instead added a small, controlled set of shadcn alias tokens** (`--color-background/foreground/card/popover/muted/accent/secondary/input/ring/destructive` + `--radius` scale) mapping to the **literal locked Style A hexes**, plus `@import "tw-animate-css"`. I deliberately **did NOT** redefine `--color-primary` (kept caramel) or `--color-border` (kept the hairline), and dropped the `.dark`/`@custom-variant dark` blocks (Decision #14 — no dark mode). I also dropped the `@import "shadcn/tailwind.css"` line and made the three primitives self-sufficient (standard Tailwind v4 `data-[...]` variants instead of that file's custom variants), so the build doesn't depend on the `shadcn` package's CSS subpath.
- **The §2.5 caramel rule drove the Button restyle.** Because Style A's `--color-primary` is caramel (a ≥3:1-only accent that must never host text), I did **not** map shadcn's text-bearing `primary` to it. The Button's `default` variant uses `bg-primary-strong` / `text-on-primary` (deep-caramel fill), `outline` uses a caramel **border** with a `primary-strong` label, `ghost` uses a `primary-strong` label — all per §6.1, with the global 2px deep-caramel focus ring.
- **Mobile-menu robustness over Base UI's transition system.** Base UI's Dialog defers popup unmount and focus to a CSS-transition / `requestAnimationFrame` cycle. That is fragile: it leaves a closed-but-mounted, focusable panel when the transition's `transitionend` doesn't fire — which is exactly what happens for **`prefers-reduced-motion`** users (our global rule zeroes transitions) and in throttled/headless renderers. So I (a) **removed the Sheet's CSS enter/exit transitions** (instant, robust mount/unmount), (b) **conditionally render the panel on `open`** so React removes it synchronously on close, and (c) added an explicit, rAF-free `useEffect` that moves focus into the panel on open (after a `setTimeout(0)` so the portalled content exists) and returns focus to the trigger on close. Base UI still provides the focus **trap**, Escape, backdrop close, modal isolation, and dialog ARIA. The one tasteful entrance is then driven by **Framer Motion**, gated by `useReducedMotion`.
- **`shadcn` moved to devDependencies.** `init` added `shadcn` to `dependencies` (it should not be a runtime dep). Moved it to `devDependencies` (lets maintainers run the CLI reproducibly; not bundled).
- **Reviews label kept provisional.** Used the existing `Критики / Kritike / Reviews` keys (the критика-vs-рецензија decision is still open and not this phase's call). The handover/mockup show "Рецензии" in placeholder content; per the brief's scope-vs-visual precedence, the live message keys win for nav labels.
- **Footer composition.** Rendered all four handover groups (Contact/Social/Writing/Interviews); the Writing group includes Booksa + Versopolis + Partizanska (the optional hubs fit). The email slot is rendered but **inert** (label + a muted "coming soon"; no address — set in 2.02). Privacy link sits in the bottom bar beside the copyright.
- **Footer group headings are `<h2 class="font-body …">`** so they participate in the heading outline while overriding the global `h1–h4 → display-font` rule back to Lora (eyebrow style per §6.5), tracking forced to 0.06em.

### Surprises or off-spec changes

- **`lucide-react` is on 1.x (1.17.0) and removed its brand/logo icons.** `FacebookIcon`/`InstagramIcon`/`YoutubeIcon` no longer exist (tsc caught it; lint did not). Re-created them as small MIT Lucide-outline components in `src/components/brand-icons.tsx` (same paths as the 1.03 mockup sprite), with the §5 1.75 stroke-width. Generic icons (`MailIcon`, `ExternalLinkIcon`, `MenuIcon`, `XIcon`) still come from `lucide-react`.
- **`shadcn init` was destructive to `globals.css`** (see Decisions) — required a full restore + controlled re-theming rather than accepting the CLI output.
- **The project-instructions file named in the brief does not exist.** The brief's Step 0 references `Dalibor-Website-Project-Instructions.md` §8/§10; the repo instead has `Dalibor-Website-Plan.md`, `-Decisions.md`, `-Phase-Plan.md`. Used the 1.03 handover + current-state as the authoritative sources (per the brief's "live code/spec wins" rule). Noted here as the only plan-vs-repo conflict.
- **Headless preview renderer throttles rAF / can't screenshot** the sticky `backdrop-filter` header (`preview_screenshot` timed out repeatedly; `preview_inspect`/`preview_snapshot` worked). This is what first surfaced the Base UI transition/unmount fragility above; once switched to the deterministic approach, the full open→focus→Escape→unmount→focus-return cycle verified cleanly in the headless run, and colours were verified via `preview_inspect` rather than screenshots.

### Files written / updated

| Path | Change |
|---|---|
| `components.json` | **New.** shadcn config (`base-nova`, css → globals.css, aliases). |
| `src/lib/utils.ts` | **New.** `cn` (clsx + tailwind-merge). |
| `src/app/globals.css` | **Updated.** Style A `@theme` preserved + shadcn alias tokens + radius scale + `@import "tw-animate-css"`; init's neutral/dark blocks removed. |
| `src/components/ui/button.tsx` | **New (restyled).** Style A variants (default/outline/ghost) + sizes (default 44 / sm 36 / icon 44), §2.5-safe, global focus ring. |
| `src/components/ui/separator.tsx` | **New (restyled).** Hairline, orientation from prop (no custom-variant dependency). |
| `src/components/ui/sheet.tsx` | **New (restyled).** Base UI Dialog, Style A, transition-free (robust unmount), warm overlay. |
| `src/components/layout/container.tsx` | **New.** Shell width + §4.6 gutters. |
| `src/components/layout/section.tsx` | **New.** §4.1 vertical rhythm. |
| `src/components/layout/page-header.tsx` | **New.** Eyebrow + title + description. |
| `src/components/layout/skip-to-content.tsx` | **New.** Visible-on-focus skip link. |
| `src/components/layout/site-header.tsx` | **New.** Sticky Style A header (Server Component). |
| `src/components/layout/primary-nav.tsx` | **New.** Desktop nav, active underline + `aria-current` (`'use client'`). |
| `src/components/layout/mobile-menu.tsx` | **New.** Accessible mobile menu (`'use client'`). |
| `src/components/layout/site-footer.tsx` | **New.** Style A footer reading `site-links` (Server Component). |
| `src/components/brand-icons.tsx` | **New.** Instagram/Facebook/YouTube glyphs (lucide 1.x removed brand icons). |
| `src/components/language-switcher.tsx` | **Updated.** Restyled to §6.4; added `className`/`onNavigate`; 1.04 routing logic unchanged. |
| `src/lib/nav.ts` | **New.** Primary-nav source + `isNavItemActive`. |
| `src/lib/site-links.ts` | **New.** Provisional external links (data-only). |
| `src/app/[locale]/layout.tsx` | **Updated.** Mounts skip link + header + `<main id="content">` + footer; temp top bar removed. |
| `src/app/[locale]/contact/page.tsx` | **New.** Thin stub (replaced by the real page in 1.11). |
| `src/app/[locale]/privacy/page.tsx` | **New.** Thin stub (replaced in 1.11). |
| `src/messages/{mk,en,sr}.json` | **Updated.** Added `nav.primaryLabel`, `common.{wordmark,openMenu,closeMenu,menu,comingSoon}`, `footer.*`. |
| `package.json` / `package-lock.json` | **Updated.** Added the deps above; `shadcn` in devDependencies. |
| `src/_project-state/Part-1-Phase-06-Completion.md` | **New.** This report. |
| `src/_project-state/{current-state,file-map,00_stack-and-config}.md` | **Updated.** |

### Tests run + results

- **`npx tsc --noEmit`** — **PASS** (0 errors).
- **`npm run lint`** — **PASS** (0 errors, 0 warnings).
- **`npm run build` (`next build --webpack`)** — **PASS.** 24 static pages: `● /[locale]` + `/[locale]/{about,blog,book,contact,privacy,reviews}` × mk/en/sr (SSG), `○ /studio/[[...tool]]` (static), `ƒ Proxy (Middleware)` active.
- **Route matrix (curl, `npm start` on :3000):** `/mk` `/en` `/sr` and `/mk/{about,reviews,blog,book,contact,privacy}` + `/en/contact` + `/sr/privacy` → **200**; `/studio` + `/studio/structure` → **200**. Each locale renders the chrome with the correct `<html lang>` + translated nav/footer/skip strings. **`/studio` had 0 chrome markers** (no header/footer/skip-link leak).
- **Style A colours (preview_inspect):** header `position:sticky`, `rgba(244,237,225,0.85)`, `backdrop-filter:blur(8px)`, bottom border `rgba(46,34,24,0.12)`, height 64px, z-40. Footer `rgb(91,66,40)` (walnut) / `rgb(244,237,225)` (cream) / top border `rgb(168,116,55)` (caramel) 2px.
- **Language switch preserves page:** clicked EN in the header on `/mk` home → `/en` home (`lang=en`, EN active, still home).
- **Desktop active indicator:** on `/mk` only "Почетна" has `aria-current="page"` with a full-opacity caramel (`rgb(168,116,55)`) underline; on `/mk/contact` only "Контакт" is current (parent-active logic works).
- **Skip link:** is the **first focusable** element, localized text, and activating it moves focus to `MAIN#content` (tabindex -1).
- **Mobile menu (full keyboard/a11y cycle):** open → dialog mounts, `aria-expanded=true`, `main` gets `aria-hidden`, focus moves into the panel (wordmark), 8 nav anchors + switcher present; **Escape** → dialog unmounts (count 0), `aria-expanded=false`, **focus returns to the trigger**; close button + backdrop behave the same. Reduced motion is respected (Framer gated by `useReducedMotion`; global CSS zeroes CSS animation).
- **Independent code review** — a `superpowers:code-reviewer` subagent reviewed the whole implementation against this brief (reading every changed file, the handover, both mockups, and Base UI/Tailwind internals, and re-running tsc/lint/build): **0 Critical, 0 Important.** Verdict: "meets its Definition of Done." Five Minor nits (all accepted/documented below).

### Blocked / carryover items

- **Code-review Minor nits (none blocking).** (1) `sheet.tsx` keeps shadcn's default close button with an English sr-only "Close" — **unused** by the chrome (the menu passes `showCloseButton={false}` and supplies its own translated close), so no live i18n violation; left as the standard primitive default. (2) The mobile menu's explicit focus-return duplicates Base UI's own and uses a document-wide `[data-slot="sheet-trigger"]` selector — correct with a single menu; revisit if a second Sheet is ever added. (3) The active nav item's underline dims to 60% when you hover the *current* item — this faithfully reproduces the mockup (`home.html`), so it's a spec-match. (4) Language switch preserves the **path** but not query string/hash (unchanged 1.04 behavior) — relevant once a page gains query-driven state (the Reviews search, 1.09). (5) `tw-animate-css` is imported but currently unused (standard shadcn setup; kept for future animated primitives).
- **No screenshot of the chrome** — the headless preview's `preview_screenshot` times out on the sticky `backdrop-filter`; verified visually via `preview_inspect` + a11y snapshots instead. A quick manual look in a real browser is the easy confirmation.
- **Footer link values + email are provisional** (`site-links.ts`) — confirmed/finalized in 2.01; email address in 2.02.
- **21 moderate `npm audit`** findings carried from 1.05 (transitive Sanity toolchain) — unchanged; revisit on upstream bumps.
- **критика vs рецензија** terminology still open (affects `nav.reviews`, search placeholder, headings).

### What's next

- **1.07** — the real Style A **Home** page (typographic hero, featured-book band, latest reviews, from-the-blog) rendered inside this chrome, consuming the typed Sanity queries + `localize.ts`. Subsequent phases (1.08–1.11) replace the remaining thin proof/stub routes (Reviews, Single review, Blog, About, Book, Contact, Privacy) with styled pages, and add `next/image` + `remotePatterns` for `cdn.sanity.io`.

---
*Reminder: `current-state.md`, `file-map.md`, and `00_stack-and-config.md` updated alongside this report.*
