# Part 1 · Phase 1.03 — Design system & visual direction

**Style A · "Hardcover" — the authoritative, implementation-ready spec.**
This document is the single visual blueprint for every later build phase. Where a value is given, it is final — there is no "TBD". Each Code phase can lift its section directly.

- **Author:** Claude Design · **Date:** 2026-06-06
- **Stack target:** Next.js 16 (App Router) · TypeScript · Tailwind CSS **v4** (CSS-first `@theme`, no `tailwind.config.js`) · shadcn/ui (Radix) · Lucide · Framer Motion · next-intl (`mk` default / `en` / `sr`) · Sanity · fonts via `next/font/google`.
- **Companion mockups:** `docs/design-handovers/mockups/` (`components.html`, `home.html`, `reviews-list.html`, `single-review.html`). **If a mockup and this document ever differ, this document wins.**

> **Reading order for Code:** §2 (paste the `@theme` block) → §3 (load fonts) → §6 (build components, restyling shadcn/ui primitives) → §7 (compose pages) → §8/§10 (motion + a11y pass).

---

## Table of contents
1. [Design principles](#1-design-principles-north-star)
2. [Colour tokens](#2-colour-tokens)
3. [Typography](#3-typography)
4. [Spacing, radius, shadow, borders, breakpoints](#4-spacing-radius-shadow-borders-breakpoints)
5. [Iconography (Lucide)](#5-iconography-lucide)
6. [Components](#6-components)
7. [Page layouts (all ten)](#7-page-layouts)
8. [Motion](#8-motion)
9. [Imagery & alt-text](#9-imagery--alt-text)
10. [Accessibility — WCAG 2.2 AA](#10-accessibility--wcag-22-aa)
- [Appendix A — Paste-ready `@theme` block](#appendix-a--paste-ready-theme-block-globalscss)
- [Appendix B — Raw `:root` custom properties](#appendix-b--raw-root-custom-properties-non-tailwind-reference)
- [Appendix C — `next/font/google` setup](#appendix-c--nextfontgoogle-setup)
- [Appendix D — Placeholder content used in mockups](#appendix-d--placeholder-content)

---

## 1. Design principles (north star)

Six short rules. Sanity-check every screen against them.

1. **The words are the hero.** Type, measure, and whitespace carry the design. Chrome recedes; the writing comes forward.
2. **One accent, used sparingly.** Caramel is the only colour with a voice. If a screen has two competing accents, one is wrong.
3. **Ornament is rare and deliberate.** Exactly one flourish — the drop cap on long-form articles. Everything else earns its place by function.
4. **Editorial restraint, not skeuomorphism.** The "hardcover" feeling is achieved with paper-tone colour, serif type, and generous margins — **never** with grain textures, faux page-edges, or leather. (Decision #26.)
5. **Accessible by construction.** Every pair meets WCAG 2.2 AA, every control is keyboard-operable with a visible focus ring, motion is optional. Anything that can't meet AA is flagged, not shipped.
6. **Calm, generous, unhurried.** Comfortable reading measure (~66–72 characters), roomy line-height, quiet motion. The site should feel like a well-made book, not an app.

---

## 2. Colour tokens

The locked palette, used with discipline. **No dark mode in v1** (Decision #14).

### 2.1 Palette → semantic token map

| Brand name | Hex | Semantic token | Role |
|---|---|---|---|
| Cream | `#F4EDE1` | `--color-bg` | Page background |
| Parchment | `#EBE0CE` | `--color-surface` | Cards / raised surfaces |
| Espresso | `#2E2218` | `--color-text` | Primary text |
| Muted *(derived)* | `#6F5D46` | `--color-text-muted` | Secondary text — **finalized; see 2.4** |
| Caramel | `#A87437` | `--color-primary` | Accent: active underline, focus base, chip/rule, drop cap (non-text / ≥3:1 uses) |
| Deep caramel *(derived)* | `#875621` | `--color-primary-strong` | Accent for **text & solid fills**: links, primary-button fill (AA-safe) |
| Walnut | `#5B4228` | `--color-primary-hover` / `--color-footer` | Hover, deep accent, footer ground |
| Near-cream *(derived)* | `#FBF7EF` | `--color-on-primary` / `--color-on-footer`* | Label on filled accent / footer text |
| — | `rgb(46 34 24 / 0.12)` | `--color-border` | Hairlines / dividers |
| Taupe *(derived)* | `#82745F` | `--color-border-strong` | Input & UI-component boundaries (need ≥3:1) |
| Deep caramel | `#875621` | `--color-focus` | Focus ring |

\* Footer text uses pure Cream `#F4EDE1` (`--color-on-footer`) — it reads slightly warmer than `#FBF7EF` against walnut and still scores 8.0:1.

> **Two ambers, one hue, clear rule.** `--color-primary` (caramel `#A87437`) is the brand note but is **never** placed behind or as normal-size text (it physically cannot reach 4.5:1 — see 2.5). `--color-primary-strong` (deep caramel `#875621`) is the same hue, darkened toward walnut exactly as the brief prescribed, and is used wherever the accent must carry text or sit as a solid fill behind text. This is a tint/shade pair, not a second accent — it does **not** break "one accent only".

### 2.2 Interaction states

**Inline text link**
| State | Token / treatment |
|---|---|
| Default | `--color-primary-strong` `#875621`, underline `1px` at ~`0.12em` offset, `text-underline-position: from-font` where supported |
| Hover | `--color-primary-hover` (walnut `#5B4228`), underline thickens to `2px` |
| Focus-visible | text colour unchanged + `2px` `--color-focus` outline, `2px` offset |
| Visited | walnut `#5B4228` (distinguishable from default without relying on colour alone — the underline persists) |

**Primary button** (caramel-family fill, see 2.5)
| State | Fill | Label | Notes |
|---|---|---|---|
| Default | `--color-primary-strong` `#875621` | `--color-on-primary` `#FBF7EF` | label 5.8:1 |
| Hover | `--color-primary-hover` `#5B4228` | `#FBF7EF` | 8.7:1; subtle `translateY(-1px)` |
| Active | `#4A351F` (walnut −8%) | `#FBF7EF` | press, no lift |
| Disabled | `--color-surface` `#EBE0CE` | `--color-text-muted` `#6F5D46` | `cursor: not-allowed`, `opacity` left at 1 (use the muted pair, not transparency, to keep contrast legible) |
| Focus-visible | unchanged fill | unchanged | `2px` `--color-focus` outline, `2px` offset |

**Focus ring (global):** `outline: 2px solid var(--color-focus); outline-offset: 2px;` The 2px offset sits in the page/parent colour, so the ring stays visible even on a caramel or walnut button. `#875621` on cream = 5.3:1 (≥3:1). Never remove the outline without an equal-or-better replacement.

### 2.3 Contrast results (WCAG 2.2 AA)

Measured with the sRGB relative-luminance formula. AA = **4.5:1** normal text, **3:1** large text (≥24px regular / ≥18.66px bold) and non-text UI.

| Pair | FG | BG | Ratio | Verdict |
|---|---|---|---|---|
| Body text | Espresso `#2E2218` | Cream `#F4EDE1` | **13.3:1** | ✅ AAA |
| Body on card | Espresso `#2E2218` | Parchment `#EBE0CE` | **11.8:1** | ✅ AAA |
| Muted text | Muted `#6F5D46` | Cream | **5.42:1** | ✅ AA |
| Muted on card | Muted `#6F5D46` | Parchment | **4.83:1** | ✅ AA |
| Link text | Deep caramel `#875621` | Cream | **5.34:1** | ✅ AA |
| Link on card | Deep caramel `#875621` | Parchment | **4.76:1** | ✅ AA |
| Button label | `#FBF7EF` | Deep caramel `#875621` | **5.81:1** | ✅ AA |
| Button hover label | `#FBF7EF` | Walnut `#5B4228` | **8.72:1** | ✅ AAA |
| Footer / cream-on-walnut | Cream `#F4EDE1` | Walnut `#5B4228` | **8.0:1** | ✅ AAA |
| Input boundary | Taupe `#82745F` | Cream | **3.91:1** | ✅ (UI ≥3:1) |
| Input boundary on card | Taupe `#82745F` | Parchment | **3.49:1** | ✅ (UI ≥3:1) |
| Focus ring | `#875621` | Cream | **5.34:1** | ✅ (UI ≥3:1) |
| Active underline / chip border | Caramel `#A87437` | Cream | **3.46:1** | ✅ (UI/large ≥3:1) |

### 2.4 Derived colours that were adjusted (and why)

- **Muted text — changed from the brief's `~#7C6C57` to `#6F5D46`.** `#7C6C57` scores **4.36:1 on cream** and worse on parchment — it **fails** AA for normal text. Secondary text (card excerpts, bylines) appears on *both* cream and parchment, so the binding constraint is parchment. `#6F5D46` clears both: **5.42:1 / 4.83:1**. Noted per the brief's instruction to finalize and verify.
- **Border (hairline) `rgb(46 34 24 / 0.12)`** ≈ effective `#DCD5C9` over cream. Decorative only (dividers, card edges) — no contrast minimum applies.
- **Input boundary `#82745F` added.** A 12% hairline is far below the **3:1** that WCAG 1.4.11 requires for an interactive control's boundary. Inputs, the search field, and the secondary-button outline use `--color-border-strong` (3.91:1 / 3.49:1) instead.

### 2.5 The caramel rule (verified carefully, as required)

Caramel `#A87437` **cannot** host normal-size text at AA. Best cases:

| Pair | Ratio | Verdict |
|---|---|---|
| White `#FFFFFF` on caramel | **4.03:1** | ✗ fails normal text (4.5) |
| Near-cream `#FBF7EF` on caramel | **3.77:1** | ✗ fails normal text; ✅ large/UI (≥3:1) |
| Cream `#F4EDE1` on caramel | **3.46:1** | ✗ fails normal text; ✅ large/UI |
| Espresso `#2E2218` on caramel | **3.84:1** | ✗ fails normal text; ✅ large/UI |

**Therefore, the rule (enforce everywhere):**
- ❌ **Never** use caramel `#A87437` as a fill behind normal-size text, and **never** as inline link text.
- ✅ **Links & primary-button fills** use `--color-primary-strong` `#875621` (≥4.76:1). This is what makes button labels legible at any size.
- ✅ **Caramel `#A87437` is reserved for ≥3:1 roles only:** the active-page underline, focus-ring base, topic-chip & quiet-button outlines, decorative/section rules, and the **drop cap** (a ~3-line-tall letter is unambiguously "large text" → 3.46:1 passes). All verified ≥3:1.

---

## 3. Typography

Two families, both with **`latin` + `cyrillic`** subsets. Display = **Playfair Display**; body/UI = **Lora**.

### 3.1 Weights actually used (load only these)

- **Playfair Display:** `600` (H2–H4, wordmark, card titles), `700` (Display, H1, drop cap), `500 italic` (pull-quotes).
- **Lora:** `400` (body prose), `500` (UI labels, buttons, meta, bylines, eyebrows), `600` (chips, inline strong, small section labels), `400 italic` (in-prose emphasis, captions).

(`next/font` config in **Appendix C**.)

### 3.2 Type scale

Modular, ~1.25 between heading steps; body set at **18px** for comfortable literary reading. "Mobile" = the value below `sm` (640px). Tailwind utility = the `--text-*` token from the `@theme` block (e.g. `text-h1`).

| Role | Font / weight | Desktop size (rem / px) | Line-height | Letter-spacing | Mobile (rem / px) | Token |
|---|---|---|---|---|---|---|
| Display (Home hero) | Playfair 700 | 3.75 / 60 | 1.05 | −0.015em | 2.5 / 40 | `text-display` |
| H1 (page / article title) | Playfair 700 | 2.75 / 44 | 1.12 | −0.01em | 2.125 / 34 | `text-h1` |
| H2 (section heading) | Playfair 600 | 2.0 / 32 | 1.20 | −0.005em | 1.625 / 26 | `text-h2` |
| H3 | Playfair 600 | 1.5 / 24 | 1.25 | 0 | 1.375 / 22 | `text-h3` |
| H4 / card title | Playfair 600 | 1.25 / 20 | 1.30 | 0 | 1.1875 / 19 | `text-h4` |
| Body-Large (lead) | Lora 400 | 1.25 / 20 | 1.65 | 0 | 1.125 / 18 | `text-body-lg` |
| Body (default prose/UI) | Lora 400 | 1.125 / 18 | 1.70 | 0 | 1.0625 / 17 | `text-body` |
| Small / Meta | Lora 500 | 0.9375 / 15 | 1.50 | 0.01em | 0.875 / 14 | `text-meta` |
| Caption | Lora 400 italic | 0.875 / 14 | 1.50 | 0 | 0.8125 / 13 | `text-caption` |
| Button / UI label | Lora 500 | 1.0 / 16 | 1.0 | 0.02em | 1.0 / 16 | (use `text-base` + `font-medium`) |
| Eyebrow / overline | Lora 600, **uppercase** | 0.8125 / 13 | 1.40 | 0.08em | 0.8125 / 13 | `text-eyebrow` |

**Card titles** use H4 in card grids and H3 on a single review's reviewed-book block. **H1** is never used twice on a page.

### 3.3 Reading measure

Body prose is constrained to **`--container-prose` = 42rem (672px)** → ≈ **66–72 characters** at 18px Lora. Apply to single-review/blog body, About bio, Privacy. Never let prose run full-width.

### 3.4 Both scripts — proof & tuning

Render identically in Cyrillic and Latin; no size changes between scripts.

> **Macedonian (Cyrillic):** „Книгата е тивок разговор меѓу писателот и читателот — таа чека, не брза."
> **English (Latin):** "A book is a quiet conversation between writer and reader — it waits, it does not hurry."

Cyrillic tuning notes for Code:
- **No extra letter-spacing on Cyrillic headings.** Cyrillic caps are more uniform in width and look over-spaced with positive tracking. Keep the same negative tracking on display sizes; for the **uppercase eyebrow**, reduce tracking from `0.08em` to **`0.06em`** when the string is Cyrillic (e.g. via a `:lang(mk), :lang(sr)` rule).
- **Macedonian-specific glyphs** (ѓ ќ ѕ џ љ њ) and the Serbian set (ђ ћ) render correctly in both families — verified in mockups.
- **Italic Cyrillic caveat:** Lora's Cyrillic *italic* uses default (Russian) cursive forms; Serbian/Macedonian prefer localized italic shapes for **б г д п т**. Set `lang="mk"`/`lang="sr"` on `<html>` so the browser can apply `locl` where available, and **prefer roman (non-italic) for Cyrillic emphasis** in mk/sr to avoid mismatched glyphs. Latin italic is unaffected — use freely in `en`.

### 3.5 Prose elements

- **Body links:** §2.2 (deep caramel, underlined).
- **Lists:** `ul` uses a caramel `–`/disc marker at the page accent; `ol` uses Lora 500 numerals in muted. Item spacing `0.4em`; list indent `1.25rem`.
- **Blockquote / pull-quote:** §6.10.
- **Captions:** Lora 400 italic, muted, `0.875rem`; sit directly under the image with `0.5rem` gap.
- **"available in:" meta:** §6.13.

### 3.6 Drop cap (the one flourish)

Applies **only** to the first paragraph of a **single review** and **single blog post** — not list pages, not Home, not About.

```css
/* Apply to the first paragraph of the article body */
.article-body > p:first-of-type::first-letter {
  font-family: var(--font-display);   /* Playfair Display */
  font-weight: 700;
  color: var(--color-primary);        /* caramel #A87437 — 3.46:1, large text ✓ */
  float: left;
  font-size: 3.5em;                   /* ≈ 3 body lines tall */
  line-height: 0.78;
  padding-right: 0.08em;
  margin-top: 0.02em;
  -webkit-font-smoothing: antialiased;
}
```

- **Accessibility:** `::first-letter` styles a pseudo-element — the DOM text is unchanged, so screen readers read the first word normally. No markup, no `aria` needed. (Decision #27.)
- **Cyrillic initials** (В С Ј Ш Во… → "В"): verified. Wide caps (Ш Ж М and Latin M W) — keep `padding-right: 0.08em` so wrapped text never collides. Narrow caps (Ј I J) leave a small gutter; acceptable.
- **Awkward cases & handling:** if a first paragraph begins with punctuation (an opening quote „ « or an em-dash), `::first-letter` would enlarge the punctuation — **author first paragraphs to begin with a letter**, or the CMS/template should skip the cap when the first character isn't a letter. Document this for the editor in phase 1.05.
- Mockup proof: see `single-review.html` (Cyrillic "В" cap) and the Latin "A"/"T" samples in `components.html`.

---

## 4. Spacing, radius, shadow, borders, breakpoints

### 4.1 Spacing — 8px scale

Tailwind v4's default `--spacing: 0.25rem` already yields this ramp at even steps; **do not override it.** Use these stops:

| Token name | px | rem | Tailwind step | Typical use |
|---|---|---|---|---|
| 2xs | 4 | 0.25 | `1` | icon ↔ label gap |
| xs | 8 | 0.5 | `2` | chip padding, tight stacks |
| sm | 12 | 0.75 | `3` | control inner padding |
| md | 16 | 1.0 | `4` | base gap, paragraph margins |
| lg | 24 | 1.5 | `6` | card padding, list gaps |
| xl | 32 | 2.0 | `8` | block gaps |
| 2xl | 48 | 3.0 | `12` | section padding (mobile) |
| 3xl | 64 | 4.0 | `16` | section padding (desktop) |
| 4xl | 96 | 6.0 | `24` | major section rhythm |
| 5xl | 128 | 8.0 | `32` | hero / page top |

Vertical rhythm: **paragraph spacing = 1em**; **section vertical padding = 64px desktop / 48px mobile**; **card internal padding = 24px** (20px on the narrowest screens).

### 4.2 Corner radius (gently rounded)

| Token | Value | Applies to |
|---|---|---|
| `--radius-image` | 6px (0.375rem) | book covers, photos |
| `--radius-button` | 10px (0.625rem) | buttons |
| `--radius-input` | 10px (0.625rem) | inputs, textarea, search |
| `--radius-card` | 14px (0.875rem) | cards, raised surfaces |
| `--radius-pill` | 9999px | topic chips |

### 4.3 Shadows (subtle only — no harsh drops)

Warm-tinted (espresso-based), never neutral black.

| Token | Value | Use |
|---|---|---|
| `--shadow-card` | `0 1px 2px rgb(46 34 24 / 0.04), 0 6px 18px rgb(46 34 24 / 0.06)` | review/blog cards, raised surfaces |
| `--shadow-card-hover` | `0 2px 4px rgb(46 34 24 / 0.06), 0 14px 30px rgb(46 34 24 / 0.11)` | card hover (with −2px lift) |
| `--shadow-cover` | `0 2px 6px rgb(46 34 24 / 0.12), 0 14px 32px rgb(46 34 24 / 0.18)` | book covers (a touch stronger, to lift the object) |

### 4.4 Borders / hairlines

- Default divider: `1px solid var(--color-border)` (espresso @ 12%).
- Interactive boundaries (inputs, search, secondary-button outline): `1px solid var(--color-border-strong)` `#82745F`.
- **Typographic double rule** (allowed; textures are not): two hairlines `2px` apart, the top `2px` caramel and the bottom `1px` border — used under page titles and as a title-page-style divider. See §6.16.

### 4.5 Breakpoints (mobile-first)

| Name | Min-width | Token | Notes |
|---|---|---|---|
| `xs` | 420px | `--breakpoint-xs` | review-card stack ↔ unstack |
| `sm` | 640px | `--breakpoint-sm` | nav → desktop; cards gain side-by-side |
| `md` | 768px | `--breakpoint-md` | two-column grids |
| `lg` | 1024px | `--breakpoint-lg` | single-review sidebar appears |
| `xl` | 1280px | `--breakpoint-xl` | max shell reached |

### 4.6 Widths & gutters

| Token | Value | Meaning |
|---|---|---|
| `--container-shell` | 70rem / 1120px | max content width (header, footers, page frame) |
| `--container-prose` | 42rem / 672px | reading column (§3.3) |
| Page gutter (mobile) | 20px | left/right padding < `sm` |
| Page gutter (tablet) | 32px | `sm`–`lg` |
| Page gutter (desktop) | 48px | ≥ `lg` |

---

## 5. Iconography (Lucide)

Minimal set. Default inline size **20px**, nav/touch **24px**, **stroke-width 1.75** (slightly finer than Lucide's default 2 — matches the refined tone), colour `currentColor` (so icons inherit text/state colour). Always pair an icon-only control with an accessible name (`aria-label`).

| Icon | Use | Size | Colour |
|---|---|---|---|
| `search` | search field affordance | 20 | muted (idle) → text (focus) |
| `menu` | open mobile nav | 24 | text |
| `x` | close menu / clear search | 24 / 18 | text / muted |
| `arrow-left` | "back to Reviews/Blog" | 18 | primary-strong |
| `external-link` | outbound "where to find it", footer externals | 16 | inherits link colour |
| `mail` | Contact email | 20 | on-footer / text |
| `instagram`, `facebook` | Social group | 20 | on-footer |
| `youtube` | Interviews group | 20 | on-footer |
| `chevron-right` | "load more" / breadcrumb separator option | 16 | muted |
| `chevron-down` | language switcher only **if** ever collapsed (default is inline — usually unused) | 16 | text |
| `languages` | optional glyph beside the MK·EN·SR switcher | 18 | muted |
| `loader-2` | search "thinking" spinner (animate-spin) | 18 | primary-strong |
| `book-open` | cover placeholder glyph & empty states | 24–40 | muted |

---

## 6. Components

Each: anatomy, tokens, all states, responsive notes. Where a shadcn/ui primitive exists, **restyle it — don't rebuild.**

### 6.1 Buttons — `shadcn/ui Button` (restyle variants)

Heights: **default 44px** (touch-safe), **small 36px** (min 24×24 target always met). Inner padding `0 20px`; label = Lora 500, 16px, `0.02em`; radius `--radius-button`; gap to leading icon `8px`. `transition: background 160ms, transform 160ms, box-shadow 160ms`.

- **Primary** (`variant="default"`): fill `--color-primary-strong`, label `--color-on-primary`. Hover → walnut fill + `translateY(-1px)`. Active → `#4A351F`, no lift. Disabled → parchment fill + muted label. Focus → global ring.
- **Secondary** (`variant="outline"`): transparent fill, `1.5px` caramel `#A87437` border, label `--color-primary-strong`. Hover → background `rgb(168 116 55 / 0.14)` (caramel wash), border → `--color-primary-strong`. Active → wash `0.20`. Focus → ring.
- **Quiet / text** (`variant="ghost"`): no fill/border, label `--color-primary-strong`. Hover → underline + wash `0.08`. Used for "load more", inline page actions.

### 6.2 Inline text link

Per §2.2. Always underlined in body copy (never colour-only). Outside prose (nav, footer) underline may be reserved for hover — but those still carry a non-colour state (nav = caramel underline marker; footer = hover underline).

### 6.3 Header / top nav

Slim bar, ground `--color-bg`, height **64px** (56px mobile), max width `--container-shell`, page gutters per §4.6. A `1px` `--color-border` hairline sits along the bottom. **Lightweight sticky:** `position: sticky; top: 0;` with `background: rgb(244 237 225 / 0.85); backdrop-filter: blur(8px);` — **no shadow** (the hairline alone separates it). Shrink/hairline only; no transforms.

- **Left:** wordmark **"Dalibor Plečić"** — Playfair 600, 20px, `--color-text`, links to Home. (Always Latin wordmark; the page may otherwise be Cyrillic.)
- **Centre/right:** nav links (Lora 500, 16px, `--color-text`), `24–28px` apart. **Active page** = a `2px` caramel underline `4px` below the label (`aria-current="page"`). Hover (inactive) = caramel underline at 60% / label unchanged. Focus = ring.
- **Far right:** language switcher (§6.4).
- **Mobile (< `sm`):** wordmark left; `menu` (hamburger, 24px, 44×44 hit area) right. Tapping opens a full-width panel below the bar (ground `--color-bg`, `1px` bottom hairline, items stacked, 48px rows, `aria-expanded` on the trigger, `Esc` + outside-click close, focus trapped while open, the `menu` icon swaps to `x`). The language switcher sits at the bottom of the panel.

### 6.4 Language switcher — **MK · EN · SR** (inline toggles, not a dropdown)

Three inline links separated by a thin `·` middot in `--color-border-strong`, `8px` each side. Each links to the **equivalent page** in that locale (next-intl). Labels are the two-letter codes, Lora 500, 15px.

- **Active locale:** `--color-text`, weight 600, `aria-current="true"`, not a link (or a link to self).
- **Inactive:** `--color-text-muted`; hover → `--color-text`. Focus → ring (each is tab-stoppable).
- Optional leading `languages` glyph (18px, muted). Keep the whole control to one line; never collapse to a dropdown on desktop. In the mobile panel it sits as a single centered row.

### 6.5 Footer

Ground `--color-footer` (walnut), text `--color-on-footer` (cream, 8.0:1), a `2px` caramel top-rule spanning the shell. Padding `64px` top / `48px` bottom. Layout: 4 link groups in a responsive grid (4 cols ≥ `md`, 2 cols `sm`, 1 col mobile), then a hairline (`cream @ 18%`) and a copyright line (Lora 400, 14px, cream @ 80%).

Group headings = eyebrow style (Lora 600, 13px, uppercase, `0.06em`, cream @ 70%). Localize the **labels**; the URLs load in Part 2 — design the slots now:

- **Contact** — Email (`mail` icon).
- **Social** — Instagram, Facebook (brand icons).
- **Writing** — Booksa · Versopolis · Partizanska knjiga (each `external-link`).
- **Interviews** — YouTube / TV (`youtube`).

Link state: cream @ 88% default → cream 100% + underline on hover; focus ring uses a **cream** outline here (`2px solid #F4EDE1`, offset 2px) for contrast on walnut.

### 6.6 Review card — horizontal "library row" (the locked card)

`shadcn/ui Card` restyled. Surface `--color-surface`, radius `--radius-card`, `--shadow-card`, padding `20px`, `1px` `--color-border`. **Cover left, text right.** The whole card is one link (the title is the accessible name; the cover `img` has `alt=""` to avoid duplicate link text).

**Anatomy (≥ `xs`, horizontal):**
- **Cover (left):** `--radius-image`, `--shadow-cover`, **2:3 portrait**, fixed width **132px** (desktop) / **104px** (`xs`–`sm`). `flex-shrink: 0`.
- **Text (right):**
  1. **Title** — Playfair 600, H4 (card title), `--color-text`; 2-line clamp.
  2. **Byline/meta** — Lora 500, `text-meta`, `--color-text-muted`: "Author · Date" (e.g. "Marko Pogačar · мај 2024").
  3. **Excerpt** — Lora 400, `text-body` (or 16px), `--color-text-muted`, **2-line clamp** (`-webkit-line-clamp`).
  4. **Topic chips** — §6.8, max ~3 then "+N".

**States:** hover → `--shadow-card-hover` + `translateY(-2px)` + title colour → `--color-primary-strong`. Focus-visible (card is the link) → ring around the whole card. Active → lift removed.

**Mobile reflow (documented):**
- ≥ **420px** (`xs`): horizontal, cover **104px** left, text right.
- < **420px**: **stack** — cover on top at a capped width (max 140px, centered-left), text below. Chips wrap. Excerpt may drop to 3-line clamp since width is tight.

### 6.7 Blog card (list)

Same row pattern as 6.6 **minus the cover and chips** by default (date-ordered text rows): Title (H4) → meta (date · reading time) → 2-line excerpt. If a post has a thumbnail, show a **small square 72×72** thumbnail left (radius `--radius-image`), otherwise text-only full width. No topic-search on Blog.

### 6.8 Topic chip / tag

Pill, `--radius-pill`, `1px` caramel `#A87437` border, label Lora 600, 13px, `--color-primary-strong`, padding `4px 12px`, height 28px. Background transparent.
- **If interactive** (filter at article foot / future): hover → caramel wash `rgb(168 116 55 / 0.12)`; active/selected → caramel fill **only if** label switches to `--color-on-primary` **and** the chip qualifies as large/UI — safer default is the wash + `1.5px` border + `aria-pressed`. Focus → ring. (Decorative chips on cards are non-interactive `<span>`s.)

### 6.9 Topic-search box (Reviews page)

One `shadcn/ui Input` restyled, full width of the list column, height **48px**, radius `--radius-input`, `1px` `--color-border-strong`, surface `--color-bg`, leading `search` icon (20px, muted, `16px` from the left), text Lora 400, 17px. **Localized placeholder** (Appendix D).

| State | Treatment |
|---|---|
| Idle | as above; helper line below in muted: "Try a theme — e.g. *memory*, *exile*, *language*" (localized) |
| Focused | border → `--color-primary` `2px`, soft ring `0 0 0 3px rgb(168 116 55 / 0.18)` |
| Loading | trailing `loader-2` spinner (18px, primary-strong, `animate-spin`); the meaning-search runs; results below show a subtle skeleton on the cards |
| Results | the card grid **re-ranks/filters** in place; a quiet line above the list: "Showing reviews about *'…'*" + a `x` to clear |
| Empty / no-results | friendly block: `book-open` glyph (muted), H4 "Nothing on that theme — yet", a line "Try another word, or browse all reviews," and a quiet "Clear search" button. Never looks broken. |

The keyword fallback is invisible to the reader — there is **no** separate UI; if meaning-search yields nothing, the box silently falls back, and only the empty state above ever shows.

### 6.10 Pull-quote / blockquote

Playfair Display **500 italic**, 24px (`text-h3` size, lighter weight), `--color-text`, indented `24px` with a **`3px` caramel left rule** (no giant quote-glyph by default — restraint; an oversized `"` is an *optional* variant for the About page only). Max width = prose measure. Attribution (if any) below: Lora 500, `text-meta`, muted, prefixed "— ".

### 6.11 Book-cover image component

Portrait **2:3**, `--radius-image`, `--shadow-cover`, `object-fit: cover`. Always has descriptive `alt` (§9) — except the decorative copy inside a card link, which uses `alt=""`.
**Graceful placeholder** (no image): a `--color-surface` block at 2:3 with a **`1px` --color-border** inset frame and a centered Playfair monogram — the work's initial (e.g. "Б"/"B") at 700, `--color-text-muted`, with a small `book-open` glyph above. No skeuomorphism.

### 6.12 Form controls (Contact) — `shadcn/ui` Input / Textarea / Label

Stack: **Label** (Lora 500, 15px, `--color-text`, `6px` above its field; `for`/`id` linked) → **field**. Inputs/textarea: height 48px (textarea min 140px), radius `--radius-input`, `1px` `--color-border-strong`, surface `--color-bg`, text 17px, padding `12px 14px`.

| State | Treatment |
|---|---|
| Focus | border `--color-primary` `2px` + soft caramel ring (as §6.9) |
| Helper text | Lora 400, 14px, muted, `6px` below field |
| Error | a desaturated brick `--color-error` `#8F3526` that fits the palette — **6.67:1 on cream / 5.95:1 on parchment** (passes AA as text *and* ≥3:1 as a border). Border turns this colour; the message sits below in the same colour; `aria-invalid="true"` + `aria-describedby` links the message. Never colour-only — always include the text. |
| Success | after submit: an inline confirmation panel (parchment surface, `1px` border, a `check` mark in primary-strong) replacing the form: "Thank you — your message is on its way." (localized) |
| Submit | primary button (§6.1), full-width on mobile |

(Wired to Formspree in Part 2; design only here.)

### 6.13 Meta line / "available in" badge

- **Meta line** (article head): Lora 500, `text-meta`, muted — "Date · reading time". Items separated by `·`.
- **"available in" badge:** small, muted, unobtrusive — "Достапно на: **MK** · EN" (the present locale bold, missing ones omitted or dimmed). Lora 500, 14px. Shown only when a translation is missing, so readers know which languages exist.

### 6.14 Breadcrumb

Single line, Lora 500, `text-meta`. "Home / Reviews / *Current title*" — separators `/` in `--color-border-strong`; ancestors are links (primary-strong, underline on hover), current is muted, not a link (`aria-current="page"`). Feeds `BreadcrumbList` schema in 1.12. On mobile, collapse to just "‹ Reviews" (the back link, §6.17) to save space.

### 6.15 Section heading / eyebrow

Home & multi-section pages: an **eyebrow** (§3.2) in muted/primary-strong above an **H2**. Optional `arrow-right` "see all" link on the right, vertically centered with the H2 baseline.

### 6.16 Divider / double rule

- Plain section divider: `1px --color-border`, `32–48px` vertical margin.
- **Title-page double rule** (under H1 on single review/blog and the Book page): a `2px` caramel rule directly above a `1px` border rule, `3px` apart, width capped at the prose measure (or a short 64px centered mark for a more formal title-page feel). Typographic only.

### 6.17 "← back to Reviews / Blog" link

`arrow-left` (18px) + label, Lora 500, `text-meta`, `--color-primary-strong`. Sits above the article title (and is the mobile breadcrumb). Hover → walnut + underline. Focus → ring. Localized ("← Назад кон рецензии" / "← Back to Reviews" / "← Назад на рецензије").

### 6.18 Pagination / "load more"

**Decision: "Load more"** (not numbered pages) for Reviews and Blog — it suits an archive that grows and keeps the reader in flow. A quiet/secondary button centered under the list: "Load more reviews" (localized). It appends the next batch (e.g. 8) and moves focus to the first new card for keyboard users. When exhausted, the button is replaced by a muted line "You've reached the end." Provide a `<noscript>`/SSR-friendly fallback link to a `?page=2` route so it works without JS (and for crawlers).

---

## 7. Page layouts

Every page sits inside the `--container-shell` with the §4.6 gutters; prose blocks use `--container-prose`. All use the §8 page-load reveal. Headings follow one logical order (one `h1` per page).

### 7.1 Home
Top → bottom:
1. **Intro** — eyebrow optional; **name** (Display) + **one line of who-he-is** (Body-Large, muted) — *no slogan*. Two variants:
   - **Photo present:** two columns ≥ `md` — text left (name + line + two quiet links "Read reviews", "About"), warm portrait right (4:5, `--radius-image`, `--shadow-cover`). Stacks to text-over-photo on mobile.
   - **Typographic-only** (until the photo arrives in Part 2): single centered column, Display name, the line, then a **double rule**, then the two links. Generous top space (`--space-5xl`).
2. **Featured book** — parchment band: book cover (2:3, left) + short blurb + "Read about the book →". (Mockup: "Буники / Bunike".)
3. **Latest reviews** — eyebrow "Latest reviews" + H2 + 2–3 **horizontal review cards** + "All reviews →".
4. **From the blog** — eyebrow + H2 + 2–3 **blog cards** + "All posts →".
5. **Quiet paths-in** row (optional): About · Book · Contact.
Mobile: everything single-column; featured-book cover above its text.

### 7.2 About
Reading column. Real **portrait** (top on mobile; floated/side on desktop within the measure), H1 "About" (or his name), bio in Body/Body-Large, an **optional pull-quote**. No drop cap. End with a quiet link to Contact.

### 7.3 Reviews (list)
1. H1 "Reviews" (+ eyebrow optional) + one-line description.
2. **Topic-search box** (§6.9) full width of the list column.
3. **Stack of horizontal review cards** (single column; the cards are already horizontal — don't grid them 2-up, the row *is* the unit). `16px` between cards.
4. **Load more** (§6.18).
5. Empty/no-results handled inside the search results region (§6.9).
Mobile: cards reflow per §6.6.

### 7.4 Single review
- **Back link** (§6.17) + **breadcrumb**.
- **H1** title (Playfair 700) + **double rule**.
- **Meta line** (date · "available in") (§6.13).
- **Body** (Lora) in the prose measure, **drop cap** on the first paragraph (§3.6).
- **Topic chips** at the foot (§6.8).
- **Reviewed book block** — cover + title (both scripts) + author/publisher + "where to find it" link. **Desktop ≥ `lg`:** a sticky right **sidebar** (the cover card) beside the prose. **Mobile/tablet:** the block sits **at the top**, right under the meta line, before the body.
- Ends with the back link again.

### 7.5 Blog (list)
Like Reviews **minus** the search box and covers: H1 "Blog", date-ordered **blog cards** (§6.7), **Load more**. Optional small thumbnails. Same empty state pattern if ever filtered.

### 7.6 Single blog post
Identical reading pattern to 7.4 (back link, breadcrumb, H1, double rule, meta, drop-cap first paragraph, body, chips, back link) — **without** the reviewed-book sidebar. Pull-quotes allowed inline.

### 7.7 Book
- Large **cover** (2:3, `--shadow-cover`) — left on desktop, top on mobile.
- **Title in both scripts** ("Буники" / "Bunike"), publisher + year (PNV Publikacii, 2022), genre/description kept **generic** (sources disagree — don't assert a settled genre).
- **"Where to find it"** — a short list of outbound links (e.g. kupikniga.mk) each with `external-link`.
- Room for a **short note** about the book (prose measure). Optional pull-quote.

### 7.8 Contact
Short intro line (Body-Large), then two columns ≥ `md`: the **form** (§6.12) left, **his links** (email + socials, reusing footer slots) right; stacked on mobile (form first).

### 7.9 Privacy
Simple long-form text page in the prose measure: H1 + last-updated meta + headings (H2/H3) + body + lists. On-brand, calm, no drop cap. Spec-only (reuses prose patterns).

### 7.10 404
Centered, on-brand, **localized**: a Playfair "404" or a quiet line "Оваа страница ја нема / This page isn't here", a friendly sentence, and a **primary button "Back home"** + quiet "Browse reviews". `book-open` glyph optional. Spec-only.

---

## 8. Motion

Sparing, implemented later with Framer Motion; here is the spec + a CSS reference.

- **Page-load reveal:** content rises **10px** and fades in over **360ms**, ease-out (`cubic-bezier(0.2, 0.65, 0.3, 1)`), with a **70–90ms stagger** across sibling blocks/cards (cap the stagger so nothing animates later than ~500ms).
- **Card hover lift:** `translateY(-2px)` + `--shadow-card → --shadow-card-hover`, `200ms`.
- **Nav underline / link colour:** `160ms`.
- **No** parallax, looping, scroll-jacking, or autoplay.

```css
@keyframes rise-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.reveal { animation: rise-in 360ms cubic-bezier(.2,.65,.3,1) both; }
.reveal-2 { animation-delay: 80ms; } .reveal-3 { animation-delay: 160ms; } .reveal-4 { animation-delay: 240ms; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  .card:hover { transform: none !important; }
}
```
**Everything is disabled under `prefers-reduced-motion: reduce`** — content must be fully visible without animation (note `both`/end-state = visible, so a no-animation fallback still shows content).

---

## 9. Imagery & alt-text

- **Real photos only** (Dalibor + the book) — **no stock**. Warm-tone them to sit in the palette (slightly reduced cool cast; never a heavy filter).
- **Consistent cover ratio 2:3**; portraits 4:5. Use `next/image` with width/height to avoid layout shift.
- **Graceful placeholder** per §6.11 when no image exists.
- **Descriptive, localized `alt`** on every meaningful image (helps screen-reader users and Google). Decorative covers inside a card that already links by title use `alt=""`.

Alt-text examples (localize per locale):
- Portrait — mk: "Далибор Плечиќ, седи покрај полица со книги." · en: "Dalibor Plečić seated beside a shelf of books." · sr: "Далибор Плечић поред полице са књигама."
- Book — mk: "Корица на книгата „Буники" од Далибор Плечиќ." · en: "Cover of the book *Bunike* by Dalibor Plečić."

---

## 10. Accessibility — WCAG 2.2 AA (checklist)

- [x] **Contrast:** every pair in §2.3 verified ≥ AA; the caramel rule (§2.5) keeps all *text* ≥4.5:1 and all UI/large ≥3:1. Muted finalized to pass on both grounds.
- [x] **Visible focus** on every interactive element: `2px` `--color-focus` outline, `2px` offset; cream outline in the footer. Never removed without an equal replacement.
- [x] **Full keyboard operability:** nav (incl. mobile panel with `Esc`/outside-close + focus trap), language switcher (3 tab-stops), search (type + clear), "load more" (focus moves to first new card), the whole form. Logical tab order = DOM order.
- [x] **Heading order:** exactly one `h1` per page; no skipped levels.
- [x] **Target sizes:** interactive controls ≥ **24×24** (WCAG 2.2 SC 2.5.8); primary touch targets (nav hamburger, buttons, language toggles) ≥ **44×44**.
- [x] **`aria-current`:** `page` on the active nav item; `true` on the active language.
- [x] **Reduced motion:** all animation/transition disabled under `prefers-reduced-motion: reduce`; content fully visible without motion.
- [x] **Drop cap** via `::first-letter` — DOM text intact, screen-reader-safe; skip when the first character is punctuation.
- [x] **Language switcher** is real links (crawlable, keyboard-focusable), `aria-current`, not colour-only (weight + state).
- [x] **Forms:** programmatic `label`↔field, `aria-invalid` + `aria-describedby` on error, errors are text (not colour-only), success is announced.
- [x] **Images:** descriptive localized `alt`; decorative images `alt=""`; no text-in-image for content.
- [x] **Links:** body links underlined (not colour-only); outbound links carry `external-link` + `rel="noopener"`.
- [x] **`lang`** set on `<html>` per locale (mk/en/sr) so screen readers pronounce correctly and `locl` glyph forms can apply.

> Anything that cannot meet AA is flagged here, not shipped. None outstanding.

---

## Appendix A — Paste-ready `@theme` block (`globals.css`)

Replace the scaffold's token block. Keep `@import "tailwindcss";` at the top. **Remove** the default `prefers-color-scheme: dark` block (Decision #14 — no dark mode).

```css
@import "tailwindcss";

@theme {
  /* ---------- Fonts (wired to next/font CSS vars, Appendix C) ---------- */
  --font-display: var(--font-playfair), "Playfair Display", Georgia, "Times New Roman", serif;
  --font-body:    var(--font-lora), "Lora", Georgia, "Times New Roman", serif;

  /* ---------- Type scale (size + paired line-height / tracking / weight) ---------- */
  --text-display: 3.75rem;  --text-display--line-height: 1.05; --text-display--letter-spacing: -0.015em; --text-display--font-weight: 700;
  --text-h1: 2.75rem;       --text-h1--line-height: 1.12;      --text-h1--letter-spacing: -0.01em;       --text-h1--font-weight: 700;
  --text-h2: 2rem;          --text-h2--line-height: 1.2;       --text-h2--letter-spacing: -0.005em;      --text-h2--font-weight: 600;
  --text-h3: 1.5rem;        --text-h3--line-height: 1.25;      --text-h3--font-weight: 600;
  --text-h4: 1.25rem;       --text-h4--line-height: 1.3;       --text-h4--font-weight: 600;
  --text-body-lg: 1.25rem;  --text-body-lg--line-height: 1.65;
  --text-body: 1.125rem;    --text-body--line-height: 1.7;
  --text-meta: 0.9375rem;   --text-meta--line-height: 1.5;     --text-meta--letter-spacing: 0.01em;
  --text-caption: 0.875rem; --text-caption--line-height: 1.5;
  --text-eyebrow: 0.8125rem;--text-eyebrow--line-height: 1.4;  --text-eyebrow--letter-spacing: 0.08em;

  /* ---------- Colour (semantic; values locked & AA-verified) ---------- */
  --color-bg: #F4EDE1;             /* Cream  — page background        */
  --color-surface: #EBE0CE;        /* Parchment — cards               */
  --color-text: #2E2218;           /* Espresso — primary text         */
  --color-text-muted: #6F5D46;     /* Muted — secondary (AA on both)  */
  --color-primary: #A87437;        /* Caramel — accent (≥3:1 uses)    */
  --color-primary-strong: #875621; /* Deep caramel — links/fills text */
  --color-primary-hover: #5B4228;  /* Walnut — hover                  */
  --color-on-primary: #FBF7EF;     /* label on filled accent          */
  --color-footer: #5B4228;         /* Walnut — footer ground          */
  --color-on-footer: #F4EDE1;      /* Cream — footer text (8.0:1)     */
  --color-border: rgb(46 34 24 / 0.12);   /* hairline                 */
  --color-border-strong: #82745F;  /* input / UI boundary (≥3:1)      */
  --color-focus: #875621;          /* focus ring                      */
  --color-error: #8F3526;          /* form error text + border (6.67:1)*/

  /* ---------- Radius ---------- */
  --radius-image: 0.375rem;   /* 6px  */
  --radius-button: 0.625rem;  /* 10px */
  --radius-input: 0.625rem;   /* 10px */
  --radius-card: 0.875rem;    /* 14px */
  --radius-pill: 9999px;

  /* ---------- Shadow (warm, subtle) ---------- */
  --shadow-card:       0 1px 2px rgb(46 34 24 / 0.04), 0 6px 18px rgb(46 34 24 / 0.06);
  --shadow-card-hover: 0 2px 4px rgb(46 34 24 / 0.06), 0 14px 30px rgb(46 34 24 / 0.11);
  --shadow-cover:      0 2px 6px rgb(46 34 24 / 0.12), 0 14px 32px rgb(46 34 24 / 0.18);

  /* ---------- Breakpoints (adds xs; keeps Tailwind's sm/md/lg/xl) ---------- */
  --breakpoint-xs: 26.25rem;  /* 420px */

  /* ---------- Layout widths ---------- */
  --container-prose: 42rem;   /* 672px reading measure */
  --container-shell: 70rem;   /* 1120px content max     */
}

/* Base element defaults */
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
h1,h2,h3,h4,.font-display { font-family: var(--font-display); }

/* Cyrillic eyebrow tracking tweak (§3.4) */
:lang(mk) .eyebrow, :lang(sr) .eyebrow { letter-spacing: 0.06em; }

/* Drop cap (§3.6) */
.article-body > p:first-of-type::first-letter {
  font-family: var(--font-display); font-weight: 700; color: var(--color-primary);
  float: left; font-size: 3.5em; line-height: 0.78; padding-right: 0.08em; margin-top: 0.02em;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
```

> Note: `text-display`, `text-h1`…`text-eyebrow` become Tailwind utilities (`className="text-h1"`), each carrying its size + line-height (+ tracking/weight). `bg-bg`, `bg-surface`, `text-text`, `text-text-muted`, `text-primary`, `bg-primary`, `border-border`, etc. are generated from the colour tokens. Mobile sizes from §3.2 are applied with responsive utilities (e.g. `text-h1 sm:text-h1` won't change size — use explicit mobile/desktop classes or a small `@utility`/`@media` override; the per-role mobile rem values are in §3.2).

## Appendix B — Raw `:root` custom properties (non-Tailwind reference)

For anyone reading values outside Tailwind. These mirror Appendix A (Tailwind also emits the `@theme` vars to `:root`).

```css
:root {
  --color-bg: #F4EDE1;          --color-surface: #EBE0CE;
  --color-text: #2E2218;        --color-text-muted: #6F5D46;
  --color-primary: #A87437;     --color-primary-strong: #875621;
  --color-primary-hover: #5B4228; --color-on-primary: #FBF7EF;
  --color-footer: #5B4228;      --color-on-footer: #F4EDE1;
  --color-border: rgb(46 34 24 / 0.12); --color-border-strong: #82745F;
  --color-focus: #875621;
  --color-error: #8F3526;       /* brick — 6.67:1 on cream; text + border */
  --radius-image: .375rem; --radius-button: .625rem; --radius-input: .625rem;
  --radius-card: .875rem;  --radius-pill: 9999px;
  --container-prose: 42rem; --container-shell: 70rem;
}
```

## Appendix C — `next/font/google` setup

`src/app/fonts.ts` (or in `layout.tsx`), exposing the two CSS variables the `@theme` block references. Both subsets, only the weights/styles from §3.1.

```ts
import { Playfair_Display, Lora } from "next/font/google";

export const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],   // 500 → italic pull-quote; 600/700 → headings, wordmark, drop cap
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const lora = Lora({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});
```
Apply both variables on `<html>`: `className={\`${playfair.variable} ${lora.variable}\`}` and set `lang` per locale. (If the build treats these as variable fonts, `next/font` serves the axis; trim any unused style/weight to shave payload.)

## Appendix D — Placeholder content

Used in the mockups (do not present unverified facts as truth).

- **Subject:** Dalibor Plečić — Далибор Плечиќ (mk) / Далибор Плечић (sr) — critic, translator, writer; Strumica.
- **His book:** "Буники" (mk) / "Bunike" (Latin) — PNV Publikacii, 2022. *(Genre kept generic — sources disagree.)*
- **Review samples:** "Esej o noći" — Marko Pogačar · "Svijet koji sam izabrala" — Kalina Maleska · "Putovanja slijepih" — Rade Jarak · "Tako neka bude" — Robert Međurečan · "Najbolje je već prošlo" — Danilo Stojić. (Some set in Cyrillic in the mockups, e.g. "Есеј за ноќта".)
- **Nav (mk / en / sr):** Дома·За мене·Рецензии·Блог·Книга·Контакт / Home·About·Reviews·Blog·Book·Contact / Почетна·О мени·Рецензије·Блог·Књига·Контакт.
- **Search placeholder:** "Пребарувај рецензии по тема…" / "Search reviews by topic…" / "Претражите рецензије по теми…".
- **"available in":** "Достапно на:" / "Available in:" / "Доступно на:".
- **Back link:** "← Назад кон рецензии" / "← Back to Reviews" / "← Назад на рецензије".
- **Footer groups (mk):** Контакт · Социјални мрежи · Пишување · Интервјуа.

---

*End of handover. Mockups follow in `mockups/`. This `.md` is the source of truth.*
