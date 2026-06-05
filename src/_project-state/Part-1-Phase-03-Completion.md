# Part-1-Phase-03-Completion.md

> **Location in repo:** `src/_project-state/`
> Filled completion report for Phase 1.03. Lazar pastes this back to Chat to close the phase.

---

**Phase ID + name:** 1.03 — Design system & visual direction

**Executing Claude:** Design (Claude Design)

**Date completed:** 2026-06-06

---

### What shipped
- **The authoritative handover** at `docs/design-handovers/Part-1-Phase-03-Handover.md` — covers §1–§10 with exact, implementation-ready values (no "TBD"). Includes a paste-ready Tailwind v4 `@theme` block, the raw `:root` mirror, the `next/font/google` setup, and the placeholder-content appendix.
- **Four self-contained HTML mockups** in `docs/design-handovers/mockups/` (real Playfair Display + Lora via Google Fonts, the exact palette, no CSS framework, both scripts visible): `components.html` (kitchen sink — every component, all states), `home.html`, `reviews-list.html`, `single-review.html`.
- **`mockups/README.md`** listing the files, with the note that the `.md` handover is the source of truth on any conflict.
- **Colour system finalized and AA-verified.** Semantic tokens + interaction states; a paste-ready `@theme` block plus raw CSS variables. Every required contrast pair stated with its measured ratio; two derived colours were adjusted to pass (below).
- **Type system finalized.** Playfair Display (600/700 + 500 italic) + Lora (400/500/600 + 400 italic), both with `latin`+`cyrillic` subsets; full scale (px + rem + weight + line-height + letter-spacing + mobile size), reading measure 42rem, drop-cap spec, and Cyrillic tuning notes.
- All ten page layouts specified with mobile notes; both Home intro variants (photo-present + typographic-only) designed and shown.
- Visually verified: all four mockups rendered in a browser (desktop + narrow) — fonts load, both scripts render, the drop cap works in Cyrillic ("В") and Latin ("A"), every component/state and the responsive reflows display correctly.

### Decisions made on the fly (with why)
- **Muted text changed from the brief's ~`#7C6C57` to `#6F5D46`.** `#7C6C57` measures **4.36:1 on cream** (and worse on parchment) — it **fails** AA for normal text. Card excerpts/bylines appear on both cream *and* parchment, so parchment is the binding constraint. `#6F5D46` clears both (**5.42:1 / 4.83:1**). Required by the brief's "finalize + verify" instruction.
- **Added a second amber, `--color-primary-strong` `#875621` (deep caramel).** The locked caramel `#A87437` physically cannot reach 4.5:1 behind/with normal text (best case white-on-caramel = **4.03:1**). Per the brief's prescribed remedy ("darken the text token toward walnut"), links and the **primary-button fill** use `#875621` (≥4.76:1), while caramel is reserved for ≥3:1 roles only (active underline, focus ring, chip/section rules, drop cap). It's a shade of the one hue — does **not** break "one accent only".
- **Added `--color-border-strong` `#82745F` for interactive boundaries.** A 12% espresso hairline is far below the 3:1 that WCAG 1.4.11 needs for input/UI edges; inputs, the search field and the secondary-button outline use the stronger token (3.91:1 / 3.49:1).
- **Drop cap = caramel `#A87437`** (a ~3-line letter is "large text" → 3.46:1 passes); espresso/walnut noted as higher-contrast alternatives.
- **Header = lightweight sticky** (translucent cream + blur, hairline only, no shadow) and **list pagination = "Load more"** (not numbered pages) — both were left to Design's discretion by the brief; choices documented in the handover.
- **Error colour `#8F3526`** chosen to sit in the palette (6.67:1 on cream) for the Contact form states.

