# Part-1-Phase-07-Completion.md

> **Location in repo:** `src/_project-state/`

---

**Phase ID + name:** 1.07 — Home page (Code)

**Executing Claude:** Code

**Date completed:** 2026-06-07

---

### What shipped
- **Real Style A Home page** at `src/app/[locale]/page.tsx`, working in **mk / en / sr** inside the 1.06 chrome. Four sections, composed from small server components:
  1. **Hero** (`components/home/hero.tsx`) — typographic-only launch variant (centered `<h1>` name + tagline + optional heroIntro + title-page double rule + two CTAs: "Read reviews" → `/reviews`, "About" → `/about`). Also carries a dormant **photo-present** two-column variant that activates automatically once the author uploads a portrait (Part 2).
  2. **Featured book** (`featured-book.tsx`) — full-bleed parchment band: cover + eyebrow + title + "publisher · year" + short blurb + "Read about the book →" → `/book`.
  3. **Latest reviews** (`latest-reviews.tsx` + `review-card.tsx`) — the 3 newest reviews as horizontal "library row" cards (cover left, title/meta/excerpt/topic-chips right), "See all reviews →" → `/reviews`.
  4. **From the blog** (`from-the-blog.tsx` + `blog-card.tsx`) — the 3 newest posts as date-ordered text cards in a 2-up grid, "Read the blog →" → `/blog`.
  - Shared leaves: `cover.tsx` (next/image + graceful §6.11 placeholder) and `section-heading.tsx` (eyebrow + H2 + see-all).
- **`author` singleton extended** with CMS-editable hero text: `tagline` (`localizedString`, **mk-required**) and `heroIntro` (`localizedText`, optional). TypeGen regenerated; seed updated with `[PLACEHOLDER]` values in all three languages and re-imported into `production`.
- **Four typed Home queries** added to `queries.ts` as `defineQuery` (so TypeGen types the results): `HOME_REVIEWS_QUERY` (latest 3 + topics + reviewed-book metadata), `HOME_POSTS_QUERY` (latest 3), `HOME_FEATURED_BOOK_QUERY`, `HOME_HERO_QUERY`. The generic 1.05 queries are left untouched for the proof routes.
- **`next/image` wired for Sanity** — `images.remotePatterns` for `cdn.sanity.io` (scoped to `/images/ndqmaath/**`) in `next.config.ts`; covers render through the optimizer (verified) with no layout shift; decorative card covers use `alt=""`, meaningful images use the localized `alt`.
- **mk→en→sr fallback + "available in:" note** on cards where the active locale's translation is missing — reuses the existing `common.availableIn` string.
- **New `home.*` UI strings** in all three message files; small date helpers (`lib/datetime.ts`, sr→`sr-Latn`) and a monogram helper (`lib/strings.ts`).
- **Page-load reveal** (§8) added to `globals.css` — staggered rise-in on the four blocks, reduced-motion-gated by the existing global block.

