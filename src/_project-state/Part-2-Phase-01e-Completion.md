# Part-2-Phase-01e-Completion.md

**Phase ID + name:** 2.01e — Upload Dalibor's photos to Sanity + set the site favicon

**Executing Claude:** Code

**Date completed:** 2026-07-03

---

### What shipped
- **Dalibor's author portrait is LIVE.** His interim portrait (`content-packet/assets/author/portrait.jpg`, 720×720 Tower Bridge self-portrait — his canonical public photo across Versopolis + Booksa) was uploaded to Sanity and set on the **`author.photo`** `localizedImage` field with alt text in **mk/en/sr**. It now renders on the **About** page (4:5 frame, via `next/image` through the Sanity CDN) and is available to the Home hero.
- **The `Буники` book cover was correctly left as a placeholder.** The manifest carries `book_cover.use = "hold"` with no file (Cowork found no genuine flat cover online — only an event promo poster), so the importer skipped it and the Book page keeps its tasteful parchment placeholder, awaiting Dalibor's real cover.
- **`scripts/import-assets.mts`** (`npm run import:assets`) — a new idempotent image importer mirroring `import-content.mts`: same write client (`SANITY_WRITE_TOKEN`, `useCdn:false`), the Zaporožac abort-before-write scrub, and `--dry-run`. For each `use:true` entry it uploads the asset (`writeClient.assets.upload`, content-hash id → naturally idempotent) and sets the target field via **`patch(...).set(...)`** (not `createOrReplace`, so sibling fields survive). **Preserve-if-set:** any field that already has an `asset._ref` is skipped (a Studio-side upload is never clobbered) unless `--force`. Fails loudly on a missing file, a missing `alt.mk`, or an unknown/absent target document. Prints a `uploaded / set / skipped(already-set) / held(use!=true)` tally + a per-target list.
- **Site favicon set.** `src/app/icon.png` (512×512) + `src/app/apple-icon.png` (180×180), generated from `content-packet/assets/author/avatar-square.jpg` by **`scripts/make-favicon.mts`** (`npm run make:favicon`, uses `sharp`). Next.js auto-emits `<link rel="icon" … sizes="512x512">` + `<link rel="apple-touch-icon" … sizes="180x180">` (verified in the built HTML).
- **Branding cleanup.** Deleted the framework default `src/app/favicon.ico` (so `icon.png` is authoritative) and the 5 unused create-next-app scaffold SVGs in `public/` (`vercel/next/file/globe/window.svg`) — grep confirmed zero references first; `public/` is now empty.
- **`sharp@0.34.5`** pinned in `devDependencies` (favicon generation only — not shipped in the app bundle).
- Cowork's `content-packet/assets/**` image packet is now **committed** (it was untracked before this phase).

### Decisions made on the fly (with why)
- **Favicon source = `avatar-square.jpg`, used directly with no extra cropping.** This is the manifest's primary path; Cowork already produced a square 512² face crop, so `sharp` only resizes + re-encodes to PNG. I did **not** fall back to center-cropping `portrait.jpg` (the manifest note did not ask Code to crop). The crop is left-anchored (his face sits left-of-centre with a little sky top-right); it's clearly recognizable as him at tab size, so I left the framing as Cowork set it.
- **No legacy `favicon.ico` emitted.** The brief made this optional ("only if trivial"). It is **not** trivial — `sharp` cannot write `.ico`, so it would require adding another dependency (e.g. `png-to-ico`). The PNG `icon`/`apple-icon` files cover modern browsers, so I skipped the `.ico`. (If a legacy `.ico` is ever wanted, add `png-to-ico` and extend `make-favicon.mts`.)
- **`sharp` added to devDeps even though it was already present transitively.** A committed script must not depend on a transitive package that a future `npm install` could prune. Pinned exact (`0.34.5`, the installed version). It is dev-only and does not affect the build or runtime (`next/image` uses its own optimizer).
- **Unhandled manifest keys warn, not abort.** `import-assets.mts` handles the enumerated keys (`author_photo`, `book_cover` singletons; `reviewed_books`/`blog_images`/`banner` arrays; ignores `favicon_source`). If a future Cowork pass adds a new top-level category, the script logs a loud WARNING that it's being ignored rather than hard-failing — so it still runs, but a real image can't be silently missed unnoticed. (Missing files / missing `alt.mk` / unknown docIds remain hard, non-zero-exit failures, as specified.)

