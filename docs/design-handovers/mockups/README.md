# Hardcover — static mockups

Self-contained HTML previews of the **Style A · "Hardcover"** design system for the Dalibor Plečić website. Each file embeds the real fonts (Playfair Display + Lora via Google Fonts) and the exact locked palette — **no build step, no framework.** Open any file directly in a browser.

> **Source of truth:** the spec at [`../Part-1-Phase-03-Handover.md`](../Part-1-Phase-03-Handover.md). If a mockup and the handover ever disagree, **the handover wins** — the mockups are an illustration of it, not a second source.

## Files

| File | Shows |
|---|---|
| `components.html` | **Kitchen sink** — every component in all its states: colour swatches, the full type scale, the drop cap, buttons (primary/secondary/quiet × default/hover/active/disabled/focus), inline links, the MK·EN·SR language switcher, topic chips, the horizontal review card (+ mobile-stacked reflow + cover placeholder), blog card, the topic-search box (idle/focused/loading/results/empty), the contact form (incl. error + success), pull-quote, meta line + "available in" badge, breadcrumb, double rule, back link, "load more" end-state, the book-cover component + placeholder, and the footer. |
| `home.html` | Home page — typographic-only title-page hero (launch state) **plus** a labelled "photo-present" intro variant, featured-book band ("Буники / Bunike"), Latest reviews (horizontal cards), From the blog. |
| `reviews-list.html` | Reviews list — page head, the topic-**search box**, the stack of **horizontal cover-left / text-right** review cards (incl. a placeholder-cover row), and "Load more". |
| `single-review.html` | Single review — reading column, Playfair title, double rule, meta + "available in", the **drop cap** on the first paragraph (Cyrillic "В"), body prose with a pull-quote and an English passage, topic chips, "← back", and the reviewed-book block (sticky sidebar on desktop, top on mobile). |

About, Book, Contact, Blog-list, single-post, Privacy and 404 are **spec-only** in the handover (they reuse the patterns shown above), per the brief.

## Notes for Code

- **Both scripts are visible** in every file (Macedonian Cyrillic + Latin) so the type can be judged in both.
- Icons are inline **Lucide** paths (MIT) as an SVG sprite — in the app these become `lucide-react` components.
- Colours, type sizes, radii, shadows, spacing and breakpoints are the literal tokens from the handover's `@theme` block — restyle the shadcn/ui primitives to match, don't rebuild.
- Covers/portraits are warm gradient stand-ins; real images and the parchment **placeholder** (with a Playfair monogram) arrive in Part 2.
- These are **presentational** mockups: hover/focus are real CSS states, but there's no JS (the mobile menu, live search, and "load more" are wired during the build phases).
