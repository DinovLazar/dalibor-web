<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# dalibor-web

Trilingual personal site for writer/critic/translator **Dalibor Plečić** — Macedonian (default) / English / Serbian. Built phase-by-phase by orchestrated Claude sessions: **Part 1 (local build) complete, Part 2 (integrations + go-live) in progress.** Repo `github.com/DinovLazar/dalibor-web` is **PUBLIC** — see Security.

## Stack

- **Next.js 16.2.7** (App Router, pinned exact) + React 19.2.4 + TypeScript 5. Middleware lives in **`src/proxy.ts`** (Next 16 rename — there is no `middleware.ts`).
- **next-intl**: locales `mk`/`en`/`sr`, `localePrefix: always`, `localeDetection: false`. Messages in `src/messages/`.
- **Tailwind CSS v4, CSS-first**: there is **no `tailwind.config.*`** — tokens live in `src/app/globals.css` `@theme`.
- **shadcn/ui on Base UI** (`base-nova` style, `@base-ui/react`) — deliberately **not Radix**. Brand icons are hand-recreated in `src/components/brand-icons.tsx` (lucide 1.x dropped them).
- **Sanity 5**: embedded Studio at `/studio` (second root layout), hosted Studio at `https://daliborplecic.sanity.studio`. Project `ndqmaath`, dataset `production`. Schemas in `src/sanity/schemaTypes/`.
- **Semantic review search**: Voyage `voyage-3.5` @ 1024 dims + Supabase pgvector (`supabase/migrations/`), routes `src/app/api/reviews/{search,reindex}`. Falls back to keyword search when keys are absent or Voyage errors — **by design; the search box must never die**.
- **npm** only (`package-lock.json`). **Node**: no `engines` field, no `.nvmrc` — nothing enforces a version. Scaffolded on 24.14.0; **Vercel runs 24.x (the target)**; this Mac has **26.3.0** (Homebrew) — a live, unenforced mismatch.

## Commands