### Surprises or off-spec changes
- **Static page count is 98, not 97 — this is not a regression.** The count rose by exactly 1 because the icon files swap route entries: `-1` for the removed `favicon.ico` route, `+2` for the new `icon.png` + `apple-icon.png` static routes. Every content route from 2.01c is still present (home×3, about×3, book×3, contact×3, privacy×3, blog + 1 post×3, 20 reviews×3 = 60, opengraph×3, twitter×3, sitemap/robots).
- **axe on About + Book = 0 violations in page content.** The only flag axe raises is `color-contrast` × 10, and all 10 nodes are in the **footer** (`text-on-footer` link spans + the `mailto` link) — the documented axe background-detection false-positive from 2.01b (real cream-on-walnut ≈ 8:1). The new portrait image carries required alt text, so it introduces **no** `image-alt` violation (confirmed: the rendered `<img>` has `alt="Портрет на Далибор Плечиќ"`).
- **Process note (no repo effect):** the reused dev server had been started before I ran `rm -rf .next`, which corrupted its running chunk cache (500s on every route). I stopped and restarted it cleanly; it then compiled and rendered fine. To run axe in-browser I temporarily served `axe-core` via a throwaway `public/axe.min.js`, then deleted it (and the recreated `public/` dir) — the repo is clean of it.

### Files written / updated
- `scripts/import-assets.mts` — **new.** Idempotent image importer (see above).
- `scripts/make-favicon.mts` — **new.** Generates `icon.png` + `apple-icon.png` from the avatar via `sharp`.
- `src/app/icon.png` — **new.** 512×512 browser-tab icon (Dalibor's avatar).
- `src/app/apple-icon.png` — **new.** 180×180 apple-touch-icon.
- `src/app/favicon.ico` — **deleted** (default framework icon).
- `public/{vercel,next,file,globe,window}.svg` — **deleted** (unused scaffold; `public/` now empty).
- `package.json` — + `import:assets` + `make:favicon` scripts; + `sharp@0.34.5` in devDependencies.
- `package-lock.json` — reflects the `sharp` devDep.
- `content-packet/assets/**` — **now committed** (Cowork's manifest + portrait + avatar-square, previously untracked).
- `src/_project-state/current-state.md`, `file-map.md`, `00_stack-and-config.md` — updated for 2.01e.
- `src/_project-state/Part-2-Phase-01d-Completion.md` — committed (Cowork's 2.01d report, previously untracked).
- `src/_project-state/Part-2-Phase-01e-Completion.md` — this report.
- Live data: `author.photo` set in the `production` dataset (asset `image-35592755…-720x720-jpg`).

### Tests run + results
- **Importer runs:** `--dry-run` → planned `author_photo → author.photo`, held `book_cover`. Real run → `uploaded=1 set=1 skipped=0 held=1`. **Second run → `uploaded=0 set=0 skipped(already-set)=1 held=1`** (genuine no-op → idempotency proven).
- **Live field verified** via a `writeClient.fetch`: `author.photo.asset._ref` set, `alt = {mk,en,sr}` all present (mk non-empty), asset URL resolves on `cdn.sanity.io/images/ndqmaath/production/…` (matches the allowed `next.config.ts` remote pattern), dims 720×720.
- **`npm run typegen`** — clean, **no diff** (image fields pre-existed). **`npm run lint`** — clean. **`rm -rf .next && npm run build`** — clean, **98/98 static pages** (see note above).
- **Icons:** built HTML links `/icon.png` (512×512) + `/apple-icon.png` (180×180); no `favicon.ico` reference anywhere in built HTML; on the running server `/icon.png` + `/apple-icon.png` → 200 `image/png`, `/favicon.ico` → 404.
- **Rendering:** About page renders Dalibor's portrait live (screenshot captured; `<img>` `complete`, natural 299×374, optimizer 200 `image/jpeg`). Book page renders the held-cover placeholder (0 `<img>`, correct).
- **axe (WCAG 2.0/2.1/2.2 A + AA)** on `/mk/about` and `/mk/book` → **0 content violations** (only the 10 known footer `color-contrast` false-positives). No console errors.

### Blocked / carryover items
- **Real `Буники` book cover** — still pending from Dalibor (held; placeholder renders). When it arrives: drop the file under `content-packet/assets/book/`, set `book_cover.file` + `book_cover.use=true` in the manifest, and re-run `npm run import:assets` (alt text is already drafted). The importer will set `book.coverImage` and skip the already-set portrait.
- **Optional hi-res / studio portrait** — the current 720² portrait is interim; a higher-res or more conventional headshot can replace it (drop-in + `--force`, or clear the field first).
- **Reviewed-book covers / blog artwork / hero banner** — optional, deferred (empty arrays in the manifest).
- **No embeddings backfill / no deploy / no Vercel env touched** (out of scope, unchanged).

### What's next
- Merge `phase/2.01e-photos` → `main` on Lazar's go (branch pushed; **not** merged).
- The standing Part-2 remainder is unchanged: the Voyage embeddings backfill (once a payment method is added) and **2.06 production promote + real domain + final field/Lighthouse check**.

---
*Reminder: `current-state.md`, `file-map.md`, and `00_stack-and-config.md` were updated before filing. Branch `phase/2.01e-photos`; merge to `main` pending Lazar's approval.*
