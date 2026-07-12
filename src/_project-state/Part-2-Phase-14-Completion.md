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

### Blocked / carryover items — **Deferred — needs the operator**
1. **Merge this PR to `main`** (Lazar's call) → deploys `/api/revalidate` to production. It returns **503 until `SANITY_WEBHOOK_SECRET` is set on the Vercel project** (the reindex webhook already relies on that var, so it is very likely already set — confirm).
2. **Register the Sanity webhook** — `manage.sanity.io` → project **`ndqmaath`** → **API → Webhooks → Create** (mirrors the existing reindex hook):
   - **Name:** `Publish → site revalidate`
   - **URL:** `https://dalibor-web.vercel.app/api/revalidate`
   - **HTTP method:** `POST`  ·  **Dataset:** `production`  ·  **API version:** `v2021-03-25`  ·  **Include drafts:** OFF
   - **Trigger on:** Create · Update · Delete
   - **Filter (load-bearing — the portal saves drafts constantly):** `_type in ["post","review"] && !(_id in path("drafts.**"))`
   - **Projection:** `{_type, _id, "slug": slug.current}`
   - **HTTP header:** `x-webhook-secret` = the value of `SANITY_WEBHOOK_SECRET` (in gitignored `.env.local` on this Mac, and on Vercel — the **same** value the reindex hook uses; never commit it).
   - *This machine's Sanity CLI is authenticated as the project owner and can create the hook via the management API once the route is live — happy to run it as a follow-up on your go.*
3. **Final live proof on the deployed domain** — publish a post in the Studio (or the Vertex portal) and confirm it appears on `https://dalibor-web.vercel.app/{mk,en,sr}/blog` within ~2 min; the local proof above already exercises the full mechanism against a real build + real Sanity.

### What's next
- Per the Phase Plan, the go-live track (2.06 production promote + real domain + drop `PREVIEW_NOINDEX`) and the still-pending Voyage-payment embeddings backfill. This phase makes the site *refreshable*; nothing else in the critical path depends on it.

---
*Reminder: also update `current-state.md` (and `00_stack-and-config.md` if the stack changed) before the phase is considered closed.* — done.
