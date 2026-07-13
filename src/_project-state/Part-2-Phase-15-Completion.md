# Part-2-Phase-15-Completion.md

> **Location in repo:** `src/_project-state/`
> Filled from the `Part-X-Phase-YY-Completion.md` template.

---

**Phase ID + name:** 2.15 — Shiny wordmark (header): a restrained caramel "gold-foil" glint on the header wordmark, on hover + keyboard focus, reduced-motion-safe.

**Executing Claude:** Code

**Date completed:** 2026-07-13

---

### What shipped
- **New primitive `src/components/ui/shiny-button.tsx`** (`'use client'`), adapted from the 21st.dev ShinyButton per the brief. It exports:
  - **`ShineOverlay`** — the reusable decorative glint: an `aria-hidden` + `pointer-events-none` + `select-none` **duplicate of the text** with `bg-clip-text text-transparent`, painting a `linear-gradient(-75deg, …)` band that runs **caramel (`var(--color-primary)` = `#A87437`) → soft gold (`#EAD1A0`, deliberately not white) → caramel**, positioned by the registered custom property `--wordmark-shine-x`.
  - **`ShinyButton`** — a `group`-classed `<button>` wrapping `ShineOverlay` (kept as a general-purpose primitive; **not mounted anywhere** — the wordmark can't be a `<button>`, so it composes `ShineOverlay` directly).
  - No `dark:` variants, no infinite loop, no button-press `scale`/`whileTap` — all dropped from the original as the brief required.
- **New client island `src/components/layout/wordmark.tsx`** (`'use client'`) — the header wordmark. A single locale-aware `<Link href="/">` from `@/i18n/navigation` (unchanged text "Dalibor Plečić" passed in as a prop from the server header), with its **original typography + focus-ring classes preserved verbatim**, gaining only `group relative` (needed for the absolute overlay's containing block + the CSS hover/focus trigger). It carries `ShineOverlay` on top of the always-legible base text.
- **`src/components/layout/site-header.tsx`** — the inline `<Link>…</Link>` wordmark markup is replaced by `<Wordmark text={t("wordmark")} />`; the now-unused `Link` import is dropped. The file **stays a Server Component**; the builder credit, nav, switcher, and mobile menu are untouched.
- **`src/app/globals.css`** — added a registered **`@property --wordmark-shine-x`** (`syntax: "<percentage>"`, `initial-value: 100%`) + a one-shot **`@keyframes wordmark-shine`** (`100% → -100%`), placed just above the existing reduced-motion block so `* { animation: none }` also disables it.
- **Behaviour:** on hover **and** on keyboard `:focus-visible`, a subtle warm gold glint sweeps once across the wordmark (`0.85s ease-in-out`), then the band parks off-screen (invisible) — no loop, no reverse-sweep. Triggered purely by CSS (`group-hover:` / `group-focus-visible:` arbitrary `[animation:…]`), so it needs no JS state and can't fight the click or the focus ring. The accessible name stays exactly **"Dalibor Plečić"** and the link still navigates home in the active locale.
- **Net change:** 2 new files + 2 edited files (`site-header.tsx`, `globals.css`). No new route, no new dependency, no i18n key, no schema/query/`.env`/Sanity/deploy change.

### Decisions made on the fly (with why)
- **The sweep is a CSS `@keyframes`, not framer-motion — a forced deviation from the brief.** The brief specified framer driving the `--x` mask sweep (`whileHover`/`whileFocus` or an `onHoverStart`/`onFocus` state toggle). **framer-motion 12.40 would not animate the value on this component at all.** I verified this exhaustively in-browser, ruling out my own wiring first: the `onMouseEnter`/`onFocus` handlers *do* fire (next-intl `Link` forwards them; confirmed via the DOM node's React props **and** console instrumentation — `active` flips `true`, the effect runs), yet the value never moved across **four** distinct framer techniques — (1) a `--x` custom property in a **variant label**, (2) a **direct** `animate={{ "--x": … }}` value (exactly the original's approach), (3) a numeric **`MotionValue` + `useMotionTemplate`** with imperative `animate()` (whose promise never resolved), and (4) as a control test, a plain **`animate={{ opacity }}`** — all stayed put. Root cause wasn't fully isolated (React 19 StrictMode double-invoke and the app's existing `LazyMotion strict` mobile-menu island are suspects), but the effect is real and reproducible. So I moved the sweep to a **one-shot CSS keyframe + registered `@property`**, fired by CSS `:hover`/`:focus-visible` — which is arguably the *better* primitive for "single pass, park off-screen, no reverse" anyway (a CSS one-shot animation restarts on each hover-enter and reverts cleanly on leave, with no reverse-sweep artefact). **`useReducedMotion()` is kept exactly as the brief's accessibility gate** (see below); only the animator changed. Recorded in `00_stack-and-config.md` (2026-07-13) as a stack gotcha for future micro-interactions.
- **No JS hover/focus state — CSS `group-hover:`/`group-focus-visible:` instead.** Because the animation is CSS, the wordmark needs no `useState`/`onMouseEnter`/`onFocus` at all; the link's own `:hover`/`:focus-visible` drive it via Tailwind `group` variants. This also sidesteps the fragile `onFocus` + `matches(':focus-visible')` timing dance and gives keyboard users the exact same trigger reliably (verified: computed `animation-name: wordmark-shine` under `:focus-visible`).
- **Registered `@property` for `--wordmark-shine-x`.** A bare CSS variable can't be interpolated by `@keyframes`; registering it with `syntax: "<percentage>"` makes the sweep smooth. `initial-value: 100%` keeps the band off-screen (invisible) at rest and after the animation ends (`animation-fill-mode: none`).
- **Text passed as a prop from the server, not read via `useTranslations` in the island.** The brief allowed either; passing `t("wordmark")` down keeps the client island free of any i18n lookup (marginally leaner) and server-renders the text.
- **Reduced-motion gated two ways.** `useReducedMotion()` drops the overlay entirely (`{!reduce && <ShineOverlay/>}`) — a clean static link — and the pre-existing global `@media (prefers-reduced-motion: reduce) { * { animation: none } }` is a CSS backstop.
- **Scoped the commit to the intended files** (not `git add -A`) — the working tree still holds several untracked, out-of-scope files from other work (`U-haosu-radosti.webp`, `content-packet/intake/Dalibor-Intake-Form-MK.html`, `content-packet/review-summaries-draft.md`, `scripts/import-review-summaries.mts`, `буники.jpg`). Added only this phase's four files + the state docs explicitly.

### Surprises or off-spec changes
- **The framer→CSS pivot above** is the one material deviation from the brief's implementation path; the *observable result* (subtle caramel hover/focus glint, single sweep, reduced-motion-safe, single `<a>`, accessible name unchanged) matches the brief's intent and Definition of Done exactly.
- **Pre-existing, site-wide accessibility finding — invisible keyboard focus rings (NOT introduced by this phase, NOT fixed here).** While confirming the wordmark's "focus ring intact" requirement I found that the shared focus pattern `outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus` currently computes **`outline-style: none`** even under `:focus-visible`, so no focus ring paints. Root cause is a Tailwind v4 interaction: `.outline-none` sets the ambient `--tw-outline-style: none`, and `.outline-2` sets `outline-style: var(--tw-outline-style)` (reading back `none`); nothing re-asserts `solid` on focus. I verified this is **identical on the wordmark and the `primary-nav` links** (both `outline-style: none`, no box-shadow fallback), i.e. it affects every interactive element site-wide and was already true on `main`. The wordmark preserves those classes **verbatim**, so it behaves exactly like the rest of the site — no regression. axe does **not** detect SC 2.4.7 (Focus Visible), which is why the earlier "axe 0 violations" passes didn't catch it. I **spawned a separate background task** with the diagnosis + suggested design-system-wide fix (`outline-hidden` instead of `outline-none`, or `focus-visible:outline-solid`, or a global `:focus-visible { outline-style: solid }`), and recorded it in `00_stack-and-config.md`. I did **not** fix it in 2.15: it's out of scope for a small wordmark phase, and unilaterally giving only the wordmark a visible ring would both diverge from "preserve the classes verbatim" and be inconsistent with every other control.
- Otherwise none.

### Files written / updated
- `src/components/ui/shiny-button.tsx` — **new.** `ShineOverlay` (the reusable caramel foil glint) + a `ShinyButton` primitive; `useReducedMotion()` gate; CSS-driven sweep.
- `src/components/layout/wordmark.tsx` — **new.** The header wordmark client island (locale-aware `<a href="/">` + `ShineOverlay`, reduced-motion gate).
- `src/components/layout/site-header.tsx` — inline wordmark `<Link>` swapped for `<Wordmark text={t("wordmark")} />`; unused `Link` import removed. Still a Server Component.
- `src/app/globals.css` — added `@property --wordmark-shine-x` + `@keyframes wordmark-shine` (above the reduced-motion block).
- `src/_project-state/current-state.md` — new "Last updated 2.15" running-log entry + a `2.15` phase-status bullet.
- `src/_project-state/file-map.md` — new rows for `ui/shiny-button.tsx` + `layout/wordmark.tsx`; updated `site-header.tsx` + `globals.css` rows.
- `src/_project-state/00_stack-and-config.md` — appended a `2026-07-13 — Phase 2.15` entry (the framer value-animation limitation + CSS-keyframe pattern; the Tailwind v4 focus-ring gotcha).
- `src/_project-state/Part-2-Phase-15-Completion.md` — this report.

### Tests run + results
- **In-browser (`npm run dev`, `--webpack`)** on `/mk` (spot-checked `/en`, `/sr`):
  - **Glint renders** — proven by holding `--wordmark-shine-x` mid-sweep via the Web Animations API: the middle glyphs of "Dalibor Plečić" go warm caramel-gold while the outer glyphs stay espresso; no white blow-out. The gradient resolves to `rgb(168,116,55)` (caramel) → `rgb(234,209,160)` (`#EAD1A0`).
  - **Fires on hover** — with the pointer genuinely over the wordmark (`:hover` true), computed `animation-name: wordmark-shine`, `animation-duration: 0.85s`.
  - **Fires on keyboard focus** — Tab to the wordmark → `document.activeElement` is the link, `matches(':focus-visible')` true, computed `animation-name: wordmark-shine` (the `group-focus-visible:` trigger).
  - **Clean at rest** — no hover/no focus → computed `animation-name: none`; `--wordmark-shine-x` at `100%` (band off-screen).
  - **Accessible name** — the overlay is `aria-hidden="true"`, `pointer-events: none`, `position: absolute`; the link's accessible name is exactly "Dalibor Plečić" (base text node carries it; no `aria-label`).
  - **Locale navigation** — the link's `href` resolves to `/mk` · `/en` · `/sr` in the respective locales (next-intl `Link` preserved).
  - **Layout unchanged** — mobile **375px** (wordmark left + hamburger right, no builder credit inline, no overflow), **1280px** and **1440px** (builder credit still one line "Изработиле Vertex Consulting", full nav + MK·EN·SR switcher on one row, no overflow/collision).
  - **No browser console errors** on any locale.
- **`npm run lint`** — clean.
- **`rm -rf .next && npm run build`** (`--webpack`) — clean; **99/99 static pages** (unchanged — this phase adds no route; only two client components + a CSS keyframe). *(The `~98` in the brief predates 2.14; 99 is the current `main` baseline and 2.15 does not change it.)*
- **axe** (axe-core 4.12.0, tags `wcag2a/2aa/21a/21aa/22aa`, run against the whole document in-browser) — **0 violations** on `/mk`, `/en`, **and** `/sr`. *(axe-core was served from a throwaway `public/__axe.min.js`; the temp file **and** the temp `public/` dir I created for it were both deleted afterward — `git status` confirms neither is present.)*
- **`typegen`** intentionally **not run** — no schema change.
- **Focus-ring caveat:** the wordmark's focus ring computes `outline-style: none`, identical to the site's nav links (see "Surprises"). This is pre-existing and site-wide, not a 2.15 regression; flagged via a spawned task.

### Blocked / carryover items
- **Merge gate:** branch `phase/2.15-shiny-wordmark` (off a `main` that already contains Phase 2.13) is pushed to the `fork` remote; PR opened → `DinovLazar/dalibor-web:main`. **Not merged** — Lazar merges via the GitHub UI (this machine's `gh` is read-only on the upstream).
- **Pre-existing site-wide focus-ring fix** (invisible `:focus-visible` outlines, Tailwind v4) — spawned as a separate task; out of scope for 2.15.
- The untracked, out-of-scope files in the working tree (`U-haosu-radosti.webp`, the intake HTML, review-summaries draft + import script, `буники.jpg`) are deliberately **not** part of this phase's commit.

### What's next
- Lazar's merge of this PR. Go-live sequencing is unchanged by this phase (2.06: promote + drop `PREVIEW_NOINDEX`); the content-side finish remains Dalibor's Studio prose. The flagged focus-ring task is the natural small a11y follow-up.

---
*`00_stack-and-config.md` entry added (2026-07-13) — the framer value-animation limitation + CSS-keyframe pattern is a stack behaviour worth preserving, and the Tailwind v4 focus-ring gotcha was discovered here. No dependency/version/deploy/env change.*
