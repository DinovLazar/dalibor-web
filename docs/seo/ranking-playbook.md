# Ranking for "Dalibor Plečić" — the off-site playbook

**Status:** written 2026-07-18, alongside Phase 2.16.
**Scope:** everything that ranking depends on but *cannot* be fixed in the repo.
The on-site work (structured data, llms.txt, sitemap, canonicals) is done — see
`src/_project-state/Part-2-Phase-16-Completion.md`.

Ordered by leverage. Step 1 is not optional; nothing else matters until it's done.

---

## 1. Unblock the site (blocking — nothing works before this)

The site currently serves `noindex, nofollow` and `robots.txt: Disallow: /`.
Google is forbidden from reading any page, which is why the result reads "No
information is available for this page."

**Vercel → Settings → Environment Variables → Production, then redeploy:**

| Variable | Action |
|---|---|
| `PREVIEW_NOINDEX` | **Delete** (or set empty) |
| `NEXT_PUBLIC_SITE_URL` | **Set** to `https://www.daliborplecic.com` |

**Verify after the redeploy** — all four must be true:

1. `https://www.daliborplecic.com/robots.txt` shows `Allow: /` and a `Sitemap:` line
2. Page source has **no** `<meta name="robots" content="noindex">`
3. `<link rel="canonical">` names `daliborplecic.com`, **not** `vertexconsulting.mk`
4. `https://www.daliborplecic.com/llms.txt` returns text (it 404s while noindexed)

---

## 2. Decide www vs apex (do it before step 3)

The site serves `www.daliborplecic.com`; Google indexed the apex
`daliborplecic.com`. Running both as if they were one site splits the signal.

Pick one — **www is the lower-effort choice**, since that's what already serves.
Then make the other 301-redirect to it, and make sure `NEXT_PUBLIC_SITE_URL`
matches the winner exactly. Vercel does this in Project → Domains by marking one
domain as the redirect target.

---

## 3. Google Search Console (biggest speed-up available)

Without this, you wait for Google to re-crawl on its own schedule — which, for a
site it was told to ignore, can take **months**. With it, you can ask directly.

**Use a *domain property*, not a URL prefix property.** A domain property covers
www + apex + http + https in one, which sidesteps the split in step 2 entirely.
It requires DNS verification, which is why no code change was needed for this.

1. [search.google.com/search-console](https://search.google.com/search-console) → Add property → **Domain** → `daliborplecic.com`
2. Google gives you a TXT record. Add it at your DNS provider (wherever the domain's nameservers point — Vercel DNS or Cloudflare).
3. Verify.
4. **Sitemaps** → submit `sitemap.xml`.
5. **URL Inspection** → paste the homepage → **Request indexing**. Repeat for `/en/about`, `/mk`, and 2–3 of the strongest reviews. This is the single fastest lever you have.
6. Check **Pages** after a week — it will show anything still excluded and why.

Do the same at [Bing Webmaster Tools](https://www.bing.com/webmasters) — it takes
five minutes, imports straight from Search Console, and Bing's index is what
ChatGPT search reads from.

---

## 4. Backlinks from the sites already outranking him

This is the highest-leverage *content* work, it's free, and it's just asking.

Right now these pages rank for his name and the new site doesn't. Each one that
links to `daliborplecic.com` transfers authority **and** confirms to Google that
the profile and the site are the same person.

| Site | Page | The ask |
|---|---|---|
| Booksa | [suradnici/dalibor-plecic](https://booksa.hr/suradnici/dalibor-plecic) | Add his site to the contributor bio |
| Versopolis | [author/54](https://www.versopolis.com/author/54/dalibor-plecic) | Add site link to the author page |
| Partizanska knjiga | [translator/dalibor-plecic](https://partizanskaknjiga.rs/translator/dalibor-plecic/) | Add site link to the translator page |
| Beton | his review archive | Add site to his contributor byline |
| MQ Wien / Q21 | [artists-in-residence 2015](https://www.mqw.at/en/institutions/q21/artists-in-residence/2015/dalibor-plecic/) | Add site link to the residency profile |
| PNV Publications | the *Bunike* page | Link the author name to his site |

**Dalibor should send these, not you** — an editor answers the writer they know.
Suggested wording, in his voice, kept short:

> Здраво [име],
>
> Ја средив својата страница — сега сè што пишувам е на едно место:
> https://www.daliborplecic.com
>
> Ако е можно, дали би можеле да го додадете линкот кон мојата биографија кај вас?
> Ви благодарам.

Then the free ones he controls himself, same day:
**Instagram bio, Facebook About, LinkedIn "Website" field, YouTube channel
description.** These are weaker signals individually but they're instant, and
they're already in his `sameAs` schema — so the link becomes mutual, which is
exactly the confirmation Google looks for.

---

## 5. Wikidata entry (the Knowledge Panel lever)

A Knowledge Panel — the box on the right with his photo and bio — is the
strongest possible "this is the official site" result. Google builds those partly
from **Wikidata**, which it ingests directly and which is far easier to get into
than Wikipedia.

Dalibor plausibly meets Wikidata's notability bar: a published book (*Bunike*,
PNV Publications, 2022), published translations, a documented residency at Q21
MuseumsQuartier Vienna, and author pages at three independent literary outlets.
That's the "recognized by multiple authoritative sources" test, which is the
actual criterion — not fame.

Create the item at [wikidata.org](https://www.wikidata.org) with: name (plus
Cyrillic forms Далибор Плечиќ / Далибор Плечић), occupation (writer, literary
critic, translator), notable work (*Bunike*), languages, **official website =
daliborplecic.com**, and a reference for each claim pointing at Booksa,
Versopolis, Partizanska knjiga or MQ Wien.

Honest expectation: a Wikidata item alone does not summon a panel. It's one
input, and it works because everything in step 4 corroborates it.

---

## 6. What not to bother with

- **Buying links / directory blasts.** For a name query this does nothing and risks a penalty.
- **Keyword-stuffing his name** into page copy. The Person schema already states it; repetition reads as spam and the site's copy standard forbids it.
- **Meta keywords.** Dead for twenty years.
- **Chasing generic terms** like "book reviews". Wrong fight — his name is the query that matters, and it's winnable.

---

## Realistic timeline

Assuming step 1 happens this week and step 3 shortly after:

| When | What |
|---|---|
| 1–3 days | Google re-crawls after a manual indexing request; the snippet fills in with the real title and description |
| 1–3 weeks | Ranks on page 1 for his name; sitelinks may appear |
| 1–2 months | Competing for the #1 position with the social profiles |
| 2–6 months | Knowledge Panel becomes plausible *if* steps 4 and 5 are done |

**#1 for his own name is a realistic target — but nobody can guarantee it, and
anyone who does is selling something.** The social profiles are strong domains.
What wins is the exact-match domain plus the corroboration from step 4.

---

## Sources

- [Google Search Central — Block Search indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Indexed, though blocked by robots.txt — diagnosis](https://seotesting.com/google-search-console/indexed-though-blocked/)
- [Wikidata:Notability](https://www.wikidata.org/wiki/Wikidata:Notability)
- [Person schema for authors — 2026 practice](https://www.capconvert.com/learn/blog/how-to-create-person-schema)
- [Google Knowledge Panel for a person — 2026 guide](https://12amagency.com/blog/google-knowledge-panel-for-person/)
