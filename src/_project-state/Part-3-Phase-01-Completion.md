# Part 3 · Phase 3.01 · Code — Completion Report

**Date:** 2026-09-04 · **Executing model:** Claude Opus 5, maximum reasoning effort
**Branch:** `phase/3.01-mobile-overhaul` · **Commit range:** `b5eb890..HEAD` (6 commits, branched off `a20d021`)
**Outcome (one line):** The site now has a phone experience that was designed rather than inherited — structured into colour bands, roughly a third to a sixth of its former length, tappable everywhere, and 38% lighter in fonts — with a repeatable harness that measures all of it.

---

## 1. What shipped (plain language)

On a phone, the site used to be one long pale column: the Reviews page ran to about fifteen screens, a single review card took most of a screen, the topic filter ate the whole first screen before you could reach the search box, and a lot of the links were too small to tap reliably. That is all rebuilt. The Reviews page is **12,118px → 3,828px**, one review card is **522px → about 190px**, the topic filter is **312px → 44px** (it is now a row you swipe sideways), the search box moved from 615px down the page to 272px, and the Home page opens with Dalibor's portrait running edge to edge instead of floating as a small card. Every page is now built from alternating cream and parchment bands so the sections read as separate things.

**Every interactive element on every page, in all three languages, at all six phone sizes, now meets the 44×44 touch minimum — measured, not eyeballed.** Before the phase there were about 128 failures per screen size (195–203 in landscape); there are now zero. Fonts dropped from 324KB to 201KB actually downloaded per page.

None of this changed the desktop layout. It did change desktop text sizes slightly, for a reason worth reading in §3.1 and §4.1.

---

## 2. Definition of Done

Evidence lives in `docs/mobile-audit/README.md` (generated from `before/measurements.json` and `after/measurements.json`, 189 measurements each) unless stated otherwise.

### Structure and layout

- ✅ **`.full-bleed` utility exists and is used by the hero, article figures and the section bands, with zero horizontal overflow at 320/360/375/390/430 in mk/en/sr.** Evidence: `full-bleed` in `src/app/globals.css`; used by the Home hero and hero band, the About portrait, and the topic rail. README §5 — horizontal overflow **0 / 162 mobile measurements** before and after, **0 / 27** desktop. It deliberately breaks out by negating `--page-gutter` rather than using `100vw`, so a scrollbar can never make it overflow.
  - ⚠️ **"article figures"**: `blockContent` allows exactly one array member, `type: "block"` — an editor cannot place an image in an article body at all. No figure renderer was written for a block type that cannot occur. The in-article imagery that *does* exist (the About portrait) is full-bleed below `sm`. See §4.2.
- ✅ **Every page below 640px is built from alternating full-bleed cream/parchment bands, and no card sits on a ground of its own value.** Evidence: `.band-cream` / `.band-parchment` in `globals.css`, applied on `src/app/[locale]/page.tsx`; the band sets `--band-card`, which `.card-surface` / `.card-flat` read, so a card inside a parchment band flips to cream with no per-card override. Visible in `after/screens/375x812_mk_home.jpg`: the "latest reviews" cards are cream on parchment, the blog card is parchment on cream.
- ✅ **Card borders `rgb(46 34 24 / 0.20)` on mobile with the agreed soft shadow.** Evidence: `.card-surface` under `@media (width < 40rem)` in `globals.css`; `--shadow-card-mobile: 0 1px 2px rgb(46 34 24 / 0.06), 0 4px 12px rgb(46 34 24 / 0.05)`.

### Density

