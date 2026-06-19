# Part-2-Phase-04-Completion.md

> **Location in repo:** `src/_project-state/`

---

**Phase ID + name:** 2.04 — Deploy Sanity Studio + publishing handover (Code)

**Executing Claude:** Code

**Date completed:** 2026-06-19

---

### What shipped
- **Sanity Studio is live at a stable hosted URL: https://daliborplecic.sanity.studio/** — a permanent login Dalibor can use that does **not** depend on the main site or its Vercel preview. Deployed via `npx sanity deploy` (build + upload, exit 0; "Success! Studio deployed to https://daliborplecic.sanity.studio/").
- **Confirmed the deployed Studio targets the right backend:** `sanity schema list` → workspace `default`, **dataset `production`, projectId `ndqmaath`** (schema deployed 1/1). Active CLI account: `dinovlazar2011@gmail.com`; `sanity projects list` shows `ndqmaath` "Dalibor Plečić Website".
- **CORS:** added `https://daliborplecic.sanity.studio` to the project's allowed origins **with credentials**. `http://localhost:3000` and `http://localhost:3333` were already present (kept). Final list: `localhost:3333`, `localhost:3000`, `https://daliborplecic.sanity.studio`.
- **`docs/dalibor-publishing-guide.md`** — a plain-English, screenshot-ready how-to for a non-technical author: open + log in, the three-language model (mk required; en/sr optional; graceful fallback so single-language pieces never break a page), create a blog post, create a review (incl. **cover image + alt text + book metadata**), draft vs. publish (incl. the note that imported content may arrive as drafts awaiting his review), and the one-line note that editing/publishing a review auto-refreshes its topic-search index. Carries a top-of-file placeholder noting a Macedonian version will be written later (not machine-translated).
- **`sanity.cli.ts`** now pins `deployment.appId` (`mesr4xa2evz7kwohj4488y94`) so future `sanity deploy` runs are non-interactive.

