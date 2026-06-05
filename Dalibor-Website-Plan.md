# Dalibor Website — Plan

> **The master spec for the finished site.** This is aspirational — it describes the target, not the current status. **If this document ever disagrees with the live code or `src/_project-state/current-state.md`, the live code wins.** Update this plan deliberately when scope changes.

---

## 1. Goals and success criteria

**Goal:** give Dalibor Plečić one online home for work that is currently scattered across platforms — his book reviews, blog posts, translations, and his own book — plus a proper *About* page that tells his story. Readers should be able to find and read his work easily; Dalibor should be able to keep it updated himself.

**Success looks like:**
- A visitor lands and immediately understands who Dalibor is and can reach any of his work in a couple of clicks.
- Reviews are browsable and **searchable by topic** (meaning-based, not just keywords), each with the book cover.
- The site works fully in **Macedonian, English, and Serbian**.
- **Dalibor publishes new posts himself** through a private editor, in any language, without code.
- It's fast, accessible, and findable on Google in Macedonia.

---

## 2. About the project

Dalibor Plečić is a **Macedonian journalist, writer, and literary translator**, and the **author of his own book**. His output spans book reviews, translations, blog posts, and interviews he has given. The site consolidates this and foregrounds three things: his **reviews**, his **blog**, and his **own book**, anchored by an *About* page with his biography and real photographs.

> **[To be confirmed in Phase 1.01 — Deep research on Dalibor Plečić:]** full biography, the title and details of his book, the scope of his translations/reviews, notable interviews, and his existing online presence. This section is filled in from that research before content work begins.

**Audience:** general — anyone who arrives at the site (his readers and followers, editors/publishers, fellow translators and students). The site is designed for a general, literate reader who is there to read. No audience segmentation.

---

## 3. Information architecture (sitemap)

Three languages, each with its own URL prefix so search engines treat them as distinct, properly-translated versions. **Macedonian is the default;** the root redirects to it.

```
/                         → redirects to /mk
/[lang]                   Home
/[lang]/about             About (biography)
/[lang]/reviews           Reviews — list (book covers + AI topic search)
/[lang]/reviews/[slug]    Single review
/[lang]/blog              Blog — list
/[lang]/blog/[slug]       Single post
/[lang]/book              His own book (dedicated page)
/[lang]/contact           Contact form + links
/[lang]/privacy           Privacy
404                       Not-found page
```
`[lang]` = `mk` | `en` | `sr`. A language switcher in the header moves the visitor between equivalents (e.g. `/en/reviews` ↔ `/mk/reviews`).

---

## 4. Pages at launch

1. **Home** — a short intro to Dalibor, a featured block for his own book, the latest reviews and blog posts, and clear paths into everything.
2. **About** — his biography and a real photo; his story as a writer/translator/journalist.
3. **Reviews** — browsable list, each entry showing the **book-cover image**, plus the **AI topic search**; each opens a full review page.
4. **Reviews — single** — the full review, with the cover, the book details, and topic tags.
5. **Blog** — list of his posts; each opens a full post page.
6. **Blog — single** — the full post.
7. **Book** — a dedicated page for *his own* book: cover, description, and where to find/buy it.
8. **Contact** — the contact form (→ his inbox) plus his email, Instagram, Facebook, Booksa, and interview links.
9. **Privacy** — a light policy page (the contact form collects an email).
10. **404** — a friendly not-found page in the active language.

---

## 5. Design system (locked) — Style A · Hardcover

A classic, literary, "well-made printed book" feel: warm, timeless, made for reading. Real photography only (Dalibor + the book) — no stock.

**Palette**

| Token | Hex | Use |
|---|---|---|
| Cream | `#F4EDE1` | Page background |
| Parchment | `#EBE0CE` | Cards / surfaces |
| Caramel | `#A87437` | Primary accent (links, buttons, highlights) |
| Walnut | `#5B4228` | Deep accent / hover / footer |
| Espresso | `#2E2218` | Primary text |
| *(derived)* Muted | ~`#7C6C57` | Secondary text |
| *(derived)* Border | ~12% espresso over background | Hairlines / dividers |