- ✅ **A review card is ≤ 200px at 375px.** Measured **190px** (`extra.reviewCardHeight`, 375×812 mk). Cover 96×144 left, text right, two-line clamps on title and excerpt.
- ✅ **Reviews page ≤ 5,000px at 375px in all three locales.** mk **3,828**, en **3,684**, sr **3,651** (from 12,118 / 11,524 / 11,299).
- ❌ **Home ≤ 3,200px at 375px.** Achieved **3,447** (mk) and **3,333** (en/sr), from 4,181 / 4,028 — a −18% reduction, 247px short of the target. Not met; see §4.3 for the arithmetic, which is that two other DoD items add height.
- ✅ **Topic filter ≤ 60px, snap-scrolling, active chip in view.** Measured **44px** (from 312px). Verified live: on `/mk/reviews` the rail's `scrollLeft` is 0 with "Сите" visible; on `/mk/reviews?topic=contemporary-fiction` (the last chip, 1,695px into a 2,069px rail) the rail scrolls it fully into view while `window.scrollY` stays **0** — `block: "nearest"` stops it dragging the page.
- ✅ **Search input above the topic filter; placeholder not clipped at 320px in any locale.** `extra.searchTop` 615 → **272**; first result 737 → 458. `extra.placeholderClipped` is `false` at every viewport in every locale (it was `true` at 320px in all three and at 360px in mk).

### Touch and accessibility

- ✅ **Every interactive element ≥ 44×44 at 320/375/430 in all three locales — zero exceptions.** README §4: **0** sub-44 targets at every one of the six mobile viewports × three locales, down from ~128 each (195–203 in landscape). The 28 remaining entries are tagged `inline` — links inside a sentence, which WCAG 2.2 SC 2.5.8 explicitly exempts and which would be *harder* to tap if enlarged, because adjacent lines' hit areas would overlap.
- ✅ **Skip link passes SC 2.5.8.** Was 32×16; now `min-h-11 min-w-11` with padding when focused, and positioned with `max(1rem, env(safe-area-inset-*))`.
- ✅ **Mobile menu: focus trap, Escape, focus returns to hamburger, background inert, usable at 320px.** Base UI's `Dialog` (via `ui/sheet.tsx`) provides the modal trap, Escape and backdrop dismiss; `mobile-menu.tsx` additionally moves focus into the panel on open and back to `[data-slot="sheet-trigger"]` on close, explicitly and synchronously. The panel gained `safe-top` + `page-gutter` this phase. Harness: 0 sub-44 targets at 320px.
- ✅ **Language switcher 44×44 with `aria-current`.** Was 37×35 / 35×35 / 41×35; now `pointer-coarse:min-h-11 min-w-11`. `aria-current="true"` was already present and is kept — see §3.4.
- ✅ **No text colour pair regressed.** All **31** `--color-*` tokens are byte-identical to pre-phase `main` (checked programmatically against `git show a20d021:src/app/globals.css`). Footer alphas unchanged: links `on-footer/[88%]`, headings `/70`, copyright `/80`, dividers `/20`.

### Performance and platform

- ⚠️ **Hero carries `priority`/`fetchPriority="high"`, correct `sizes`, explicit dimensions; LCP < 2.5s and CLS < 0.1 on Home.**
  - ✅ The image part is done and independently confirmed: Lighthouse's `lcp-discovery` insight scores **1**, with all three checks passing — `fetchpriority=high` applied, request discoverable in the initial document, not lazily loaded. On the pre-phase build the same audit reported `priorityHinted: false`. The LCP element is the hero `<img>`.
  - ✅ **CLS = 0.000** on all six audited pages.
  - ❌ **LCP < 2.5s not met locally: 4.19s on Home** (from 6.6s pre-phase, −37%). See §4.4 — the observed breakdown sums to ~150ms and the 4.19s is Lighthouse's slow-4G *simulation* over `next start`.
- ❌ **Lighthouse mobile ≥ 95 on all four categories for the six pages.** Measured: Performance **80–91**, Accessibility **100** on all six, Best Practices **96**, SEO **92**. Best Practices and SEO are localhost artifacts with a single failing audit each (§4.4); Performance is a genuine miss.
- ✅ **Font faces trimmed, `display: swap`, before/after byte total recorded.** README §7: `@font-face` rules **68 → 24**, font CSS **31,302 → ~14,500 bytes**, preload links **8 → 4**, preloaded bytes **244,436 → 118,648 (−51.5%)**, files actually downloaded **12 → 8**, **bytes actually downloaded 324KB → 201KB (−38%)**. `display: "swap"` unchanged.
  - ⚠️ **Per-locale preload not implemented** — see §4.5.
