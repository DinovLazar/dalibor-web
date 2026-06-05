# Dalibor Plečić — personal website

The personal website of **Dalibor Plečić** — Macedonian writer, literary critic, translator, and journalist. It brings his scattered work into one home: his **book reviews**, his **blog**, his own **book**, and an **About** page that tells his story.

The site is **trilingual** — Macedonian (default), English, and Serbian — with a warm, literary, "well-made hardcover book" feel.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS**
- _Added in later phases:_ shadcn/ui · Lucide · Framer Motion · next-intl (i18n) · Sanity (CMS) · Formspree (contact form) · Vercel AI SDK + Voyage + Supabase/pgvector (review topic search)
- Hosted on **Vercel**

## Run it locally

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

Other scripts: `npm run build` (production build) · `npm run lint` (ESLint) · `npm start` (serve the production build).

## Project docs

Live project documentation lives in [`src/_project-state/`](src/_project-state/):

- **`current-state.md`** — what actually exists right now (updated at the end of every phase).
- **`file-map.md`** — a one-line description of every file and folder.
- **`00_stack-and-config.md`** — append-only log of stack/config decisions and pinned versions.
- **`Part-*-Phase-*-Completion.md`** — per-phase completion reports.

This is a personal, non-commercial site, built phase by phase. See the project-state docs for the current status and the next phase.
