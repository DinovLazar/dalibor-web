# Part-2-Phase-16-Completion.md

**Phase ID + name:** 2.16 — Search identity: launch-gate diagnosis + entity/AEO structured data

**Executing Claude:** Cowork

**Date completed:** 2026-07-18

---

### Why this phase happened

Not a planned phase. Lazar reported that `daliborplecic.com` ranks on page 2 of Google for "Dalibor Plečić" and displays "No information is available for this page." Diagnosis found two production misconfigurations that make the site un-rankable, plus gaps in the entity markup. The config half is Lazar's to fix in Vercel; the markup half shipped here.

---

### The two blocking findings (NOT fixed in code — Vercel env vars)

These are the actual reason the site cannot rank. **No code change fixes them.**

1. **`PREVIEW_NOINDEX` is still ON in production.** The live site serves
   `<meta name="robots" content="noindex, nofollow">` and `robots.txt` = `Disallow: /`.
   This is the Phase 2.05 preview gate, which per its own documentation should have
   been turned off at launch (2.06). It never was. This alone accounts for the empty
   Google result.

2. **`NEXT_PUBLIC_SITE_URL` still points at the staging domain.** Live pages emit
   `canonical → https://daliborac.vertexconsulting.mk/en` and the full hreflang set
   against that host. Every canonical, hreflang, sitemap URL and the Person `url`
   therefore names the staging domain as authoritative. Unblocking crawling without
   fixing this would credit `vertexconsulting.mk` rather than `daliborplecic.com`.

**Required action (Vercel → Settings → Environment Variables → Production, then redeploy):**
- Delete / empty `PREVIEW_NOINDEX`
- Set `NEXT_PUBLIC_SITE_URL` to `https://www.daliborplecic.com`

**Open decision:** the site serves `www.daliborplecic.com` but Google indexed the
apex `daliborplecic.com`. Whichever is chosen, `NEXT_PUBLIC_SITE_URL` must match it
exactly and the other host must 301 to it.

---

### What shipped

- **Person `@id` graph.** A single stable node id (`${siteUrl}/${defaultLocale}#person`)
  now anchors every mention of Dalibor across the site. WebSite `author`/`publisher`/
  `copyrightHolder`, ProfilePage `mainEntity`, and the `author` of every review, post
  and book all reference that one id, so crawlers and LLMs resolve one entity instead
  of several similar-looking name strings.
- **Person URL bug fixed.** `PERSON_URL` was hardcoded `${siteUrl}/mk`. The default
  locale flipped mk→en on 2026-07-13 and this was missed, so the Person `url`
  disagreed with every canonical and hreflang x-default on the site — weakening the
  exact signal the schema exists to send. Now derived from `routing.defaultLocale`.
- **Person enriched** with `description`, `knowsAbout`, `mainEntityOfPage`, optional
  `image`, and `subjectOf` (the three confirmed interview videos, modelled as
  `VideoObject` — media *about* him, correctly kept out of `sameAs`).
- **`ProfilePage` on /about.** Google's documented pattern for "this page is the
  authoritative profile of this person" — stronger than the bare Person node that
  was there before. Carries the Sanity portrait when one is set.
- **`WebSite` schema on Home**, declaring the site as his in all three languages,
  with localized name/description read from the existing `metadata` namespace.
- **`/llms.txt`** — plain-Markdown description of who he is and what every section
  contains, with the review and blog lists generated live from Sanity so it can't go
  stale. Gated by `previewNoindex` exactly as `robots.ts` is.
- **`getMetadataCopy()`** exported from `lib/seo/metadata.ts` so pages needing the
  localized SEO strings outside `<head>` reuse them instead of hardcoding an English
  copy that would drift.
- **Reviews now use `Review` schema, not `Article`.** Each review page emits
  `Review` + `itemReviewed: Book` (title, author, publisher, year, cover — all
  already present in `REVIEW_BY_SLUG_QUERY`). A generic Article says "a text
  exists"; `Review` says "Dalibor assessed *this book by this author*", which is
  what lets an answer engine handle "what did Dalibor Plečić write about X?" and
  which corroborates the "literary critic" claim in his Person schema with evidence.
- **Sitemap now carries `lastModified`** on review and blog entries, from each
  document's Sanity `_updatedAt` — a recrawl hint, so newly published work is picked
  up sooner. Static pages stay timestamp-less (no single source document).