- ✅ **`env(safe-area-inset-*)` on the sticky header, mobile menu and footer, verified in landscape.** `safe-top` on the header and the menu, `safe-bottom` on the footer, and `page-gutter` widens every container's side padding with `max(gutter, env(...))`. `viewport-fit=cover` is set — without it every inset is 0 and the CSS would be dead code. 844×390 landscape: 0 sub-44 targets, 0 overflow.
- ✅ **`theme-color`, `apple-touch-icon` and `manifest.webmanifest` exist and are correct per locale.** Verified in the served HTML on `/mk` and `/en`: `<meta name="theme-color" content="#F4EDE1">`, `<link rel="manifest" href="/manifest.webmanifest">`, `<link rel="apple-touch-icon" ... sizes="180x180">`. The `viewport` export lives in the locale layout, so it is emitted per locale. `apple-icon.png` already existed via the file convention; the manifest is new (`src/app/manifest.ts`).

### Non-regression

- ⚠️ **Desktop at 1024/1280/1440 visually unchanged, proven by screenshots.** No breakpoint, grid, spacing rule or component structure above 640px was touched, and desktop horizontal overflow stays 0/27. But **27 of 27 desktop measurements shifted by −70…+9px**, from one deliberate fix, plus two smaller changes that follow from the brief's own wording. All three are itemised in §3.1–§3.3 and in README §6. Screenshots: `before/screens/` and `after/screens/`, `1024x800_*`, `1280x900_*`, `1440x900_*`.
- ✅ **`npm run build` passes with no new warnings; no new dependency.** Build exit **0**, `npm run lint` exit **0** with no output, `npx tsc --noEmit` exit **0**. `dependencies` and `devDependencies` are byte-identical to pre-phase `main`, and **`package-lock.json` is identical** — only three `scripts` entries were added (`audit:mobile`, `audit:report`, `audit:lighthouse`).
- ✅ **`docs/mobile-audit/README.md` contains the full before/after table and the Lighthouse scores.** 8 sections.

### Process

- ✅ Work on `phase/3.01-mobile-overhaul`, branched off a synced `main` (`git fetch` clean, 0 ahead / 0 behind at start).
- ✅ `current-state.md`, `file-map.md` and `00_stack-and-config.md` updated (§6).
- ✅ This report is filed and every independent decision is named in §3.
- ⏳ The branch is pushed and the merge question asked; `main` untouched.

---

## 3. Decisions I made during this phase

### 3.1 Fixed a latent `tailwind-merge` defect, accepting a desktop text-size change · **needs a decision-log entry: YES**

While chasing a 40px desktop delta I found that `tailwind-merge` classifies every Style A type token (`text-h1`, `text-meta`, `text-chip`, `text-body`, …) as a text **colour**, because it only knows Tailwind's stock scales. Any `cn()` call that put a size before a colour silently dropped the size: `cn("text-h4 text-text")` returned `"text-text"`, and the element fell back to the inherited 16px.

- **Decision:** fix it in `src/lib/utils.ts` with `extendTailwindMerge`, declaring the scale as the `font-size` group.
- **Why:** it had been quietly disabling parts of the locked type scale on desktop for many phases, and it would have disabled *the entire new phone type scale* this phase builds — the phase's central deliverable would have been inert in every `cn()`-composed component.
- **Consequence, and it is a real one:** restoring the designed sizes moves 27 desktop measurements by −70…+9px. The most visible instance is the Reviews topic-chip row, which now sets at its designed 13px/600 instead of an accidental 16px/400 and therefore wraps to fewer lines at 1280/1440.
- **Alternative rejected:** leave the defect and hard-code the phone sizes around it — that would have meant shipping a type system that silently lies, and re-introducing exactly the `max-sm:text-[…]` escape hatches this phase deleted.

### 3.2 The Reviews search box is above the topic filter at **all** widths, not only on mobile · **needs a decision-log entry: YES**

Workstream B.1 says "Reorder the head of the page: H1 → intro line → search box → topic filter → results. Search is the primary tool." The phase's scope line says "everything that renders below 640px."

- **Decision:** apply the reorder at every width.
- **Why:** scoping it to mobile only requires either rendering the filter twice in the DOM (two `<nav>` landmarks with the same label — a genuine accessibility defect) or using CSS `order` to show it above while it sits below in the DOM (a visual/focus order mismatch — SC 2.4.3). Both are worse than a small, defensible desktop change, and the rationale for search-first is not mobile-specific.
- **Alternative rejected:** the two above.