**Typography**
- **Headings / display:** Playfair Display.
- **Body / UI:** Lora.
- **Hard constraint:** both fonts must render **Macedonian and Serbian Cyrillic** *and* Latin. (Confirmed: Playfair Display and Lora both ship Cyrillic.)

**Component principles**
- Generous whitespace; comfortable reading measure (~65–75 characters per line) for body text.
- Gently rounded cards and buttons; understated, not flashy.
- One clear accent (caramel); avoid rainbow palettes.
- Subtle motion only (Framer Motion) — e.g. a single tasteful page-load reveal. No gratuitous animation.
- Accessible by construction: visible focus states, sufficient contrast (espresso-on-cream and white-on-caramel both checked against WCAG 2.2 AA), keyboard-navigable.

**Off the table:** dark mode (v1), WebGL, stock imagery, marketing fluff.

---

## 6. Tech stack (locked)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) | Pin exact version at scaffolding |
| Language | TypeScript | |
| Styling | Tailwind CSS | Theme tokens map to the Style A palette |
| Components | shadcn/ui (Radix UI) | Restyled to Style A; aids WCAG 2.2 AA |
| Icons | Lucide | |
| Animation | Framer Motion | Sparingly |
| i18n | next-intl | `mk` default / `en` / `sr`; root → `/mk` |
| CMS | Sanity | Studio for Dalibor; per-language localized fields |
| Contact form | Formspree | Free tier; → Dalibor's inbox |
| AI reviews search | Vercel AI SDK + Voyage embeddings + Supabase (pgvector) | Multilingual; keyword fallback |
| Hosting | Vercel | Hobby (free) → Pro optional |
| DNS / CDN | TBD (Cloudflare or Vercel DNS) | With domain, Part 2 |
| Legal | Privacy page (or Termly free) | |
| Fonts | Playfair Display + Lora | Cyrillic + Latin |

---

## 7. File and folder structure

```
DaliborWeb/
├── docs/
│   └── design-handovers/        # RESERVED — Design phase handovers land here
│       └── Part-X-Phase-YY-Handover.md
├── public/                      # static assets (favicon, robots.txt, images)
├── src/
│   ├── _project-state/          # RESERVED — live project-state docs
│   │   ├── current-state.md
│   │   ├── file-map.md
│   │   ├── 00_stack-and-config.md
│   │   └── Part-X-Phase-YY-Completion.md   # completion reports filed here
│   ├── app/
│   │   └── [locale]/            # mk | en | sr — all pages live here
│   │       ├── page.tsx                 # Home
│   │       ├── about/page.tsx
│   │       ├── reviews/page.tsx
│   │       ├── reviews/[slug]/page.tsx
│   │       ├── blog/page.tsx
│   │       ├── blog/[slug]/page.tsx
│   │       ├── book/page.tsx
│   │       ├── contact/page.tsx
│   │       └── privacy/page.tsx
│   ├── components/              # shared UI (header, footer, cards, search…)
│   ├── lib/                     # helpers (Sanity client, search, embeddings…)
│   ├── messages/                # next-intl UI strings: mk.json / en.json / sr.json
│   └── styles/
├── sanity/                      # Sanity Studio config (the CMS editor)
├── .env.local                   # secret keys — never committed
├── package.json
└── (config files: next.config, tailwind.config, tsconfig, etc.)
```

The two **reserved** folders (`docs/design-handovers/` and `src/_project-state/`) are created in the scaffolding phase (1.02).

---

## 8. Integrations and what each one does

| Integration | What it does | Wired in |
|---|---|---|
| **Sanity** (CMS) | Dalibor's private publishing Studio; stores blog posts, reviews (with cover + book metadata), the book page, and the bio — each with per-language fields | Built 1.05 · live 2.04 |
| **Formspree** | Receives contact-form submissions and emails them to Dalibor's inbox; no email server to manage | 2.02 |
| **Vercel AI SDK + Voyage + Supabase (pgvector)** | Generates a meaning "fingerprint" (embedding) for each review and finds the closest matches to a search query — the topic search | Built 1.09 · live 2.03 |
| **next-intl** | The three-language URLs, the language switcher, and translated UI text | 1.04 |
| **Vercel** | Hosting / going live | 2.05 |

---

## 9. SEO and schema strategy