- **Person schema aligned with his own published bio.** An audit of the live About
  page (mk + en) found it asserts more than the schema did. Added: `jobTitle`
  gains "Professor of literature"; `worksFor` = Zenit (culture magazine, Strumica),
  where he is editor; `affiliation` = Booksa (Zagreb), The Literary Review (New
  Jersey), Beton (Belgrade), the outlets he writes for regularly. These are the
  specific, checkable affiliations an answer engine uses to confirm *which* Dalibor
  Plečić is meant — the highest-value AEO signals available, and sourced from his
  own words rather than the dossier the original guards were written against.
- **MQ Wien / Q21 residency profile added to `sameAs`** (`siteLinks.mqWien`,
  schema-only, not rendered). An institutional third-party profile page on a `.at`
  domain is a strong identity signal; his bio names the residency and the page was
  verified live 2026-07-18. `sameAs` is now 7 profiles.
- **`docs/seo/ranking-playbook.md`** — the off-site half of the work, researched and
  written as ordered, copy-paste-executable steps: the env unblock, the www/apex
  decision, Search Console via a DNS-verified domain property, backlink outreach
  (with a Macedonian email template for Dalibor to send), and a Wikidata entry as the
  Knowledge Panel lever. Includes a realistic timeline and an explicit "don't bother
  with this" list.

### Decisions made on the fly (with why)

- **No `SearchAction` in the WebSite schema.** The obvious win would be the sitelinks
  search box, but the review topic-search is a POST-only API with no crawlable `?q=`
  URL. Advertising a search endpoint that doesn't exist would point crawlers at
  nothing. Omitted deliberately; revisit if a GET search URL is ever added.
- **YouTube channel NOT added to `sameAs`.** A channel (`@daliborplecic5310`) ranks
  for his name and would be a strong identity signal, but it is not in the confirmed
  intake links and could not be verified in this session. Following the file's
  existing guard convention, an unverified profile is not asserted. **Needs Dalibor
  to confirm the channel is his — then add it.**
- **Interviews modelled as `subjectOf`, not `sameAs`.** `sameAs` means "this URL is
  another profile of this entity"; an interview video is *about* him, not a profile
  of him. Putting videos in `sameAs` is a common mistake that muddies the entity.
- **Person `description` written only from what the site actually publishes** (reviews,
  essays, *Bunike*). No biographical claim that isn't visible on the site.
- **No `reviewRating` on the Review schema.** A rating would unlock Google's star
  rich-result, but Dalibor writes criticism, not scored reviews — inventing a number
  to win a snippet would be a fabrication. The schema stays honest and forgoes the star.
- **Sitemap `lastModified` fetched with a raw GROQ string, not a `defineQuery`.**
  Adding `_updatedAt` to the typed slug queries would leave the checked-in TypeGen
  output stale until someone re-ran `npm run typegen` — and `sanity typegen` cannot
  run in this sandbox to regenerate it. Coupling the build to a manual step for a
  sitemap timestamp is a bad trade, so the query is inline with an explicit return
  type instead. Deviates from the file's convention; flagged here deliberately.
- **Search Console verification: no code, use DNS.** The planned approach was a
  `google-site-verification` meta tag driven by an env var. Dropped in favour of a
  GSC *domain property* verified by DNS TXT — it covers www + apex + both protocols
  in one property (which matters while www vs apex is unresolved), survives
  redeploys, and needs no code. It also avoided editing `layout.tsx`, which the
  upstream commits already touch.

### Surprises or off-spec changes

- **Git could not be used.** The sandbox mount cannot remove `.git` lock files
  (`Operation not permitted`), so branch/stash/pull/commit all fail. No phase branch
  was created and nothing was committed. **Version control is entirely Lazar's to
  run.**
- **Local `main` is 4 commits behind `origin/main`** (shiny wordmark 2.15 + Vercel
  Analytics). Edits were made on the stale tree, but the upstream commits touch
  `layout.tsx`, `globals.css`, `site-header.tsx`, `wordmark.tsx`, `shiny-button.tsx`
  and `package*.json` — **zero overlap** with the files changed here, so a pull will
  merge cleanly.
- **The uncommitted local changes are already upstream.** The working tree's
  `package.json` / `package-lock.json` / `layout.tsx` edits are a local re-do of the
  Vercel Analytics install that already landed on `origin/main` in commit `60b3ee4`.
  They were left untouched, but are almost certainly safe to discard before pulling.
- **`npm run build` cannot run in the sandbox.** `node_modules` is installed for
  darwin-arm64; the sandbox is linux-arm64, so native binaries (`@parcel/watcher`,
  `esbuild`) fail with `Exec format error`. **The full build must be run locally.**

