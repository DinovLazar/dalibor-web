# Part-2-Phase-14-Completion.md

**Phase ID + name:** 2.14 — Code — Publish → live-site refresh (`/api/revalidate` + Sanity webhook)

**Executing Claude:** Code

**Date completed:** 2026-07-12

---

### What shipped
- **`POST /api/revalidate`** (`src/app/api/revalidate/route.ts`) — a secret-gated Sanity-webhook receiver, modelled byte-for-byte in spirit on its sibling `/api/reviews/reindex`:
  - `SANITY_WEBHOOK_SECRET` **unset → 503**; wrong/absent `x-webhook-secret` header → **401**; malformed JSON → **400**.
  - Reads the webhook projection `{_type, _id, "slug": slug.current}` and, per document type, busts the cache tags behind the surfaces it affects: `post` → `post` (blog index + Home "From the blog") + `post:<slug>` (that single post); `review` → `review` (reviews index + Home "Latest reviews") + `review:<slug>` (that single review).
  - **Ignores drafts defensively** — a `drafts.*` `_id` returns `200 {revalidated:false, reason:"draft"}` and touches nothing (belt-and-braces with the webhook's own `!(_id in path("drafts.**"))` filter). Unknown `_type` → `200 {revalidated:false, reason:"ignored-type"}`.
  - Uses **`revalidateTag(tag, {expire: 0})`** — the Next 16 documented pattern for webhook-driven *immediate* expiration (the bare single-arg `revalidateTag(tag)` is now a type error). Response body is `{revalidated, tags}` — no secret, no internals.
- **Cache-tag plumbing** so the revalidation is *real*, not theoretical:
  - New `src/sanity/lib/tags.ts` — the single source of the tag names (`POST_TAG`/`REVIEW_TAG` + `postSlugTag`/`reviewSlugTag`), imported by both the pages that tag their fetches and the route that busts them.
  - New **`clientFresh`** in `src/sanity/lib/client.ts` — `client.withConfig({useCdn: false})`. The blog/review/Home content fetches now go through it, `force-cache`d + tagged. `client` (`useCdn: true`) is **untouched**, so the search + reindex pipeline is byte-identical.
  - The six revalidatable fetches (Home posts+reviews grids, blog index, blog single, reviews index, reviews single) tagged + `force-cache`d; the non-content fetches (hero, book, topics, `generateStaticParams` slugs, sitemap, search, reindex) left exactly as they were.
- **Docs + env contract:** `.env.example` now documents that the **existing** `SANITY_WEBHOOK_SECRET` is deliberately **reused** to guard both `/api/reviews/reindex` and `/api/revalidate`; `docs/dalibor-publishing-guide.md` gains a plain-language "How soon does it show up?" note (a published/edited/unpublished piece reaches the live site within a minute or two, **and this now also covers posts written in the Vertex blog portal**).

### Decisions made on the fly (with why)
- **`useCdn: false` for the revalidatable reads (via a dedicated `clientFresh`), not a global flip.** The brief flagged this: "whatever useCdn / perspective adjustment that requires — verify it, do not assume it." Verification against the **real production build** initially exposed that with `useCdn: true` revalidation is **non-deterministic**: the post-`revalidateTag` re-fetch hits Sanity's API CDN, which lags up to ~60 s per query and is cached edge-side — so a deleted post lingered on the index for **~60–118 s**, and the Home "Latest reviews" regenerated against a stale CDN response and **cached the stale render** (never updated within the 120 s poll). Switching the content reads to `useCdn: false` made every surface refresh in **55–400 ms**, deterministically. It's the canonical Sanity + Next.js recipe. Kept it surgical (a second client) rather than flipping the shared `client`, so the semantic-search + reindex code and behaviour stay **byte-identical** — respecting the "don't touch the search pipeline" boundary.
- **`revalidateTag(tag, {expire: 0})` over `'max'`.** Next 16's `'max'` profile is lazy stale-while-revalidate (first visitor after a publish still sees stale). For a low-traffic personal site, `{expire: 0}` — the doc's explicit "webhooks / third-party services that need immediate expiration" form — guarantees the *next* visitor sees fresh content. Deterministic and provable.
- **`force-cache` on the tagged fetches.** Makes the dynamic index fetches (`ƒ`, they read `searchParams`) participate in the Data Cache too, so between publishes they're served from Next's cache (one Sanity round-trip per publish, not per view) and only the tag-bust re-fetches. Static Home/single pages were already prerendered-cached; `force-cache` is harmless there and keeps the intent uniform.
- **Reuse `SANITY_WEBHOOK_SECRET` for both webhooks** (rather than minting a second secret). One secret to set on Vercel and to paste into two Sanity webhooks; same trust boundary; a single rotation covers both. Recorded as Decision #27.
- **Did not register the webhook from this machine — handed it off (see below).** I *do* have the capability (this Mac's Sanity CLI is authenticated as the project owner; I verified it can read the project's hooks — the reindex hook already exists at `https://dalibor-web.vercel.app/api/reviews/reindex`). I deliberately deferred because the `/api/revalidate` route only exists on production once **Lazar merges this PR** (the repo's hard "merge only on Lazar's go" rule); a hook created now would fire into a 404 until then. The exact registration is handed over below.

### Surprises or off-spec changes
- The `useCdn: true` staleness (above) — surfaced by verification, fixed with `clientFresh`. This is the one meaningful deviation from a naive "just add tags" reading of the brief, and it's exactly the adjustment the brief anticipated.
- The **reindex webhook is already registered** in project `ndqmaath` (contrary to older state notes that called it "pending Cowork"): `Review re-index (embeddings)` → `https://dalibor-web.vercel.app/api/reviews/reindex`. This confirmed the production base URL and the `x-webhook-secret` pattern to mirror.

### Files written / updated
- `src/app/api/revalidate/route.ts` — **new.** The secret-gated revalidate receiver.
- `src/sanity/lib/tags.ts` — **new.** Cache-tag names + per-slug builders (single source of truth).
- `src/sanity/lib/client.ts` — added `clientFresh` (`useCdn: false`); `client` unchanged.
- `src/app/[locale]/page.tsx` — Home posts/reviews grids via `clientFresh` + `force-cache` + `POST_TAG`/`REVIEW_TAG`.
- `src/app/[locale]/blog/page.tsx` — index list via `clientFresh` + `force-cache` + `POST_TAG`.
- `src/app/[locale]/blog/[slug]/page.tsx` — `getPost` via `clientFresh` + `force-cache` + `postSlugTag`.
- `src/app/[locale]/reviews/page.tsx` — index list via `clientFresh` + `force-cache` + `REVIEW_TAG`.
- `src/app/[locale]/reviews/[slug]/page.tsx` — `getReview` via `clientFresh` + `force-cache` + `reviewSlugTag`.
- `.env.example` — documents the reused `SANITY_WEBHOOK_SECRET` now guarding both webhook routes.
- `docs/dalibor-publishing-guide.md` — plain-language live-refresh note (incl. the Vertex portal).
- `src/_project-state/{current-state,file-map}.md`, `Dalibor-Website-Decisions.md` (#27), `00_stack-and-config.md` — updated per workflow.

### Tests run + results
- **`npm run lint`** — clean.
- **`rm -rf .next && npm run build` (webpack)** — clean; **only new route is `/api/revalidate` (`ƒ`)**; Home + single pages stayed **`●` SSG**, indexes stayed **`ƒ`** — no page-count regression. Reindex route diff vs `main` = **empty (byte-identical)**; no schema/`sanity.types`/i18n/messages/design touched.
- **Route guard unit run** (temp harness, since removed) — imported the handler directly: **503** unconfigured / **401** wrong secret / **401** missing header / **400** bad JSON / **200 draft-ignored** / **200 ignored-type** all pass.
- **Live end-to-end against the production build (`npm run start`) with real Sanity writes** (`SANITY_WRITE_TOKEN`) — a temp `zzz-…` post and review created + published, revalidated, then deleted (fully torn down; verified **0 leftover docs**). All pass:
  - Home provably **stale before** revalidate (proves the static cache), **still stale after a wrong-secret 401** (nothing revalidated).
  - After the correct call (`200 {revalidated:true, tags:[…]}`): the post appeared on **`/mk/blog` (400 ms), `/en/blog` (60 ms), `/sr/blog` (55 ms)**, its **own URL (123 ms)**, and the **Home "From the blog" grid (166 ms)**.
  - The review appeared on **`/mk,/en,/sr /reviews` (56–180 ms)**, its **own URL (103 ms)**, and **Home "Latest reviews" (110 ms)**.
  - **Delete + revalidate:** dropped from the index (**94–130 ms**), single page **404s** (**103–118 ms**), gone from Home (**~110 ms**).
  - *(Note: verification used a real production build, not `next dev` — the Data Cache is disabled in dev, so a dev run would show fresh data without any revalidation and give a false positive. That's why the preview/dev tooling was intentionally not used.)*

### Go-live follow-up (done this session, after PR #8 merged)
The first PR (#8) merged to `main` → `/api/revalidate` deployed to production; a wrong-secret probe returned **401 (not 503)**, confirming `SANITY_WEBHOOK_SECRET` is already set on Vercel. Two things then closed the loop (a second PR, `phase/2.14-revalidate-hardening`):

1. **Route hardened to accept both payload shapes.** The management API + Sanity CLI on this machine can only create **legacy "document" webhooks** (the existing reindex hook is one) — they ship the *whole document*, so `slug` arrives as the `{current}` **object**, not the flattened `slug.current` **string** a GROQ webhook's projection produces. Rather than depend on the dashboard-only GROQ webhook, the route now reads `slug` from **either** shape (new `readSlug()` — string, or `{current}` object, else `""`). This is also just good defensive parsing of an untrusted payload; the string path (GROQ projection) is unchanged. Proven locally against the prod build: string slug → `["post","post:hello-world"]`, object slug → `["review","review:my-review"]`, `{}`-current → `["post"]` (graceful).
2. **Webhook registered** in project `ndqmaath` (via the management API, CLI-owner token) — id `9Xj3Y1ac51WdKzR0`:
   - **URL** `POST https://dalibor-web.vercel.app/api/revalidate` · **dataset** `production` · **httpMethod** `POST` · **triggers** create/update/delete · **`includeDrafts: false`** · header **`x-webhook-secret`** set to the shared secret.
   - **Draft exclusion is satisfied** by `includeDrafts: false` (draft saves send *nothing*) **plus** the route's `drafts.*` guard — the same outcome the brief's GROQ `!(_id in path("drafts.**"))` filter targets. A legacy document webhook can't carry that GROQ filter or a type filter, so it also fires on `author`/`book`/`topic` publishes — those are **no-ops** (the route returns `ignored-type`); acceptable given how rarely the singletons/topics change.
3. **Live end-to-end proof on the deployed domain** (`https://dalibor-web.vercel.app`) via the *real* webhook — a marked test post + review published through the write token, the webhook fired on its own, the pieces appeared on the live `/{mk,en,sr}` index + single + Home, then delete removed them; test docs torn down. *(Results recorded in `current-state.md`.)*

### Blocked / carryover — none for this phase
The publish→refresh loop is live end-to-end. (Unrelated, pre-existing: the reindex hook is likewise a legacy document webhook, so `/api/reviews/reindex` — which still expects a **string** `slug` — may reject its deliveries; out of scope here and moot until the Voyage-payment embeddings backfill, but flagged.)

### What's next
- Per the Phase Plan, the go-live track (2.06 production promote + real domain + drop `PREVIEW_NOINDEX`) and the still-pending Voyage-payment embeddings backfill. This phase makes the site *refreshable*; nothing else in the critical path depends on it.

---
*Reminder: also update `current-state.md` (and `00_stack-and-config.md` if the stack changed) before the phase is considered closed.* — done.
