# Part-2-Phase-05-Completion.md

> **Location in repo:** `src/_project-state/`
> Filed by Claude Code at the close of Phase 2.05 (preview/verify pass). Lazar pastes this back to Chat to close the phase.

---

**Phase ID + name:** 2.05 — Verify the Vercel preview, fix what it surfaced, record on-infra results

**Executing Claude:** Code

**Date completed:** 2026-06-13

**Status:** 🟢 **Preview / verify pass complete (repo side).** Build confirmed succeeding; live deploy verified; the one mandated code fix (env-gated `noindex`) shipped + locally verified; on-infra Lighthouse + Rich Results recorded. **The DoD's "live preview is correct" items require three Vercel env vars to be set + a redeploy — which only Cowork/Lazar can do** (no Vercel CLI in this environment, no env-management tool). Those are handed off below. **Production promote + real domain remain deferred to 2.06.**

---

### Orientation note — the expected handover did not exist
The brief referenced `Part-2-Phase-05-Cowork-Handover.md` (preview URL, env vars, PageSpeed, Rich Results, build log). **No such file exists** — Cowork imported the repo into Vercel but never filed a 2.05 handover. So I reconstructed the live picture directly from the Vercel project (via the Vercel MCP) + by probing the live URLs. Findings below are first-hand, not from a handover.

### What I found on real infra
- **Remote matches:** `git remote -v` → `https://github.com/DinovLazar/dalibor-web.git`; the Vercel project `dalibor-web` (team `dinovlazars-projects`) deploys from that exact repo/branch (`main`). ✅
- **Build SUCCEEDS** (so Step 1 was moot): **4 deployments, all `READY`**, Node **24.x**, framework `nextjs`. Latest = commit `62c3613` (Phase 2.02).
- **Topology deviation (important):** every deployment has **`target: production`** and the project carries **real custom domains** (`dalibor-web.vercel.app`, `daddybor.optimind000.com`, `daliborac.vertexconsulting.mk`, + the git/alias hosts). So the GitHub `main` branch is wired to deploy straight to **production on live domains** — this is **not** the isolated, Vercel-noindexed *preview* the 2.05/2.06 split assumed. The placeholder site is, right now, publicly reachable on real domains.
- **Three optional env vars were never set on the Vercel project**, each surfacing a real issue (the Sanity vars *are* set — the build would fail and no content would render otherwise):
  1. **No `noindex`** — `curl` of `/mk` returns **no `x-robots-tag` header and no `<meta name="robots">`**. Combined with the production/real-domain topology, that means **an indexable placeholder site**. → the brief's blocker.
  2. **`NEXT_PUBLIC_SITE_URL` unset** → the SEO layer falls back to `http://localhost:3000`. Confirmed on the live site: **canonical, all hreflang, `og:url`, `og:image`, `twitter:image`, `/sitemap.xml`, `/robots.txt` (Host + Sitemap lines), and JSON-LD `url`/`@id` all emit `localhost`.** This also fails Lighthouse's `canonical` audit (the sole SEO miss).
  3. **`NEXT_PUBLIC_FORMSPREE_ENDPOINT` unset** → the build didn't inline the endpoint, so the Contact `<form>` renders with `method="POST"` but **no `action`** and zero `formspree.io` references = **preview/no-send mode**. (`.env.local` holds the real value but is gitignored, so it never reached the Vercel build.)