### Files written / updated

- `src/lib/seo/jsonld.ts` — `PERSON_ID` graph node; `PERSON_URL` derived from
  `routing.defaultLocale`; `personJsonLd()` takes options and gained description /
  knowsAbout / mainEntityOfPage / image / subjectOf; new `profilePageJsonLd()` and
  `websiteJsonLd()`.
- `src/lib/seo/metadata.ts` — new exported `getMetadataCopy()`.
- `src/app/[locale]/page.tsx` — emits WebSite + Person.
- `src/app/[locale]/about/page.tsx` — emits ProfilePage (replacing bare Person),
  passing the portrait.
- `src/app/[locale]/reviews/[slug]/page.tsx` — emits `Review` + `itemReviewed`
  instead of `Article`.
- `src/app/sitemap.ts` — `lastModified` on review + blog entries from `_updatedAt`.
- `src/app/llms.txt/route.ts` — **new.**
- `docs/seo/ranking-playbook.md` — **new.** Off-site playbook.
- `src/_project-state/Part-2-Phase-16-Completion.md` — this report.

*(`articleJsonLd` is now used only by the blog route. Left in place — it is the
correct type for posts.)*

### Tests run + results

- `npx tsc --noEmit` — **exit 0**, clean.
- `npx eslint` on all five changed/added files — **exit 0**, clean.
- **Structured-data verification:** builders bundled and executed against
  `NEXT_PUBLIC_SITE_URL=https://www.daliborplecic.com`; output inspected and asserted.
  11/11 checks pass — every block carries `@context`, the nested Person correctly does
  *not*, all five schemas resolve to the same Person `@id`, the portrait is carried,
  no `null`/`undefined` leaks, three languages declared, no phantom `SearchAction`.
- **Review schema verification:** 7/7 checks pass — type is `Review`, the reviewer
  resolves to Dalibor's shared `@id`, `itemReviewed` is a `Book`, the reviewed book's
  author is a *separate* Person carrying **no** `@id` (so it can never be conflated
  with Dalibor — the main risk in this change), no fabricated `reviewRating`, both
  dates present.
- **Not run:** `npm run build` (sandbox platform mismatch — see above), Lighthouse,
  and Google's Rich Results Test (site is still `noindex`, so it cannot be fetched
  by external validators until the env fix lands).

### Open question surfaced (needs Dalibor)

**Is *Bunike* a novel or a short-story collection?** The `bookJsonLd` GUARD comment
says sources disagree, and that is still true — the disagreement is now precisely
located:

- **His own About page (mk + en)** says short-story collection — "збирката раскази
  „Буники“" / "the short-story collection *Bunike*".
- **The Q21 MuseumsQuartier profile** (2015, now in `sameAs`) says
  "Novel Bunike (Henbane), book of short stories *Zaporožac*" — i.e. it calls
  *Bunike* a novel and names a *different* title as the collection.

The site's own copy is the more recent and more authoritative source, so the guard
was left in place rather than resolved unilaterally. One sentence from Dalibor
settles it, and would let `genre`/`bookFormat` be asserted on the Book schema.
Worth resolving: a contradiction between his site and a page he links as `sameAs`
is exactly the kind of inconsistency that slows Knowledge Graph confidence.

*(Also noted: the Q21 page lists nationality Serbia / residence Belgrade, while the
site is Macedonia-focused. Not an SEO defect, but flagged since the two pages are
now formally linked.)*

### Blocked / carryover items

- **Lazar:** fix the two Vercel env vars and redeploy. Nothing in this phase has any
  effect until that happens — the markup is invisible while the site is `noindex`.
- **Lazar:** decide www vs apex and make the other 301.
- **Lazar:** run `npm run build` locally to confirm, then commit/push.
- **Dalibor:** confirm the YouTube channel so it can join `sameAs`.
- **Deferred:** Google Search Console verification + sitemap submission — the fastest
  way to watch the ranking actually move, and worth its own short phase once the site
  is crawlable.
- **Deferred:** backlink outreach (Booksa, Versopolis, Partizanska knjiga, Beton) to
  link his name to the new domain. Cowork-led, highest-leverage remaining SEO work.

### What's next

Env fix + redeploy, then verify live (`robots.txt` allows, canonical names the real
domain, Rich Results Test passes), then Search Console.

---
*`current-state.md` / `file-map.md` not updated — they were modified by the 4 upstream
commits not present locally, and editing the stale copies would create a conflict for
no gain. They should be updated after the pull.*