### 3.3 The Reviews search placeholder is the short string at all widths · **needs a decision-log entry: minor**

A placeholder is an HTML attribute and cannot be varied by media query without duplicating the input or using JavaScript.

- **Decision:** show `common.searchPlaceholderShort` everywhere; keep the full instruction as the input's accessible name (`<label class="sr-only">` still reads `common.searchPlaceholder`) and as the visible helper text below.
- **Why:** the long string was clipped at 320px in all three locales and at 360px in mk; nothing is lost because the full text remains in both the accessible name and the visible help.
- **Copy added** (this is the only copy change in the phase — no existing string was reworded or deleted):
  - mk `common.searchPlaceholderShort` = "Пребарувај по тема…" (was "Пребарувај критики по тема…")
  - en = "Search by topic…" (was "Search reviews by topic…")
  - sr = "Pretraži po temi…" (was "Pretraži kritike po temi…")

### 3.4 Touch sizing keys off `pointer: coarse`, not viewport width · needs a decision-log entry: no

The first pass scoped every touch fix with `max-sm:`. The harness then showed **195–203 failures at 844×390** — a phone in landscape is 844px wide, so every width-based rule switches off exactly where a thumb still needs the room. Sizing rules moved to the `pointer-coarse:` variant; layout rules (single-column footer, dividers, full-width buttons) stayed width-based. This also covers touch tablets. Rejected: adding a landscape-specific breakpoint, which would have been a third thing to keep in sync.

### 3.5 Enlarging targets by real height, not only by pseudo-element hit areas · needs a decision-log entry: no

`.tap-target` grants a 44×44 hit area via a transparent `::before` without changing the painted control. The harness proved that is not always enough: **stacked small controls' granted areas overlap, and the later sibling in paint order steals the taps** — which is why the footer failed in an alternating pattern (Instagram, Booksa, Versopolis, Интервју 1/2 failed while Facebook, Partizanska, Интервју 3 passed). Where controls stack, they got real height instead (44px footer rows, 44px contact rows, 36px chips at a 48px pitch). The pseudo-element is reserved for isolated controls.

### 3.6 Which i18n keys were added · needs a decision-log entry: no

Three, in all three locales, all additive: `common.backToTop`, `common.searchPlaceholderShort`, `common.showAllReviews` ("Прикажи ги сите {count} критики" / "Show all {count} reviews" / "Prikaži svih {count} kritika"). The existing `common.loadMore` was left untouched.

### 3.7 Other choices worth naming

- **Hero CTA stacking breakpoint.** The brief says "stacked below 380px, side-by-side above." I used the design system's existing `xs` = 420px rather than introducing a 380px breakpoint, because 420px is where two Macedonian labels stop fitting side by side and the system already owns that stop.
- **Topic chips are hidden on the review card below `sm`.** The ≤200px card height was the hard requirement and the chips were the only element with no budget left; the topic filter directly above the list exposes the same taxonomy. Desktop keeps them.
- **The Reviews archive is capped at 12 on a phone** with a "show all 20" button. The server renders all 20 and only an effect applies the cap, so a reader with JavaScript off sees the full list; the hidden cards are `display: none`, so they leave the tab order and the accessibility tree rather than being merely invisible.
- **The back-to-top control is phone-only** and does not animate its position — `.to-top` transitions opacity/visibility only — so there is nothing for `prefers-reduced-motion` to switch off, and it moves focus to `<main id="content">` after the jump so a keyboard user is not stranded.
- **The article back-link split.** The link at the *end* of an article became a real 48px full-width button; the one above the title stayed a link (a button there would shout louder than the title) but got real 44px height on touch.
- **`--text-eyebrow--font-weight: 600` is scoped to mobile.** §3.2 of the handover specifies 600 for eyebrows and the live desktop inherits 400 — a real deviation from the locked design, but fixing it site-wide would be another desktop change this phase should not make. Flagged for a future phase.
- **Section padding is 40px on a phone**, down from 48px, because the alternating band colours now carry the separation that padding used to carry alone.

### 3.8 The parallel-subagent instruction could not be carried out

