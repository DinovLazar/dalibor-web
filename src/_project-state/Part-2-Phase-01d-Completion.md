# Part-2-Phase-01d-Completion.md

**Phase ID + name:** 2.01d — Cowork: Gather Dalibor's photos into the repo

**Executing Claude:** Cowork

**Date completed:** 2026-07-03

---

### What shipped
- New folder tree `content-packet/assets/` with `author/ book/ banner/ blog/ reviewed-books/`.
- `author/portrait.jpg` — **720×720**, Dalibor's confirmed public author portrait (self-portrait at Tower Bridge, London). Identity verified: the identical photo is used on both his Versopolis author page and his Booksa contributor page, and the Versopolis bio matches him exactly (MA in philology, Skopje; reviewer for Booksa and Beton). The 720×720 Versopolis copy was chosen over the Booksa 576×447 copy as the sharpest available.
- `author/avatar-square.jpg` — **512×512**, a head-and-shoulders face crop of the portrait for the browser-tab icon.
- `assets.json` — valid manifest with exact schema keys; `author_photo.use=true`, `favicon_source`, `book_cover.use="hold"`; mk/en/sr alt text (sr in Latin) filled for portrait and (pre-filled) book cover; empty `reviewed_books`/`blog_images`/`banner` arrays.
- `README.md` — short summary of what's saved, held, and left empty.

### Decisions made on the fly (with why)
- **Portrait source = Versopolis, not the Booksa default in the brief.** Same photo, higher resolution (720×720 vs 576×447). Booksa recorded in the manifest as the corroborating source.
- **Book cover HELD (no file saved).** The only image found is an event promo poster (a 3D angled book mock-up inside a composite with event details + his portrait) on Nova Makedonija — not a clean flat cover — and no MK retailer (literatura.mk, kupikniga.mk, knigoteka.mk) stocks this 2022 PNV Publications title. Per the brief, a wrong/distorted image is worse than the current tasteful placeholder, so `book_cover.use="hold"` with the promo URL recorded for reference. Dalibor to send the real cover.
- **Optional banner / blog / reviewed-book covers left empty.** No genuine wide/landscape photo of Dalibor exists (his canonical image is the square Tower Bridge self-portrait); his own digital artwork is only on Facebook/Instagram behind a login (out of scope — no login used); the 20 reviewed-book covers are the lowest-priority optional and are other authors' books. Left for a later pass rather than shipping uncertain images. The brief explicitly blesses empty optionals.

### Surprises or off-spec changes
- The Q21/MuseumsQuartier Vienna residency candidate page (2015) is now a 404 — dead source.
- **Tooling note:** the sandbox has no outbound network (proxy blocks downloads) and the harness blocks returning raw base64, so images were pulled by having Chrome download them, then moved from the mounted `~/Downloads` into the repo. Chrome's automatic-multiple-download guard silently blocked the download from novamakedonija.com.mk (it allowed versopolis.com); this only affected the held promo poster, which was not needed as a file, so no workaround was attempted.

### Files written / updated
- `content-packet/assets/author/portrait.jpg` — 720×720 author portrait (new).
- `content-packet/assets/author/avatar-square.jpg` — 512×512 favicon source crop (new).
- `content-packet/assets/assets.json` — manifest (new).
- `content-packet/assets/README.md` — folder readme (new).
- Empty dirs: `content-packet/assets/{book,banner,blog,reviewed-books}/`.

### Tests run + results
- `assets.json` parsed with `json.load` — valid. Asserted: portrait `alt.mk` present, `author_photo.use is True`, `book_cover.use=="hold"`.
- Verified every `file` referenced in the manifest exists on disk (portrait, avatar) and that no saved file on disk is missing from the manifest — clean.
- Confirmed image dimensions with PIL: portrait 720×720, avatar 512×512.

### Blocked / carryover items
- **Real „Буники" book cover** — Dalibor to send a clean flat front-cover image (then set `book_cover.use=true`, drop the file at `book/bunike-cover.<ext>`; alt text already drafted).
- **Hi-res / studio portrait** (optional) — if Dalibor has a higher-resolution or more conventional headshot, it can replace the interim 720×720.
- **Reviewed-book covers, blog artwork, hero banner** — optional, deferred; Booksa review pages carry the reviewed-book covers, and Dalibor can supply his own artwork directly.

### What's next
- Phase 2.01e (Code): upload these assets into Sanity per `assets.json` — portrait → `author.photo`, generate the favicon from `avatar-square.jpg`; leave the book cover empty (placeholder) until Dalibor supplies it.

---
*Nothing committed or pushed. No login / CAPTCHA / credential actions taken. No stock or AI-generated images used.*