- `npm run dev` / `npm run build` — both pinned to **`--webpack`** (Turbopack needed a native SWC binding blocked on the original Windows machine; kept so local and prod behave identically). **Do not remove the flag.**
- `npm run lint` · `npm run typegen` — run typegen after **any** schema change (regenerates `schema.json` + `src/sanity/sanity.types.ts`, both generated — never hand-edit; `sanity.types.ts` is eslint-ignored).
- `rm -rf .next` before verification builds — drops stale generated route types. (Docs say `Remove-Item -Recurse -Force .next`; that's PowerShell — use `rm -rf` here.)
- `npm run import:content` / `npm run import:assets` — idempotent Sanity importers, support `--dry-run`. `npm run embed:reviews` — idempotent embeddings backfill. `npm run test:semantic` — ranking smoke test needing live Voyage/Supabase keys. **There is no conventional unit-test suite.**
- The import/embed/test scripts run as `node --conditions=react-server --import tsx --env-file=.env.local scripts/<name>.mts` — `--conditions=react-server` lets plain Node import the `server-only`-guarded modules. (`make:favicon` is the exception: plain `node --import tsx`, no env file.)
- Hosted Studio deploy: `npx sanity deploy` (non-interactive; `deployment.appId` pinned in `sanity.cli.ts`).
- Seed re-import: `npx sanity dataset import sanity/seed/seed.ndjson --dataset production --replace`.
- Sanity CLI may not auto-load `.env.local` — inject the three `NEXT_PUBLIC_SANITY_*` vars inline for schema extract / typegen / dataset import.

## Workflow — strict phase system

- **One phase = one completion report = one git commit** per executing Claude session (`Dalibor-Website-Phase-Plan.md`). Work on a `phase/<n>-<slug>` branch; **merge to `main` only on Lazar's explicit go** — push to main deploys production (see Deploy).
- End of every phase, no exceptions:
  1. File `src/_project-state/Part-X-Phase-YY-Completion.md` (template in that dir).
  2. Update `src/_project-state/current-state.md` and `file-map.md`.
  3. **Append** (never edit) a dated entry to `src/_project-state/00_stack-and-config.md` on any stack/config change; append decisions to `Dalibor-Website-Decisions.md` (reversals reference the original number).
- **Precedence: live code > `current-state.md` > `Dalibor-Website-Plan.md`** (the Plan is aspirational).
- Quality bar (Decisions #20): **Lighthouse 95+ and WCAG 2.2 AA**. Completed phases ran lint + typegen + clean build + axe + a code-review subagent pass.

## Deploy

- **Every push to `main` deploys to Vercel's PRODUCTION target on real domains** — `dalibor-web.vercel.app` plus `daddybor.optimind000.com` and `daliborac.vertexconsulting.mk`. It is NOT an isolated preview. Project `dalibor-web`, team `dinovlazars-projects`, Node 24.x.
- The current live URL is a **noindexed validation deploy**, not launch: the server-side `PREVIEW_NOINDEX` flag forces site-wide noindex meta + `robots.txt Disallow: /`. Real promote + final domain is Phase 2.06 — remove the flag only then.
- `NEXT_PUBLIC_SITE_URL` is **REQUIRED on Vercel** — unset, localhost leaks into canonical/hreflang/OG/sitemap/JSON-LD and caps Lighthouse SEO at 92.
- `NEXT_PUBLIC_FORMSPREE_ENDPOINT` + the four search vars (`VOYAGE_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SANITY_WEBHOOK_SECRET`) were pending Cowork setup — until set, production runs preview-mode contact + keyword search **by design**.
- Studio deploys separately via `npx sanity deploy`. Supabase project ref `wjqgkauzjrgnamacldgx`; the service-role key **cannot run DDL** — migrations go through the Supabase SQL editor.

## Security — the repo is PUBLIC

- Secrets live **only** in gitignored `.env.local`; `.env.example` is the committed secrets-free template. Never put a secret or the write token in any tracked file.
- The Sanity write token env name is **`SANITY_WRITE_TOKEN`** (not `SANITY_API_WRITE_TOKEN`; it exists only in `.env.local`). `SUPABASE_SERVICE_ROLE_KEY` must never become `NEXT_PUBLIC_*`.
- Watch for **dot-stripped stray files**: `.gitignore` matches `.env*`, so a no-dot `env.local` is NOT ignored — one once held real secrets (Phase 2.04 near-miss).
- The Phase 1.01 research dossier is gitignored on purpose — never commit or quote it into tracked files.

## Gotchas

- **State docs assume Windows; work happens on this Mac.** Ignore `C:\...` paths and PowerShell commands in `00_stack-and-config.md` / Decisions #19.
- **Never run `npm audit fix --force`** — it downgrades `next` and breaks the app. The standing moderate findings are known transitive noise.
- Next 16: a page's `generateMetadata` `openGraph` **replaces** ancestor openGraph — use the `buildPageMetadata` helper (`src/lib/seo/`), don't hand-roll metadata.
- Voyage account is free-tier limited (3 RPM / 10K TPM until a payment method is added) — the full reviews embeddings backfill blocks; keyword fallback in production is expected until then.
- `shadcn` init destructively overwrites `globals.css` (the locked Style A tokens were restored by hand once) — rerun with extreme care.
- After deleting `app/` route files, clear `.next` or stale generated types fail the type check.

## Canonical docs

| Doc | Role |
|---|---|
| `src/_project-state/current-state.md` | Live repo snapshot — **authoritative**; updated at the end of every phase |
| `src/_project-state/file-map.md` | One-line map of every file |
| `src/_project-state/00_stack-and-config.md` | Append-only stack/config log (pinned versions + rationale) |
| `Dalibor-Website-Phase-Plan.md` | Phase index, status key, critical path |
| `Dalibor-Website-Decisions.md` | Append-only numbered decision log |
| `Dalibor-Website-Plan.md` | Master spec — aspirational; live code wins |
| `docs/design-handovers/` + mockups | Locked **Style A** design system |
| `docs/dalibor-publishing-guide.md` | Non-technical Studio guide for Dalibor |
| `content-packet/README.md` | Import packet + topic-taxonomy reconciliation note |
