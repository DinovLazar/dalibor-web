# Part-1-Phase-02-Completion.md

> **Location in repo:** `src/_project-state/`
> Filled completion report for Phase 1.02. Lazar pastes this back to Chat to close the phase.

---

**Phase ID + name:** 1.02 — Project scaffolding

**Executing Claude:** Code (Claude Code)

**Date completed:** 2026-06-05

---

### What shipped
- Verified the environment: Node.js **v24.14.0**, npm **11.9.0**, git 2.53.0 — all well above Next.js's 18.18 minimum / 20 LTS recommendation. Proceeded.
- Base **Next.js 16.2.7 (App Router) + React 19.2.4 + TypeScript 5.9.3 + Tailwind CSS 4.3.0 + ESLint 9** scaffold via `create-next-app@latest`, using a `src/` directory, the `@/*` import alias, and npm.
- `next` / `react` / `react-dom` pinned to **exact** versions in `package.json` (modern create-next-app already writes them exact — confirmed, no leading `^`). All installed versions recorded in `00_stack-and-config.md`.
- Reserved folders: `docs/design-handovers/` and `src/_project-state/`.
- Structural folders: `src/components/`, `src/lib/`, `src/messages/`, `src/styles/`, `sanity/` — empty ones tracked with `.gitkeep`. Generated `src/app/` left exactly as produced.
- Project-state docs seeded/finalized in `src/_project-state/`: `current-state.md`, `file-map.md`, `00_stack-and-config.md` (all filled with real data), the verbatim `Part-X-Phase-YY-Completion.md` template, and this report.
- `.env.local` created (empty + comment header) and confirmed gitignored. Short project `README.md` written.
- **dev / build / lint all pass** locally (details below).
- First commit made and **pushed to a new public repo `DinovLazar/dalibor-web`**.

### Decisions made on the fly (with why)
- **Scaffolded via a temp folder, then moved files in.** `create-next-app .` derives the npm package name from the folder name, and `DaliborWeb` has capital letters (invalid npm name) → an in-place scaffold is rejected. The folder also already held planning docs (non-empty). So I scaffolded into a temp sibling `dalibor-web` (valid name; `--skip-install --disable-git`), moved the generated files into `DaliborWeb` (no filename collisions with the existing docs), then ran `npm install` + `git init` in place. Temp folder removed. Nothing pre-existing was deleted or overwritten.
- **Research dossier kept local / gitignored — NOT published.** The pre-existing `compass_artifact_…md` is the Phase 1.01 research dossier; it aggregates third-party personal data (birth-year speculation flagged "verify with the subject", a school email, social profiles) and the seed `current-state.md` frames it as "held by Lazar." Publishing it to a **public** repo is an outward-facing, hard-to-reverse step I shouldn't take by default, so I added it to `.gitignore`. It stays on disk. **If you want it committed, delete that one line from `.gitignore`.**
- **Committed the planning docs (`Dalibor-Website-Plan/Phase-Plan/Decisions.md`) at the repo root.** They're useful project context for later phases and aren't privacy-sensitive; the brief said "stage everything." Kept them at root (= "restore" them where they were).
- **`git init -b main`** to name the default branch `main` directly. Git identity was already configured globally (`DinovLazar`), and `gh` was authenticated with `repo` scope, so commit + repo-creation + push all worked.
- **Completion report filed as a small follow-up commit.** The scaffold + live docs were the phase's single commit (`de81e2d`); this report is written afterward (it records that commit's push result), so it's committed separately so the published repo actually contains what `file-map.md` lists. Flagging in case you prefer a strict one-commit-per-phase history.