The phase requires Workstreams B–E to run as parallel subagents, and they were dispatched exactly that way, in one message, with self-contained briefs and explicit non-overlapping file ownership. **All four stalled on the agent-stream watchdog ("no progress for 600s") without writing a single file** — `git status` showed no modifications from any of them after roughly two hours. Workstream D was resumed once and stalled again. I completed B, C, D and E in-session instead. The dispatch design (file ownership, typecheck-only verification, no concurrent servers) is preserved in the transcript should this be retried on a less loaded machine.

---

## 4. Deviations from the brief / spec

### 4.1 Desktop is not byte-identical — three changes, all itemised

§3.1 (type-size restoration, affects all pages by −70…+9px), §3.2 (Reviews search above the filter), §3.3 (short placeholder). No desktop breakpoint, grid, spacing rule or component structure was touched, and desktop overflow stays 0/27. README §6 carries the full table and the explanation.

### 4.2 No article-figure renderer (Workstream D.4)

`src/sanity/schemaTypes/blockContent.ts` allows exactly one array member, `type: "block"` — no image member exists, so an image cannot appear in an article body. Writing a renderer for it would be code for a state that cannot occur. D.4's remaining work (paragraph and heading rhythm, blockquote and list indents halved on a phone) was done, and the About portrait — the one piece of real in-article imagery — is full-bleed below `sm`.

### 4.3 Home is 3,447px, not ≤3,200px

The arithmetic, plainly: Home went **4,181 → 3,447** (−734, −18%), against a target that needed −981. Two other DoD items *add* height, and both are mandatory (all four figures measured live at 375px):

| | before | after | Δ |
|---|---:|---:|---:|
| hero image (inset 4:5 card → full-bleed 3:4) | 419 | **500** | **+81** |
| footer (33px links → 44px touch rows) | 736 | **818** | **+82** |

So **+163px** of required additions sit inside that −734. Even with both reverted the page would land near **3,284px** — still ~84px over the 3,200 target. I trimmed what could honestly be trimmed (section padding 48 → 40px on a phone, featured-book padding, footer top padding) and stopped short of removing content, which the DoD forbids. The target as written is not reachable alongside the phase's own hero and touch-target requirements; closing the gap needs a content decision, which is Lazar's call, not mine.

### 4.4 Lighthouse: Accessibility 100 everywhere; Performance 80–91; BP 96 and SEO 92 are localhost artifacts

| page | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| home | 86 | 100 | 96 | 92 | 4.19s | 0.000 | 40ms |
| reviews | 91 | 100 | 96 | 92 | 3.46s | 0.000 | 10ms |
| review-detail | 80 | 100 | 96 | 92 | 5.27s | 0.000 | 13ms |
| blog | 90 | 100 | 96 | 92 | 3.59s | 0.000 | 68ms |
| blog-post | 90 | 100 | 96 | 92 | 3.52s | 0.000 | 4ms |
| contact | 91 | 100 | 96 | 92 | 3.53s | 0.000 | 11ms |

Home before → after: Performance **77 → 86**, LCP **6.6s → 4.19s**.

- **SEO 92** — the only failing audit is `canonical`, explanation *"Points to another hreflang location"*: the build emits the production canonical while Lighthouse loads `localhost`. Passes on the real domain.
- **Best Practices 96** — the only failing audit is `errors-in-console`, and the only console error is a 404 for `/_vercel/insights/script.js` (Vercel Analytics, which exists only when deployed on Vercel).
- **Performance** — a real miss. On Home the *observed* LCP breakdown is TTFB 12ms + resource load delay 15ms + load duration 12ms + element render delay 110ms ≈ **150ms**; the 4.19s is Lighthouse's slow-4G simulation applied to a `next start` server with no HTTP/2, no CDN and no edge image cache. I tested one hypothesis directly — dropping font preloading entirely — and it made things **worse** (Performance 79, LCP 5.8s), so the current 4-file preload is kept. Phase 2.05 already recorded mobile Performance 79 on real Vercel infra and attributed it to a webfont-LCP lab artifact; this phase's −38% font payload targets exactly that. **The authoritative re-measure is on Vercel after deploy.**

### 4.5 Per-locale font preload not implemented