### Decisions made on the fly (with why)
- **`author.tagline` / `author.heroIntro` schema extension** (required by the brief §4): `tagline` is `localizedString` with **mk-required** validation (matches the existing title-field convention, since it is the hero's primary line and needs a fallback source); `heroIntro` is optional `localizedText`. Placed next to `roles`. *(Decision the brief explicitly asked me to make.)*
- **Four new `HOME_*` queries instead of reusing the generic ones.** The 1.05 `REVIEWS_QUERY`/`AUTHOR_QUERY` don't slice to 3, don't dereference topics, and the author one lacks the new hero fields. Keeping Home's projections separate keeps Home's data needs self-documenting and decoupled from the list/detail pages built in 1.08–1.10. (`HOME_FEATURED_BOOK_QUERY` overlaps `BOOK_QUERY` by design — Home-scoped projection.)
- **`heroIntro` is rendered** (under the tagline) even though the static 1.03 mockup's typographic hero predates the field — so the new CMS field is visible/testable now and §9's "name + tagline (+ intro if designed)" check is meaningful. Tagline = Body-Large; heroIntro = Body (secondary).
- **Featured-book blurb uses the book's `tagline` field** (a short `localizedString` already in the query), not the Portable-Text `description` — Home's block stays a simple one-liner; the full description belongs to the Book page (1.08).
- **`next/image` covers use `fill` + `sizes` + an aspect-ratio wrapper** (the handover's endorsed alternative to explicit width/height) — cleanest for fixed-2:3 covers that change width across breakpoints without layout shift.
- **Card titles are semantic `<h3>` styled at the H4 size.** The handover calls them "H4" (visual), but the section headings are H2; using `<h3>` keeps the heading order gapless (§10) while matching the H4 type token.
- **Seed fixture date moved.** The Macedonian-only review (`review-mk-only`) was the *oldest* (1.05), so it fell outside Home's "latest 3" window and the fallback/"available in" note could never appear on Home. I bumped its `publishedAt` to be the newest review so the behaviour is demonstrable on Home (and it's realistic — a fresh review often exists in mk first). Verified: on `/en` it shows the mk title + "Available in: MK"; on `/sr`, "Dostupno na: MK".

### Surprises or off-spec changes
- **No placeholder portrait asset added.** The brief offered the option; the handover's launch state (§7.1) is explicitly *typographic-only until the real photo arrives*, and a faux portrait would contradict principle #4 (no skeuomorphism). The hero instead renders typographic-only when `author.photo` is absent and switches to the portrait layout automatically when a photo is uploaded — no placeholder needed.
- **Local build cache caveat (not a product bug).** The build-time Sanity fetch is cached in `.next/cache` (this is what keeps the homes statically generated / `●`). After re-importing the seed, an *incremental* rebuild served stale ordering until `.next` was cleared. On a clean CI/Vercel build this never happens. Content-refresh strategy (ISR/revalidate/webhooks) remains a later-phase concern.
- **Screenshot tool unavailable.** `preview_screenshot` timed out repeatedly (tooling, not the page — eval/snapshot worked throughout). The visual self-check was therefore done structurally: a11y-tree snapshot for composition/order + computed-style inspection for exact tokens (which the preview guidance itself recommends over screenshots for colour/size).

### Visual self-check vs the 1.03 Home mockup (`mockups/home.html`)
- **Section order & composition** match: hero → featured parchment band → latest reviews (single-column horizontal cards) → from-the-blog (2-up grid). ✅
- **Tokens verified by computed style:** hero `<h1>` = Playfair 60px/700, espresso `#2E2218`; eyebrow 13px uppercase `#875621` with **0.78px** tracking (the `:lang(mk)` 0.06em Cyrillic tweak is active); review card = parchment `#EBE0CE`, 14px radius, the warm `--shadow-card`, 20px padding; featured band = parchment with a 1px hairline. No hardcoded colours; all from tokens. ✅
- **Responsive:** review card stacks to a single column below 420px (cover capped 140px); blog grid collapses to one column below `md`. ✅
- **Deviations:** `heroIntro` line shown (mockup predates the field); featured title rendered as the single localized value rather than the mockup's decorative dual-script "„Буники" · *Bunike*" (the localization guardrail prefers one resolved value).

### Files written / updated
- `src/app/[locale]/page.tsx` — **rewritten**: real Style A Home (fetches 4 queries, composes 4 sections).
- `src/components/home/{hero,featured-book,latest-reviews,review-card,from-the-blog,blog-card,section-heading,cover}.tsx` — **new** section/leaf components.
- `src/lib/datetime.ts` — **new**: `formatMonthYear` / `formatFullDate` (sr→sr-Latn).
- `src/lib/strings.ts` — **new**: `monogramOf` (no-cover placeholder initial).
- `src/sanity/lib/queries.ts` — **+4** `HOME_*` `defineQuery` exports.
- `src/sanity/schemaTypes/author.ts` — **+** `tagline` (mk-required) + `heroIntro`.
- `src/sanity/sanity.types.ts` + `schema.json` — **regenerated** (TypeGen).
- `sanity/seed/build-seed.mjs` + `sanity/seed/seed.ndjson` — author hero text; `review-mk-only` date bumped; re-imported.
- `src/messages/{en,mk,sr}.json` — **+** `home.*` strings.
- `src/app/globals.css` — **+** the `.reveal` page-load animation (§8).
- `next.config.ts` — **+** `images.remotePatterns` for `cdn.sanity.io`.

### Tests run + results
- `npm run typegen` → **clean** (8 queries, 23 schema types; new fields + queries typed).
- `npm run lint` → **clean**.
- `npm run build` → **succeeds**; `/mk`, `/en`, `/sr` (and all routes) prerender as static (`●`). TypeScript clean.
- **Dev/preview checks (production server):**
  - All four sections render in mk / en / sr; hero shows name + tagline + intro + CTAs.
  - The one seeded cover loads through `next/image` (`/_next/image?url=…cdn.sanity.io/images/ndqmaath/…`, `complete:true`, `naturalWidth:140`) — remotePatterns works; the 3 cover-less cards show the graceful placeholder.
  - Fallback + note verified: `/en` mk-only review → mk title + "Available in: MK"; `/sr` → "Dostupno na: MK". Serbian dates render Latin (`20. maj 2026.`).
  - All card/CTA links canonical & locale-correct (`/[locale]/reviews/[slug]`, `/[locale]/blog/[slug]`, see-all → `/reviews`, read-blog → `/blog`, featured → `/book`). Language switcher keeps you on Home.
  - Console: **no errors/warnings**.
- **Accessibility quick pass:** single `<h1>`; heading order h1→h2→h3 (no skips); focus-visible Style A rings on links/buttons; decorative covers `alt=""`, placeholder `aria-hidden`; `<time dateTime>`; `<html lang>` per locale; reveal gated behind `prefers-reduced-motion`.
- **Multi-agent adversarial review** (6 dimensions × verify pass) run before commit — see below.

### Multi-agent review outcome
A 6-dimension adversarial review (spec / a11y / i18n / token-discipline / Next-16 / quality), 32 agents, each finding independently verified before counting → **13 confirmed**. Triaged with the "receiving-code-review" discipline (verify, don't blindly apply):
- **Accepted & fixed (4):** hero typographic top space aligned to the spec's `--space-5xl` and moved to scale utilities (`pt-32 pb-20 max-sm:pt-16 max-sm:pb-12`, was `pt-[104px] pb-[72px]`); topic chip height 26→28px + padding to §6.8's 12px (`h-7 px-3`); card focus-ring offset 3px→2px (§2.2/§10 global rule), in both cards; removed redundant `font-bold` on the hero `<h1>`s (the `text-display` token already carries weight 700).
- **Rejected with reason (3):**
  - *Card titles `h3`→`h4` (the highest-volume finding, 4 agents):* rejected. §3.2's "card titles use H4" is the **type-scale size** (applied via `text-h4`), not a semantic level — the table is literally the type scale. Cards nest under section `h2`s, so `h3` is the gapless, correct level (h1→h2→h3). Changing to `<h4>` would introduce an `h2→h4` **skip**, the very §10 violation those agents flagged. Verified the live outline is h1→h2→h3 with no skips.
  - *Remove `sm:pt-0` from FromTheBlog:* rejected — false positive that would regress. `Section`'s base is `py-12 sm:py-16`; without `sm:pt-0`, `sm:pt-16` reasserts top padding at ≥sm and the "flush under reviews" layout breaks. Confirmed the live blog section has `padding-top: 0` at desktop.
  - *Remove `focus-visible:rounded-sm` from the see-all link:* rejected — it matches the established 1.06 header/wordmark focus convention.
- Re-ran `lint` + `build` (clean) and re-verified the affected pieces in the browser after the fixes.

### Blocked / carryover items
- **Single-item pages 404 locally** — review/blog card links target `/[locale]/reviews/[slug]` and `/[locale]/blog/[slug]`, built in **1.09 / 1.10**. Expected sequencing, **not** worked around.
- **Content refresh** — build-time Sanity fetch is cached (keeps Home static). ISR / revalidate / webhooks deferred (later phase).
- **MK "критики" vs "рецензии"** terminology still provisional (carried from 1.04) — Home strings use "критики" to match the live nav.
- **Reading time** on blog cards omitted (the mockup shows "· 4 мин") — needs a body word-count not fetched on Home; revisit with the single-post pages.
- Real photography + real copy → Part 2. Everything Home shows is `[PLACEHOLDER]` seed content.

### What's next
- **1.08 — Book page** (and continuing the styled list/detail pages 1.08–1.11).

---
*Reminder: `current-state.md`, `file-map.md`, and `00_stack-and-config.md` updated alongside this report.*
