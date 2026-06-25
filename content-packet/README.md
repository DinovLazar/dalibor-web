# content-packet/

Source material for the Sanity content import (Phase 2.01 / 2.01b).

## Present

- `intake/Dalibor-Intake-Answers-MK.md` — Dalibor's returned intake answers
  (verbatim MK bio §1, book description §2, the 8 translations §5, contact §7,
  links §8). This is the source of truth for the Author + Book singletons and the
  Translations block. **Used by `scripts/import-content.mts`.**

## Pending — required for Phase 2.01c (reviews / posts / topics import)

The Cowork "public-source pass" packet described in the 2.01 completion report was
**never committed to this repo**. The following artifacts must be dropped here
before the reviews/posts/topics/covers import can run:

- `Dalibor-Content-Packet-Reviews-and-Posts.xlsx` — ~78 review rows + blog-post
  rows (per-language text, slugs, source/outlet URLs, reviewed-book metadata,
  topic assignments, cover references).
- `Dalibor-Content-Packet-Singletons-and-Copy.docx` — the ~17-topic taxonomy +
  parked facts.
- `assets/` — image manifest (reviewed-book covers) as URLs + rights flags.
- `notes/` — interviews, book details, links.

Until then, `scripts/import-content.mts` imports the **singletons + translations**
only and logs a clear deferral for the workbook-driven content. Re-running the
script after the packet lands picks up the rest (it is idempotent).