`next/font/google` cannot emit locale-specific preloads for a shared family. Splitting by subset would make each script a separate font *family*, and since font fallback is per-glyph the two scripts would then render from different families — with different vertical metrics — inside the same heading. The site genuinely mixes scripts on every page (the wordmark "Dalibor Plečić" is Latin on `/mk`, and review book titles carry an alternate-script subtitle), so this is not hypothetical. The variable-font switch plus the italic split delivered a larger win (−51.5% preloaded, −38% downloaded) than per-locale preloading would have (~42KB on `/en` only).

### 4.6 The portrait is resolution-limited — **action needed from Dalibor**

**The hero portrait in Sanity is 720×720, cropped by the editor to 576×720.** A full-bleed phone hero at 430px on a 3× screen needs **≥1290×1720**. The image previously requested `.width(800).height(1000)` — asking for pixels that do not exist. It now requests **576×720**, the honest maximum, with `crop("focalpoint")` so the CDN honours the asset's hotspot instead of trimming from the left edge.

**A higher-resolution portrait is needed from Dalibor: at least 1290×1720, portrait orientation, with room around the face so a 3:4 phone crop and a 4:5 desktop crop both work.** Until then the phone hero is being upscaled by the browser.

---

## 5. Changed files / deliverables

**Commit range:** `b5eb890..HEAD` on `phase/3.01-mobile-overhaul` — 6 commits, 46 files, +2,096 / −165.

| Commit | What |
|---|---|
| `b5eb890` | Harness + "before" baseline evidence |
| `b2c8f3b` | Workstream A — mobile foundations (tokens before components) |
| `86e653b` | `tailwind-merge` fix + baseline recapture with the corrected harness |
| `65220b4` | Workstream D — reading experience |
| `9c93c14` | Workstreams B, C, E — density, hero, chrome |
| *(final)* | Evidence, report, state files |

**New files (7):** `scripts/mobile-audit.mts`, `scripts/mobile-audit-report.mts`, `scripts/lighthouse-mobile.mts`, `src/app/manifest.ts`, `src/components/layout/back-to-top.tsx`, `src/components/reviews/list-cap.tsx`, `src/components/topic-rail.tsx`.

**Edited (39):** `src/app/globals.css` (the foundation), `src/lib/utils.ts` (the merge fix), the locale layout (fonts, viewport, manifest), all nine route files, and the layout / home / reviews / blog / contact component sets. Full list in `git diff --name-only a20d021..HEAD`.

**Evidence:** `docs/mobile-audit/README.md`, `docs/mobile-audit/before/` and `after/` (189 measurements + 63 screenshots each), `docs/mobile-audit/lighthouse.json`.

**No secrets were read, written or printed.** `.env.local` was not modified; the Lighthouse build was given `NEXT_PUBLIC_SITE_URL` inline on the command line (a public, non-secret value) so the SEO score would not be capped by a localhost canonical.

---

## 6. State updates done

- ✅ `src/_project-state/current-state.md` — new "Last updated" snapshot, a 3.01 phase-status line, the three new client islands under "Components built", and a rewritten "Known issues" naming the desktop delta, the Home height gap, the portrait resolution limit and the Lighthouse position.
- ✅ `src/_project-state/file-map.md` — the `globals.css` row extended with the mobile foundation, new rows for `manifest.ts`, `topic-rail.tsx`, `back-to-top.tsx` and the three scripts, and a new section for `docs/mobile-audit/`.
- ✅ `src/_project-state/00_stack-and-config.md` — dated append covering the no-dependency confirmation, the font before/after table, the `tailwind-merge` configuration, the viewport/platform additions, the `pointer: coarse` rationale, and the local-measurement caveat.

---

## 7. Risks, follow-ups, what the next phase needs to know