### Surprises or off-spec changes
- **No code in `src/` was touched** (correct for a Design phase) **except** this report. The `@theme` block and `globals.css` guidance live in the handover for Code to apply in 1.04+.
- **The brief's palette has an inherent accessibility limit** (caramel can't carry normal text at AA). This was anticipated by the brief; resolved with the deep-caramel token + a documented "caramel rule" rather than by changing the locked caramel. Flagged here because it shapes how links/buttons must be built.
- **Verified rendering with a throwaway static server.** A temporary `.claude/launch.json` + Node static server were created to screenshot the mockups, then **deleted** — they are not part of the repo. (Mentioned so the history is clear; nothing left behind.)
- Mockup covers/portraits are warm **gradient stand-ins** (real photos arrive in Part 2); the graceful parchment **placeholder** with a Playfair monogram is shown for the no-image case.

### Files written / updated
- `docs/design-handovers/Part-1-Phase-03-Handover.md` — the spec (§1–§10 + appendices). **New.**
- `docs/design-handovers/mockups/components.html` — kitchen-sink, every component/state. **New.**
- `docs/design-handovers/mockups/home.html` — Home (both hero variants). **New.**
- `docs/design-handovers/mockups/reviews-list.html` — Reviews list (search + horizontal cards). **New.**
- `docs/design-handovers/mockups/single-review.html` — Single review (drop cap + reading column + book sidebar). **New.**
- `docs/design-handovers/mockups/README.md` — mockups index. **New.**
- `src/_project-state/Part-1-Phase-03-Completion.md` — this report. **New.**
- `src/_project-state/current-state.md` — phase-status line updated to record the 1.03 handover (last-updated bumped to 2026-06-06).
- *(Note for Code: add the four mockups + handover + this report to `file-map.md` in 1.04, and apply the `@theme` block to `globals.css`.)*

### Tests run + results
- **Visual render check** — all four mockups served locally and screenshotted on desktop (1280px) and narrow (~800px): ✅ Playfair Display + Lora load (verified the exact weights 600/700 + 500i and 400/500/600 + 400i are active), ✅ Cyrillic + Latin both render in display and body faces, ✅ drop cap correct in both scripts, ✅ all button/link/chip/search/form states, ✅ horizontal review card + mobile stack reflow, ✅ single-review sticky sidebar (desktop) → book-on-top (tablet/mobile), ✅ footer.
- **Contrast math** — every pair in §2.3 computed via the sRGB relative-luminance formula and stated with its ratio; all meet WCAG 2.2 AA (text ≥4.5:1, UI/large ≥3:1). The two failing derived colours were adjusted and noted.
- **Tailwind v4 token namespaces** — confirmed against the installed `tailwindcss@4.3.0` (`--color-*`, `--font-*`, `--text-*` + per-size modifiers, `--radius-*`, `--shadow-*`, `--breakpoint-*`, `--container-*`) so the `@theme` block generates the intended utilities.
- No app build/lint run (no `src/` app code changed).

### Blocked / carryover items
- **`globals.css` still the default scaffold** — Code applies the §Appendix-A `@theme` block (and removes the dark-mode block, Decision #14) in **1.04**.
- **`file-map.md` not yet updated** for the new `docs/` files — left for Code to fold into the 1.04 end-of-phase update (Design avoided editing Code's file-map mid-phase; only the `current-state.md` phase line was touched, as the brief permits).
- **Real imagery + final footer URLs** arrive in **Part 2**; the mockups use gradient stand-ins and `#` link slots.
- **Drop-cap editor guidance** (skip the cap when a paragraph starts with punctuation) to be surfaced to the Sanity editor in **1.05**.

### What's next
- **Phase 1.04 — i18n + layout foundation:** wire next-intl (`mk` default / `en` / `sr`, root → `/mk`), build the App-Router `[locale]` shell, load the two fonts via `next/font`, and apply the handover's `@theme` tokens to `globals.css` + the header/footer/language-switcher components.

---
*`current-state.md` phase line updated to note the 1.03 handover exists. `00_stack-and-config.md` unchanged (no stack/version change this phase). `file-map.md` to be updated by Code in 1.04.*