### Surprises or off-spec changes
- **Build required `--webpack` (local environment constraint).** Next.js 16 defaults to **Turbopack** for `dev`/`build`, which needs the **native** SWC binding (`@next/swc-win32-x64-msvc`). On this machine that `.node` binary is **blocked by a Windows Application Control policy**, so Next falls back to WASM — and Turbopack can't run on WASM (`next build` errored: *"Turbopack is not supported on this platform … use Webpack instead"*). Fix: `dev`/`build` scripts now use `next dev --webpack` / `next build --webpack`; both succeed. Local-only — Vercel/Linux loads the native binding fine and could keep Turbopack. Documented in `00_stack-and-config.md`.
- **Tailwind v4 is CSS-first — there is no `tailwind.config.*` file.** Config lives in `src/app/globals.css` (`@import "tailwindcss"`) + `postcss.config.mjs` (`@tailwindcss/postcss`). The Plan §7 tree implies a config file; none exists in v4. Noted, not a problem.
- **create-next-app generated `AGENTS.md` + `CLAUDE.md`** (agent guidance noting Next 16 has breaking changes). Not in the Plan tree but harmless/useful — kept as-is.
- **2 moderate `npm audit` findings** — both the same transitive `postcss <8.5.10` bundled **inside** `next@16.2.7`. npm's only offered fix downgrades Next to v9 (rejected). Left as-is; build-time tooling, low practical risk.
- **Folder-tree divergence from the Plan:** essentially none. `src/styles/` exists (it IS in Plan §7) with a `.gitkeep`. The only things beyond the Plan tree are `AGENTS.md`/`CLAUDE.md` (CLI defaults) and the planning/research docs at root.

### Files written / updated
- `package.json` — manifest; `dev`/`build` scripts set to `--webpack` (see above).
- `src/app/{layout.tsx,page.tsx,globals.css,favicon.ico}`, `public/*.svg`, `next.config.ts`, `tsconfig.json` (defines `@/*` alias), `eslint.config.mjs`, `postcss.config.mjs`, `next-env.d.ts` — create-next-app scaffold, left as generated (except package.json scripts).
- `.gitignore` — CLI default + one rule ignoring the local research dossier.
- `.env.local` — empty placeholder with header (gitignored, never committed).
- `README.md` — rewritten: what the site is, the stack, local-run steps.
- `src/_project-state/00_stack-and-config.md` — pinned versions filled + a dated 1.02 entry (environment, exact versions, Webpack decision, audit note).
- `src/_project-state/current-state.md` — full end-of-1.02 snapshot.
- `src/_project-state/file-map.md` — full file/folder map.
- `src/_project-state/Part-X-Phase-YY-Completion.md` — verbatim template (relocated into `_project-state/`).
- `src/_project-state/Part-1-Phase-02-Completion.md` — this report.
- Folders + `.gitkeep`s: `docs/design-handovers/`, `src/{components,lib,messages,styles}/`, `sanity/`.
- (All reflected in `file-map.md`.)

### Tests run + results
- **`npm run dev`** → **Ready in 580ms**; `GET /` returned **HTTP 200** (the default page, ~13 KB) at http://localhost:3000. Server stopped; port 3000 freed. ✅
- **`npm run build`** → ✅ **Compiled successfully** (Webpack); TypeScript check passed; 4/4 static pages generated; routes `/` and `/_not-found` prerendered. (Default Turbopack attempt failed first → switched to `--webpack`.)
- **`npm run lint`** → ✅ passed, no warnings/errors.
- **GitHub** → ✅ created public repo **https://github.com/DinovLazar/dalibor-web**; first commit `de81e2d` pushed; `main` tracks `origin/main`; working tree clean. Verified the dossier and `.env.local` are **not** on the remote.

### Blocked / carryover items
- **`--webpack` build flag** — a local workaround for the blocked native SWC binding. Carryover: on Vercel/Linux (Part 2 · 2.05) the native binding works, so `--webpack` can optionally be dropped there. Low priority — Webpack builds are correct (just slower).
- **2 moderate npm audit findings** (transitive postcss inside Next) — carry until an upstream Next release bumps its bundled postcss.
- Default scaffold home page + the `prefers-color-scheme: dark` block in `globals.css` are placeholders, to be replaced in the design/layout phases (Decision #14: no dark mode in v1).
- Nothing blocking the next phase.

### What's next
- **Phase 1.03 — Design system & visual direction** (Design phase): turn the locked **Style A — Hardcover** direction into a full design handover — palette tokens, Playfair Display + Lora type scale, components, and layouts for every page type. Output lands in `docs/design-handovers/`.

---
*`current-state.md`, `00_stack-and-config.md`, and `file-map.md` were all updated to their final state before closing this phase.*