1. **The `tailwind-merge` list must stay in sync** with the `--text-*` tokens in `globals.css`. Adding a token without adding it to `src/lib/utils.ts` re-introduces the silent-drop bug for that token.
2. **Re-measure Lighthouse on Vercel after deploy.** The local Performance numbers understate production, and the Best Practices and SEO deductions disappear there.
3. **The portrait request in §4.6 is the one thing blocking a fully sharp phone hero.**
4. **`docs/mobile-audit/` is ~24MB** of committed JPEG evidence across the two sets. That is deliberate — the DoD asks for before/after screenshots — but it is worth knowing before the next evidence-heavy phase.
5. **The harness is reusable and cheap:** `npm run audit:mobile -- --out <dir>` then `npm run audit:report`. Run it after any layout change. It needs a running `next start` and Chrome; `--from`/`--to`/`--append` split long runs, and it recycles the browser every 24 pages because headless Chrome destabilises after a few dozen tall full-page captures.
6. **Two harness bugs were found and fixed during the phase**, and both would have produced false results: `document.fonts.ready` can resolve before a face that nothing has requested yet begins loading, so pages were measuring in the Georgia fallback and chip rows wrapped differently between runs; and a prose link that wraps across two lines has a bounding-box centre that lands *between* its line boxes, so it was reported "obscured" instead of inline-exempt. The `before/` set was recaptured from a pristine worktree of `a20d021` with the final harness, so both sets come from the same instrument.
7. **Not verified on real hardware.** Everything here is Chrome device emulation. Safari on iOS differs most in `env(safe-area-inset-*)` behaviour and in `-webkit-overflow-scrolling` momentum on the chip rail — worth a real-device pass before launch.

---

## 8. What's now possible that wasn't before

Dalibor can hand someone his phone and let them read — the Reviews archive is browsable in a few swipes instead of fifteen screens, every link takes a thumb, and the page has a shape.


---

## Addendum — post-merge production measurement (2026-09-04)

§4.4 left one item open: "the authoritative re-measure is on Vercel after deploy."
The merge deployed (`588ce44`, production status `success`), and it has now been
measured. Nothing above is edited; this is the answer to that open item.

**Live checks on `https://www.daliborplecic.com/mk`:** `/mk`, `/mk/reviews` and
`/manifest.webmanifest` all 200; `viewport-fit=cover`, `theme-color #F4EDE1`,
`<link rel="manifest">` and the correct production canonical are all present;
4 font preloads (was 8); no `noindex`.

**Lighthouse mobile, same machine, back-to-back runs.** "Before" is the previous
production deployment of `a20d021` (`dalibor-pj6zawgt6…`), still served by Vercel,
so this is a true production-to-production comparison rather than a localhost one.

| | before (`a20d021`) | after (`588ce44`) |
|---|---:|---:|
| **Performance** | **60** | **74** |
| Accessibility | — | **100** |
| Best Practices | — | **100** |
| SEO | — | **100** |
| LCP | 9.1 s | **5.0 s** (−45%) |
| FCP | 3.2 s | **2.2 s** (−31%) |
| TBT | 250 ms | **90 ms** (−64%) |
| Speed Index | 5.6 s | 5.5 s |
| CLS | 0 | **0** |

Two things this settles:

1. **Accessibility, Best Practices and SEO are all 100 in production**, exactly as
   §4.4 predicted — the 96/92 seen locally were the Vercel-Analytics 404 and the
   localhost-vs-production canonical, and both disappear on the real domain. Three
   of the four DoD Lighthouse categories are met.
2. **Performance improved by 14 points and LCP by 4.1 seconds**, but at 74 it is
   still short of the ≥95 bar, so that DoD item remains ❌. (Phase 2.05's recorded
   79 is not comparable — measured at a different time on different content; the
   pre-phase build measured 60 on today's run.)

**Where the remaining time goes, and what the next lever is.** The production LCP
breakdown is TTFB 184 ms + **element render delay 2,388 ms**, with no resource
load phase — meaning the LCP element in production is *text*, blocked behind the
render-blocking stylesheet and the webfonts, not the hero image. Fonts are still
**203 KB across 8 files** on the critical path even after this phase halved the
preload. The next real gain is character-level subsetting (self-hosted woff2
subset to the glyphs actually used), which `next/font/google` cannot do — it is a
phase of its own, not a tweak. Secondary: `image-delivery-insight` flags ~30 KB on
the featured-book cover, which is a lazy-loaded below-fold image and does not
affect LCP.

The portrait request in §4.6 stands and is now doubly motivated: a correctly-sized
source also stops the browser being served an upscaled hero.