### What shipped (code)
- **Env-gated, site-wide `noindex`** — exactly as the brief prescribed ("a `PREVIEW_NOINDEX` flag honored by the root metadata + robots.txt"):
  - `src/sanity/env.ts` exports **`previewNoindex`** = `/^(1|true|yes|on)$/i` test on the trimmed `PREVIEW_NOINDEX` (server-side, **not** `NEXT_PUBLIC_` — it's read at build time where the pages prerender; unset = off).
  - `src/app/[locale]/layout.tsx` `generateMetadata` emits **`robots: { index:false, follow:false }`** when on. Set on the **root layout**, so every child page inherits it (no page's `buildPageMetadata` sets `robots`, so nothing overrides it) → **one site-wide switch**.
  - `src/app/robots.ts` flips to a blanket **`Disallow: /`** (no sitemap/host advertised) when on; unchanged otherwise.
- **`.env.example`** documents the new `PREVIEW_NOINDEX` and **re-classifies `NEXT_PUBLIC_SITE_URL` as REQUIRED on Vercel** (with the validation vs launch values spelled out). No real secrets added.
- Issues #2 and #3 need **no code** — the code already reads those vars correctly; they simply must be **set on Vercel**.

### Decisions made on the fly (with why)
- **Implemented the noindex as code + handed the env-flip to Cowork, rather than trying to deploy myself.** This environment has no Vercel CLI and no env-management tool, and the brief frames the deploy/env/redeploy as Cowork's job ("have Cowork set the flag + redeploy"). So the durable, in-my-control deliverable is the *mechanism*; turning it on is one env var for Cowork.
- **Measured mobile Performance now (didn't wait for the redeploy), and made the honest "defer the fix" call.** The noindex/SITE_URL fixes don't change Performance, so the current deploy already gives the real on-infra number. Mobile = **79**, and crucially **the 1.12 hypothesis is disproved**: a real CDN/HTTP-2 does **not** lift it, because Lighthouse mobile *simulates* Slow-4G + 4× CPU on top of the real network (desktop, with a lighter throttle, is **100**). The gap is a single **content-independent webfont-LCP lab artifact** — LCP render-delay **3.3s** on the Playfair header wordmark (render-blocking none, CLS 0, TBT 260ms). The design-preserving font levers (variable font, `preload:false`, `display:optional`) were **already exhausted in 1.12** with no effect. Per the brief's explicit "honest call" clause — and to respect the locked Style A + the perfect a11y — **I did not apply a design-/a11y-disturbing LCP hack.** Re-validate after real content (2.01/2.03 — a hero portrait may become the LCP element) and, definitively, against **CrUX field data** at launch (2.06), which reflects real users rather than the lab simulation.
- **Recommended `NEXT_PUBLIC_SITE_URL=https://dalibor-web.vercel.app` for the validation deploy** (the stable primary Vercel alias), to be replaced by the real domain at 2.06. A valid absolute same-origin URL is what fixes the `canonical` audit and makes the SEO/JSON-LD structure validate; the exact host doesn't matter for a noindexed validation deploy.
- **Scoped the commit to the 2.05 files only.** The working tree still carries the **uncommitted Phase 2.01 Cowork deliverables** (`content-packet/`, `Dalibor-Intake-Packet.md`, `Dalibor-Website-Decisions.md`, `Part-2-Phase-01-Completion.md`, `Part-2-Phase-02-Cowork-Handover.md`) — a separate workstream pending 2.01 sign-off. I left them untracked and did not sweep them in. `current-state.md` necessarily carries both workstreams since it is one file.

### On-infra Lighthouse (real Vercel CDN, `https://dalibor-web.vercel.app/mk`, `lighthouse@12`, isolated runs)
| | Performance | Accessibility | Best-Practices | SEO |
| --- | --- | --- | --- | --- |
| **Desktop** | **100** (FCP 0.4s · LCP 0.8s · TBT 20ms · CLS 0) | 100 | 100 | 92 ¹ |
| **Mobile** | **79** (FCP 2.0s · LCP 4.0s · TBT 260ms · CLS 0) | 100 | 100 | 92 ¹ |

¹ **SEO 92 on both = one failing audit, `canonical`** ("Document does not have a valid `rel=canonical`"), caused entirely by the localhost canonical → **expected to return to ~100 once `NEXT_PUBLIC_SITE_URL` is set + redeployed** (no code fix needed).

**Part-1 deferred mobile-Performance unknown → RESOLVED:** **79 on real infra**, gap = webfont-LCP lab artifact (see decision above). Desktop is a perfect 100.

### Rich Results / structured data
- JSON-LD is **present, parses cleanly, and carries the correct `@type`s** on the live HTML: **`Person`** (Home + About), **`Book`** (Book page), **`Article` + `BreadcrumbList`** (single review). List pages correctly emit none.
- The only blemish is `url`/`@id` = `localhost` (same `SITE_URL` root cause) — not a structural error, resolves once `SITE_URL` is set.
- **Google's Rich Results Test itself was not run** — it's an external Google tool I can't invoke from here. Recommend the operator runs it on the live URL **after** `SITE_URL` is set (so the `url`/`@id` fields reflect the real origin).

### Files written / updated
- `src/sanity/env.ts` — exports `previewNoindex` (new `PREVIEW_NOINDEX` server-side flag).
- `src/app/[locale]/layout.tsx` — root `generateMetadata` emits site-wide `robots: noindex,nofollow` when the flag is on.
- `src/app/robots.ts` — `Disallow: /` when the flag is on; unchanged otherwise.
- `.env.example` — documents `PREVIEW_NOINDEX`; re-classifies `NEXT_PUBLIC_SITE_URL` as REQUIRED on Vercel.
- `src/_project-state/current-state.md` — 2.05 snapshot + phase status + the (1.12) mobile-Performance carryover marked RESOLVED.
- `src/_project-state/file-map.md` — `env.ts` / `layout.tsx` / `robots.ts` / `.env.example` rows updated.
- `src/_project-state/00_stack-and-config.md` — new "Phase 2.05" section (the env var, the SITE_URL re-classification, the Lighthouse table, the mobile-Performance resolution).
- `src/_project-state/Part-2-Phase-05-Completion.md` — this report.
- *(no app dependency change; `package.json` untouched. Lighthouse was run via `npx`, as in 1.12 — verification tooling, not a dep.)*

### Tests run + results
- **Build succeeding on Vercel:** 4 deployments `READY` (Vercel MCP), Node 24.x. Local `npm run lint` → clean; `npm run build` (`--webpack`) → clean, all routes prerendered (`robots.txt`/`sitemap.xml` static).
- **`noindex` flag — ON path (local dev, `PREVIEW_NOINDEX=true` + `NEXT_PUBLIC_SITE_URL=https://dalibor-web.vercel.app`):** `/mk` → `<meta name="robots" content="noindex, nofollow">` **and** canonical = `https://dalibor-web.vercel.app/mk` (proves `SITE_URL` flows through); deep page `/en/about` → **inherits** the noindex meta (site-wide confirmed); `/robots.txt` → `User-Agent: *` + `Disallow: /` (no sitemap line).
- **`noindex` flag — OFF path:** no robots meta + normal `robots.txt` (allow `/`, disallow `/studio` + `/api`, sitemap + host) — confirmed both by the off-path build and by the current live site (which has no flag).
- **Live-URL probes (`curl`):** all three domains public, `/` → 307 `/mk` (next-intl). `/mk` 200, **no `x-robots-tag`/robots meta** (the blocker). `robots.txt` + `sitemap.xml` + canonical/hreflang/OG + JSON-LD all `localhost` (SITE_URL unset). Contact `<form>` has `method="POST"` but **no `action`** + no `formspree.io` (preview mode).
- **Code review (self, diff-scoped):** correctness (robust truthiness parse; root-layout `robots` inheritance verified on a deep page; `robots.txt` flips with no off-path regression), **no secret** (`.env.example` = placeholders + the public Vercel URL only), **Style A untouched** (no component/CSS/token change), **a11y untouched**. Verdict: APPROVE. *(A code-review subagent dispatch was offered but the operator declined it; the diff is 4 config files, reviewed inline instead.)*

### Blocked / carryover — handed to Cowork / Lazar to finish the DoD
**I cannot set Vercel env vars or trigger a redeploy from this environment** (no Vercel CLI; no env-management tool). To close the remaining DoD items, on the `dalibor-web` Vercel project set these three, then **redeploy**:

| Env var | Value | Why |
| --- | --- | --- |
| `PREVIEW_NOINDEX` | `true` | Turns on the site-wide noindex shipped this phase (resolves the indexability blocker). |
| `NEXT_PUBLIC_SITE_URL` | `https://dalibor-web.vercel.app` | Replaces every `localhost` URL (canonical/hreflang/OG/sitemap/robots/JSON-LD); fixes the `canonical` audit → SEO ~100. |
| `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | `https://formspree.io/f/xqeogowo` | Flips the Contact form to **real-send** mode (currently preview/no-send on the deploy). |

After the redeploy, re-confirm (a quick re-`curl`): `x-robots-tag`/robots meta = noindex + `/robots.txt` Disallow `/`; canonical/sitemap/JSON-LD on the real origin; Contact `<form action>` = the Formspree endpoint. Then (optional, recommended) re-run mobile Lighthouse — SEO should rise to ~100; **mobile Performance will stay ~79** (the lab artifact above) until real content + field data.

**Topology decision for 2.06 (flagged, not actioned):** decide whether `main` should keep auto-deploying to **production** or switch to **preview** with a deliberate promote. With `PREVIEW_NOINDEX=true` the site is index-safe either way (that was the brief's whole intent — "never indexed regardless of Vercel's branch logic"), so this is not urgent — but the real-domain + promote choice belongs to **2.06**.

### What's next
- **2.06 — Production promote + real domain + final field/Lighthouse check** (pick the production domain, set `NEXT_PUBLIC_SITE_URL` to it, **remove `PREVIEW_NOINDEX`** to allow indexing, run Google Rich Results Test + CrUX/field check, set the Formspree domain allow-list + Dalibor's verified recipient email).
- **2.01 sign-off + intake merge** and **2.03 semantic search** / **2.04 Studio deploy** proceed in parallel; real content (2.01/2.03) is the trigger to re-validate mobile LCP.

---
*Reminder: `current-state.md`, `file-map.md`, and `00_stack-and-config.md` all updated this phase. Commit scoped to the 2.05 files; the uncommitted 2.01 Cowork deliverables were deliberately left untracked.*
