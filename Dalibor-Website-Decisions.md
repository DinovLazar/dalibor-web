# Dalibor Website — Decisions

> Append-only log of decisions made in Chat. Each entry: the decision + a one-line *why*. **Do not edit past entries.** If a decision is reversed, add a new entry that links back to the old one.

---

## 2026-06-05 — Kickoff (intake + planning)

1. **Scope:** the site consolidates Dalibor Plečić's reviews, blog, translations, and his own book, plus an *About*/biography page. — *Why:* his work is currently scattered across platforms.
2. **Audience: general / anyone.** — *Why:* he wants broad reach; no segmentation needed.
3. **Pages at launch:** Home, About, Reviews, Blog, Contact, Book, Privacy (+ 404). — *Why:* covers his work, his story, his book, and contact.
4. **Languages: Macedonian (default), English, Serbian.** — *Why:* Macedonia focus plus Serbian/English reach; he is a translator and can provide all three.
5. **URL scheme:** `/mk` (default), `/en`, `/sr`; root redirects to `/mk`. — *Why:* clean per-language SEO, Macedonia-first.
6. **The book gets a dedicated page** (not just a Home feature). — *Why:* his own book warrants its own space; also featured on Home.
7. **Reviews search is AI semantic ("by topic"),** not just keyword matching. — *Why:* Lazar asked to search by topic; meaning-based search is more useful for a review archive.
8. **Reviews display book-cover images.** — *Why:* visual browsing; requested.
9. **Contact form → Dalibor's personal inbox via Formspree** (chosen over Resend). — *Why:* simpler for a non-technical owner; no email infrastructure to manage.
10. **CMS: Sanity, with self-publishing for Dalibor;** localized per-language fields. — *Why:* he publishes constantly and needs a friendly editor that handles three languages.
11. **No analytics.** — *Why:* Lazar declined.
12. **No newsletter.** — *Why:* Lazar declined.
13. **No booking, payments, or job-management system.** — *Why:* not applicable to a personal writer's site.
14. **No dark mode in v1.** — *Why:* keep the build simple; can add later.
15. **Hosting: Vercel.** — *Why:* Lazar's choice; pairs natively with the stack.
16. **Framework: Next.js (App Router), chosen over Astro.** — *Why:* keeps CMS + AI search + Vercel in one well-documented setup, fewer build snags; Astro noted as the speed-focused alternative.
17. **AI search stack: Vercel AI SDK + Voyage embeddings + Supabase (pgvector).** — *Why:* real multilingual semantic search; reuses Supabase, which Lazar already has connected.
18. **GitHub: existing account, public repo, Claude Code has access.** — *Why:* Lazar's existing setup. (Exact repo name TBD; suggested `DinovLazar/dalibor-web`.)
19. **Local working folder: `C:\Users\user\Desktop\DaliborWeb`.** — *Why:* Lazar's choice.
20. **Quality bar: Lighthouse 95+ and WCAG 2.2 AA.** — *Why:* high standard; Lazar confirmed.
21. **Project size: Two Parts** (Part 1 local build, Part 2 integrations + go live). — *Why:* medium project — trilingual, a CMS, and an AI feature push it past a single-part build.
22. **Phase 1.01 is deep research on Dalibor Plečić, run by Chat directly.** — *Why:* grounding content and design in real facts up front; Chat has web access, so running it directly is the most efficient path.
23. **Visual direction: Style A — Hardcover** (cream `#F4EDE1`, parchment `#EBE0CE`, caramel `#A87437`, walnut `#5B4228`, espresso `#2E2218`; Playfair Display + Lora). — *Why:* Lazar chose it from three brown options; the classic literary look fits a writer's site, and the fonts cover Cyrillic + Latin.
24. **Copy must read like a real person — no marketing fluff — and match Dalibor's own voice.** — *Why:* his content is literary; fluff would clash. Lazar to provide blog samples for voice.
25. **Domain deferred to Part 2.** — *Why:* decide nearer launch; Chat to recommend options.

---

## 2026-07-09 — Phase 2.12 (translate singleton prose)

26. **Ship machine-drafted EN/SR translations of the Author + Book singleton prose now** (`author.roles` / `tagline` / `education` / `bio` and `book.description`), via the surgical `scripts/import-translations.mts` patch. — *Why:* Lazar's explicit instruction — until now these en/sr slots were left empty so the site fell back to Macedonian, which meant EN/SR visitors saw untranslated Macedonian on About / Book / Home. **Qualifies #4** ("he is a translator and can provide all three"): the machine text is an **interim first draft pending Dalibor's own review/approval in the Studio**, not a substitute for his wording. Scope is deliberately limited to the two singletons — **review/book *titles* (the `sr`-only content across Reviews/Blog) are NOT machine-translated here**; that remains Dalibor's to supply. Book `publisher` ("ПНВ Публикации") is a proper noun left in its original script (localizing it would need a schema change) — flagged, not changed.

---

## 2026-07-12 — Phase 2.14 (publish → live-site refresh)

27. **Reuse the one `SANITY_WEBHOOK_SECRET` to guard both Sanity → site webhook routes** (`/api/reviews/reindex` and the new `/api/revalidate`), rather than minting a second secret. — *Why:* both are same-origin Sanity webhooks with the same trust boundary; one secret means one value to set on Vercel and to paste into two webhooks, and one rotation covers both. The reindex route's code is byte-unchanged.

28. **Publish-refresh mechanism = Next cache tags + `revalidateTag(tag, {expire: 0})`, fed by a dedicated `useCdn: false` read client (`clientFresh`); the site stays static-by-default.** — *Why:* the canonical Sanity + Next.js App Router recipe. Verification against a real production build proved that with `useCdn: true` the post-revalidate re-fetch reads Sanity's API CDN, which lags per-query and cached a stale render (deletes lingered ~1–2 min, a Home grid never updated) — so the revalidatable blog/review/Home reads go through a CDN-bypassing client, giving deterministic ~sub-second refresh. Kept surgical (a *second* client, not a global flip) so the semantic-search + reindex pipeline stays byte-identical; `{expire: 0}` (not `'max'`) because a webhook needs the *next* visitor to see fresh content, not lazy stale-while-revalidate. The route makes the site *refreshable*, not dynamic.

---

### Decision-log conventions
- **Append only.** Never edit or delete a past entry.
- A **reversed** decision gets a new dated entry that states the change and references the original number (e.g. "Reverses #14: dark mode is now in scope because …").
- Keep each entry to the decision + a short *why*. Details live in the Plan.