Focus market: **Macedonia.**
- **Per-page, per-language** `<title>` and meta description.
- **hreflang** tags linking the three language versions of each page (tells Google they're translations, not duplicates).
- **Structured data (schema.org):** `Person` (Dalibor, on Home/About), `Article` (blog posts and reviews), `Book` (his own book), `BreadcrumbList`.
- Auto-generated `sitemap.xml` (all languages) and `robots.txt`.
- Clean semantic HTML, correct heading order, descriptive alt text on images.
- Meta hand-written for key pages (Home, About, Book); templated for blog posts and reviews.

---

## 10. Multi-language approach (Macedonian / English / Serbian)

- **UI text** (menus, buttons, labels, form text) → `next-intl` message files: `mk.json`, `en.json`, `sr.json`.
- **Content** (posts, reviews, bio, book) → Sanity, with a field per language, so Dalibor writes each piece in all three (or marks one as single-language).
- **Graceful fallback:** not every post must exist in all three languages. If a translation is missing, the site shows what's available (e.g. an "available in: MK, EN" note) rather than a broken page.
- **No machine translation of his work** — Dalibor is a translator and provides/approves the wording himself.
- **URLs:** `/mk` (default), `/en`, `/sr`; root redirects to `/mk`. Language switcher in the header. hreflang for SEO.
- **Fonts** chosen specifically to cover Cyrillic (MK + SR) and Latin (EN + SR-Latin).

---

## 11. Lead-capture mechanics

This is a personal site, not a sales funnel. There is exactly **one** conversion point: the **contact form → Dalibor's inbox** (via Formspree, with spam protection). No CRM, no pop-ups, no newsletter.

---

## 12. AI features specification — review topic search

**What it does:** on the Reviews page, a visitor types a topic or phrase; the site returns the reviews that are closest *in meaning*, ranked — so searching "war" can surface a review of a novel set during a conflict even if the word "war" never appears.

**How it works:**
1. Each review (from Sanity) is converted to an **embedding** — a numeric fingerprint of its meaning — using a **Voyage** multilingual embedding model (so it works across all three languages).
2. Embeddings are stored in **Supabase** using **pgvector** (a meaning-search extension).
3. On search, the query is embedded and compared to the stored review embeddings; the nearest matches are returned.
4. **Keyword fallback:** if the AI search ever fails or returns nothing, a plain keyword filter takes over, so the search box always works.
5. **Re-index on change:** when Dalibor publishes or edits a review, its embedding is refreshed.

**Cost:** Supabase free tier covers storage; embedding calls cost a few cents at this scale.

---

## 13. Automation specification

The only automation is the **review re-indexing** described in §12 (refresh a review's embedding when it changes). There are no other automations at launch.

---

## 14. Acceptance criteria — what "launched" means

- [ ] Live on Vercel at the chosen domain, over HTTPS.
- [ ] Home, About, Reviews, Blog, Contact, Book, Privacy — all present in **mk / en / sr**.
- [ ] Language switcher works; URLs and hreflang correct; root redirects to `/mk`.
- [ ] Sanity live; **Dalibor can log in and publish a post in any language.**
- [ ] Reviews show book covers; AI topic search returns sensible results across all three languages; keyword fallback works.
- [ ] Contact form delivers to Dalibor's inbox; spam protection on.
- [ ] His book is featured (Book page + a Home block).
- [ ] About has his real bio + photo.
- [ ] Real images only (Dalibor + book); no stock.
- [ ] **Lighthouse 95+** (Performance, Accessibility, Best Practices, SEO), desktop + mobile.
- [ ] **WCAG 2.2 AA.**
- [ ] SEO: per-language metadata, schema, `sitemap.xml`, `robots.txt`.
- [ ] Privacy page live.
- [ ] Copy reads like a real person and matches Dalibor's voice; no fluff.

---

## 15. Pre-build parallel-track tasks

| Task | Owner | When |
|---|---|---|
| Send Chat 2–3 of Dalibor's existing blog posts (links or text) for voice/tone | Lazar | Before/around the Design + content phases |
| Gather Dalibor's real materials — review texts, book covers, photo of Dalibor + the book, bio inputs, social/Booksa/interview links, contact email | Cowork + Lazar | Part 2 · Phase 2.01 |
| Choose the domain | Lazar (Chat recommends) | Part 2 · Phase 2.06 |
