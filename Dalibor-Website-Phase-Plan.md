# Dalibor Website — Phase Plan

> Living index of every phase. One row per phase. **One phase = one completion report = one git commit per executing Claude session.** Update the status column as phases close. Numbering: `1.01`, `1.02`, … then `2.01`, `2.02`, …

**Status key:** ☐ not started · ◐ in progress · ☑ done (completion report filed)

---

## Part 1 — Build everything locally

| # | Phase | Type | Scope | Status |
|---|---|---|---|---|
| 1.01 | Deep research on Dalibor Plečić | Research (Chat runs it) | Compile a research document: full bio, the title/details of his book, his reviews/translations/articles, public interviews, and his existing online presence + writing-style notes. Output: `Dalibor-Research.md`. | ☑ |
| 1.02 | Project scaffolding | Code | Create the Next.js + TypeScript + Tailwind project in the repo; set up the folder tree; **create the reserved folders** `docs/design-handovers/` and `src/_project-state/`; seed the project-state docs; first commit; confirm it runs locally. | ☐ |
| 1.03 | Design system & visual direction | Design | Turn the locked Style A direction into a full design handover: exact palette tokens, Playfair Display + Lora type scale, components, and layouts for every page type. Output: handover in `docs/design-handovers/`. | ☐ |
| 1.04 | Languages + routing foundation | Code | Wire next-intl, the `/mk /en /sr` structure, the language switcher, and the root → `/mk` redirect; stub UI strings in all three languages. | ☐ |
| 1.05 | Sanity CMS + content models | Code | Stand up Sanity Studio; model the content types — blog post, review (with cover + book metadata), book, bio — each with per-language fields; connect to the site locally with placeholder content. | ☐ |
| 1.06 | Core layout & shared components | Code | Build the header (with language switcher), footer (email/Instagram/Facebook/Booksa/interview links), navigation, and base page shells — in the Style A design. | ☐ |
| 1.07 | Home page | Code | Build Home: intro to Dalibor, featured-book block, latest reviews + posts, and paths into everything. | ☐ |
| 1.08 | About + Book pages | Code | Build About (bio + photo) and the Book page (cover, description, find-it links). | ☐ |
| 1.09 | Reviews + AI topic search | Code | Build the Reviews list with covers + the topic-search box (embeddings via Supabase) and single-review pages; include the keyword fallback. | ☐ |
| 1.10 | Blog | Code | Build the Blog list and single-post pages, pulling from Sanity. | ☐ |
| 1.11 | Contact + Privacy | Code | Build the Contact page with the form (wired live in Part 2) + his links, and the Privacy page. | ☐ |
| 1.12 | SEO, schema, accessibility & Lighthouse pass | Code | Add per-language metadata, hreflang, schema (Person/Article/Book/Breadcrumb), `sitemap.xml`, `robots.txt`; run the accessibility + performance pass to hit Lighthouse 95+ / WCAG 2.2 AA locally. | ☐ |

## Part 2 — Integrations + go live

| # | Phase | Type | Scope | Status |
|---|---|---|---|---|
| 2.01 | Gather & load content | Cowork + Lazar | Collect Dalibor's real materials (review texts, covers, photos of him + the book, bio, social/Booksa/interview links, contact email) and load them into Sanity in all three languages. | ☐ |
| 2.02 | Contact form live | Code / Cowork | Create the Formspree form, wire it to Dalibor's real inbox, send a real test submission, and enable spam protection. | ☐ |
| 2.03 | AI search live | Code | Connect Voyage + Supabase with real keys, generate embeddings for all real reviews, verify topic search across all three languages, and set up auto re-index on publish. | ☐ |
| 2.04 | Sanity hosting + publishing handover | Cowork | Deploy Sanity Studio so Dalibor has his own live login; write a short how-to so he can publish himself. | ☐ |
| 2.05 | Deploy to Vercel | Code / Cowork | Connect the repo to Vercel, set environment variables, deploy a preview, verify, then push to production. | ☐ |
| 2.06 | Domain + DNS | Cowork | Choose/confirm the domain, point DNS, set up HTTPS/SSL, verify all languages resolve. | ☐ |
| 2.07 | Vercel Pro upgrade (optional) | Cowork | If the site is treated as a commercial presence, upgrade to Vercel Pro — a clean yes/no decision. | ☐ |
| 2.08 | Launch QA | Code / Cowork | Run the full acceptance checklist (Lighthouse, accessibility, all pages/languages, form, search, schema); fix gaps; mark launched. | ☐ |

---

## Critical path & dependencies

- **1.01 → 1.02 → 1.03** run in order. The deep research (1.01) informs content and design; scaffolding (1.02) must exist before any code; the design handover (1.03) must exist before page-building phases.
- **1.03 (Design)** is gated on Lazar's approval of the visual direction in chat *before* the prompt file is written. (Direction is already locked: Style A.)
- **1.04 (languages) and 1.05 (CMS)** are foundations for every page phase (1.06–1.11) and should land before them.
- **Page phases (1.06–1.11)** can each proceed once 1.03 + 1.04 + 1.05 are in. 1.09 additionally builds the AI search UI (wired live later in 2.03).
- **1.12** comes last in Part 1 (it tunes everything that exists).
- **Part 2** requires Part 1 complete **and** Dalibor's real content gathered (2.01). 2.05 (deploy) depends on 2.02/2.03/2.04 being ready; 2.06 (domain) depends on 2.05; 2.08 (launch QA) is the final gate.
- **Parallel, anytime:** Lazar sending Dalibor's blog samples (helps 1.03 and content tone).