### Decisions made on the fly (with why)
- **Studio hostname = `daliborplecic`** (the brief's first suggestion) — it was available, so no fallback to `dalibor-web`/suffix was needed.
- **"Embedded" but deployed as a hosted standalone Studio — without scaffolding a new config.** Detection (step 2): the Studio is **embedded** (a Next.js route at `src/app/studio/[[...tool]]`, second root layout) **and** the repo already has root `sanity.config.ts` + `sanity.cli.ts`. The brief's embedded path says to stand up a standalone hosted Studio (initialising a minimal config "if one doesn't exist"). One already exists at the root, so `npx sanity deploy` deploys it directly — no extra/minimal config file was created. This gives Dalibor exactly the brief's intended outcome: a stable `*.sanity.studio` login independent of the (not-yet-live) public site.
- **No config change needed for the `basePath` mismatch** (verified, not assumed). `sanity.config.ts` sets `basePath: "/studio"` (correct for the *embedded* route). I confirmed in the installed CLI source that the **hosted** build's basePath comes from `determineBasePath()`, which reads only `SANITY_STUDIO_BASEPATH` or `sanity.cli.ts`'s `project.basePath` (both unset) → defaults to `/`; and the auto-generated entry passes `renderStudio(..., {basePath: "/"})` as an explicit override. So the hosted Studio serves correctly at the subdomain **root** (the embedded `/studio` basePath does not leak in). Verified live: `https://daliborplecic.sanity.studio/` → 302 into the Sanity dashboard auth session → 200 (no basePath 404).
- **Tooling: Sanity CLI (no MCP).** No Sanity MCP server was available in this environment, so all project/deploy/CORS operations used `npx sanity …` (the brief's CLI fallback).
- **Pinned `deployment.appId` in `sanity.cli.ts`** — the CLI explicitly recommended it after the first deploy; keeps the stable hostname/app the single source of truth and avoids re-prompting.

### Surprises or off-spec changes
- **New-Mac env-file mix-up — found and fixed (security-relevant).** The repo had stray untracked files `env.local` and `gitignore` (no leading dots) alongside `.env.local` and `.gitignore`. The leading dots had been stripped during the Mac transfer: the **real** filled values (incl. live secrets — Voyage key, Supabase service-role key, Sanity webhook secret) sat in the **non-ignored** `env.local`, while the dotfile `.env.local` held the *empty* example template (byte-identical to `.env.example`). `.gitignore`'s `.env*` rule does **not** match `env.local`, so those secrets were committable. **Fix:** copied the real values back into `.env.local` (now git-ignored via `.env*`), deleted the two no-dot strays. Verified `.env.local` now carries `NEXT_PUBLIC_SANITY_PROJECT_ID=ndqmaath` and is ignored; `git status` clean. No secret is in any tracked file. (`.env.example` still holds the commented template — nothing lost.)
- **Login could not use the interactive provider menu** (non-TTY shell). Ran `sanity login --provider github --no-open`, surfaced the auth URL for Lazar to open; login completed in-browser ("Login successful").
- **Verification of in-Studio editing is necessarily partial here.** The hosted Studio is login-gated and content editing can't be exercised headlessly. Verified instead, end-to-end and programmatically: URL live, schema deployed to `production`/`ndqmaath`, and a `production` data query proving **all five content types exist with their per-language fields** — review title `{mk,en,sr}` all present, author name across all three scripts, book metadata (author/publisher/year) present. The remaining logged-in click-through is the lightweight human step (Dalibor/Lazar do it on first login anyway). See carryover.

### Files written / updated
- `docs/dalibor-publishing-guide.md` — **new**; the non-technical publishing how-to (EN draft + MK-version placeholder note).
- `sanity.cli.ts` — added `deployment.appId` for non-interactive future deploys.
- `.env.local` — **restored** real local values (recovery; git-ignored, not committed).
- `env.local`, `gitignore` — **deleted** (no-dot strays that leaked secrets / duplicated `.gitignore`).
- `src/_project-state/Part-2-Phase-04-Completion.md` — this report.
- `src/_project-state/current-state.md` — updated to mark 2.04 done with the live Studio URL.

### Tests run + results
- `sanity login --provider github` → **Login successful** (`dinovlazar2011@gmail.com`).
- `sanity projects list` → `ndqmaath` present and active.
- `sanity deploy --url daliborplecic -y` → hostname created, build OK (~13s), **Success! Studio deployed to https://daliborplecic.sanity.studio/** (exit 0).
- `sanity schema list` → `default` / **production** / **ndqmaath** (deployed 1/1 schemas).
- `sanity cors add https://daliborplecic.sanity.studio --credentials` → "CORS origin added successfully"; `sanity cors list` confirms it.
- `curl https://daliborplecic.sanity.studio/` → 302 → Sanity dashboard auth → **200** (Studio shell, title "Sanity"; appId `mesr4xa2evz7kwohj4488y94` matches). Root resolves into the Studio — confirms `/` basePath, no 404.
- `sanity documents query` on `production` → type counts `{author:1, book:1, post:4, review:4, topic:4}`; localized fields confirmed present in `mk`/`en`/`sr`.

### Blocked / carryover items
- **Human follow-up — invite Dalibor as an editor** (Members settings on the `ndqmaath` project, using his confirmed email). This is a permissions/dashboard action explicitly **out of scope for code** — handled by Lazar (Cowork-guided if needed). Not done here.
- **Logged-in in-Studio visual confirmation** — confirm in a browser, signed in, that every content type renders and the mk/en/sr inputs are editable (review cover + book metadata included). Programmatic proof is in place (schema + data); this is the final eyes-on check, naturally done on first editor login. (Supersedes/continues the long-standing "Studio content visual check" carryover.)
- **Content is still the placeholder seed** (4 reviews / 4 posts, no review covers — intentional). Real content + covers arrive with the 2.01 import/sign-off; the Studio is where Dalibor will review the imported drafts.
- **MK publishing guide** — placeholder note left at the top of `docs/dalibor-publishing-guide.md`; to be authored for Dalibor (not machine-translated).

### What's next
- **2.01 sign-off + intake merge** (real content into the now-live Studio), and **2.06** (production promote + real domain + final field/Lighthouse check). The 2.03 search keys + Sanity webhook are set on Vercel at/after deploy. Inviting Dalibor as editor (above) unblocks his hands-on use.

---
*Reminder: `current-state.md` updated. `00_stack-and-config.md` unchanged (no stack version change — the only code change is the `sanity.cli.ts` `deployment.appId` pin, recorded here).*
