# Part-2-Phase-02-Completion.md

> **Location in repo:** `src/_project-state/`
> Filed by Claude Code at the close of Phase 2.02. Lazar pastes this back to Chat to close the phase.

---

**Phase ID + name:** 2.02 — Wire the contact form to the live Formspree endpoint + prove it delivers

**Executing Claude:** Code

**Date completed:** 2026-06-13

---

### What shipped
- **The Contact form is live.** `NEXT_PUBLIC_FORMSPREE_ENDPOINT` is set to the real endpoint (`https://formspree.io/f/xqeogowo`, from the Cowork handover) in `.env.local` (gitignored). With the endpoint present the env-gate resolves to the **real-send** path — the rendered `<form>` carries `action="https://formspree.io/f/xqeogowo" method="POST"` and a valid submit POSTs to Formspree for real. The "preview notice / nothing sent" branch from 1.11 **no longer appears** on a configured site (verified in the rendered HTML).
- **`.env.example` documents the variable** with a placeholder value (`https://formspree.io/f/your-form-id`) + a tightened comment noting it is REQUIRED for delivery and must also be set on Vercel at deploy (2.05). No real value committed.
- **Payload completed.** The AJAX JSON body now carries: `name`, `email` (also the Reply-To — Formspree sets Reply-To from the conventional `email` field, so Dalibor's reply goes straight back to the visitor), `subject`, `message`, **`locale`** (the active `mk`/`en`/`sr` from next-intl `useLocale()` — so Dalibor sees which language the visitor wrote in), `_subject`, and the `_gotcha` honeypot.
- **Sharper subject line.** `contact.form.subjectLine` changed from "New message from {name}" to **"New message from your website — {name}"** in all three languages (mk/en/sr), so the inbox subject identifies the source.
- **The existing JS UX was preserved exactly** — the in-page focused success panel and the polite `aria-live` error handling are unchanged (better UX than a full page reload). The no-JS native POST also now reaches Formspree (real `action`).

### Decisions made on the fly (with why)
- **Kept the env-gate's preview branch as a missing-env safety net (did not delete it).** The brief allowed "remove **or correctly re-gate**." Once the endpoint is set the preview branch is unreachable (it only fires when `ENDPOINT` is falsy), so the DoD "no preview notice when the endpoint is present" is satisfied. Retaining it means a misconfig (or a fresh checkout with no env) degrades to a neutral notice instead of POSTing to nowhere — the surgical, lower-risk choice. JSDoc + the inline comment were updated to describe it as a safety net.
- **Reply-to via the conventional `email` field, not `_replyto`.** Modern Formspree sets the Reply-To header automatically from a field literally named `email`, which the form already sends — so no extra field was added. A comment documents this.
- **Skipped the optional `_next` no-JS thank-you redirect.** There is no dedicated thank-you page to point it at; pointing `_next` back at `/contact` would reload an empty form (no confirmation), which is *worse* than Formspree's own default "Thank you" page. The brief explicitly allows skipping it, and the JS path (the primary path, with the in-page success panel) is unaffected. Recorded as the deliberate choice.
- **Kept the `.env.example` placeholder as `your-form-id` (a code-review nit suggested a louder `REPLACE_ME`).** The brief asked for a *placeholder value* that also shows the URL shape. The "verbatim-copy footgun" the nit flagged is moot here: `src/sanity/env.ts` validates the (empty) Sanity vars and throws on startup, so the app can't run from an unedited `.env.example` copy anyway — by the time it runs, the dev has filled real values and would replace the Formspree placeholder too. The comment already says "Replace the placeholder below."
- **Used scripted submissions for the delivery + honeypot proofs**, exactly as the brief endorses ("Do this with a scripted submission using the form's exact field names"), replicating the form's exact AJAX shape. The rendered React form was *also* exercised in a real browser (success + error + focus paths) against a mocked `fetch`, to verify the UI end-to-end **without** generating extra inbox deliveries.

### Surprises or off-spec changes
- **none** to the plan. (Worth noting for the operator: the working tree still holds the **uncommitted Phase 2.01 Cowork deliverables** — `content-packet/`, `Dalibor-Intake-Packet.md`, `Dalibor-Website-Decisions.md`, `Part-2-Phase-01-Completion.md`, and the 2.01 edits already baked into `current-state.md`. Those are a separate workstream pending 2.01 sign-off, so this 2.02 commit was **scoped to the 2.02 files only** and did not sweep them in. `current-state.md` necessarily carries both since it is one file.)

### Files written / updated
- `.env.local` — set the real `NEXT_PUBLIC_FORMSPREE_ENDPOINT` (gitignored; not committed).
- `.env.example` — `NEXT_PUBLIC_FORMSPREE_ENDPOINT` placeholder value + tightened comment (set in `.env.local` + on Vercel in 2.05).
- `src/components/contact/contact-form.tsx` — `useLocale()` import + call; added `locale` to the AJAX payload; reply-to + locale comments; JSDoc / inline comments updated to the live (2.02) behavior. **No markup / a11y wiring changed.**
- `src/messages/{en,mk,sr}.json` — `contact.form.subjectLine` → "New message from your website — {name}" (localized).
- `src/_project-state/current-state.md` — 2.02 status + go-live carryover.
- `src/_project-state/file-map.md` — `.env.local` / `.env.example` / `contact-form.tsx` rows updated.
- `src/_project-state/Part-2-Phase-02-Completion.md` — this report.

### Tests run + results
- **Real delivery test (scripted, exact AJAX shape):** clearly-marked test payload (`name: "Test — 2.02 wiring"`, reachable email, test subject) → **HTTP 200, body `{"next":"/thanks","ok":true}`** = Formspree accepted it. **Inbox receipt is the human-verified step** — Lazar / Cowork confirms it arrived in the interim inbox `dinovlazar2011@gmail.com`. *(Per the Cowork handover, no end-to-end delivery had been confirmed yet, so this is the first real send.)*
- **Honeypot test (scripted, `_gotcha` filled):** → HTTP 200 `{"ok":true}` as expected (Formspree deliberately fakes success to fool bots) but the message is **silently dropped**. Suppression is confirmed by **non-delivery** (human-verified — the honeypot submission must NOT appear in the inbox alongside the legit one).
- **Env-gate flip (rendered HTML, `npm start` production build):** `<form action="https://formspree.io/f/xqeogowo" method="POST">`, honeypot present, all four field names present, **zero** preview-notice text. Confirms real-send mode.
- **Rendered React form, real browser (success path, mocked fetch):** payload captured = `{name, email, subject, message, locale:"en", _subject:"New message from your website — …", _gotcha:""}` to the live endpoint with the right headers; the success panel renders, **is focused**, and replaces the form. On `/mk` the captured payload carried `locale:"mk"` and the Macedonian `_subject` — confirming `locale` is dynamic.
- **Accessibility (axe-core 4.10.3 on `/en/contact`):** **0 violations**, 28 passes. The 1 color-contrast "incomplete" (needs-review, not a violation) is the known-benign pair of `aria-hidden` decorative glyphs + the textarea whose background axe can't compute due to overlap — same as the 1.11/1.12 baseline.
- **Interactive a11y (real browser):** focus-first-error moves focus to the first invalid field with `aria-invalid`/`aria-describedby` + messages on all three required fields; the polite `aria-live` region announces the error on a failed (mocked-500) send and keeps the form for retry; success-panel focus confirmed above.
- **`npm run lint`** → clean. **`npm run build` (`--webpack`, type-checks)** → clean, 58/58 static pages; Contact prerendered (●) with the endpoint inlined.
- **Code-review subagent (diff-scoped):** all four brief criteria CLEAN (env-gate flip, payload fields, no secret committed, no a11y regression) — no blockers, no should-fix; one non-blocking nit on the `.env.example` placeholder (evaluated and kept, see decisions).
- **No secret committed:** `git ls-files` shows only `.env.example` tracked; `git check-ignore .env.local` confirms the real value is ignored; the placeholder in `.env.example` is fake.

### Blocked / carryover items
- **Inbox receipt = human-confirmed.** Formspree returned 200 `{ok:true}` (accepted), but a machine can't confirm the email *landed*. Lazar / Cowork verifies the legit test arrived in `dinovlazar2011@gmail.com` **and** that the honeypot one did **not**.
- **Go-live finalization (2.05), deferred deliberately:**
  1. **Switch the recipient to Dalibor's real email** in Formspree's "Send submissions to" / Linked Emails — the new address must be added as a Linked Email and click the Formspree verification email before it receives anything.
  2. **Only then publish his email on the site.** The Contact + footer email slots in `site-links.ts` stay **inert** — we do **not** have Dalibor's real email and must not publish the interim test address. *(Lazar did not supply Dalibor's real email this session, so both slots remain unchanged — this is the sole publicly-shown-contact item left for go-live.)*
  3. **Set the Formspree domain allow-list** to the live domain once it exists (currently open so local testing works).
  4. **Set `NEXT_PUBLIC_FORMSPREE_ENDPOINT` on Vercel** (same value) at deploy — the `.env.example` placeholder is the reminder.
- Optional, only if real spam appears: reCAPTCHA and/or the `_next` redirect (both currently off/skipped by design — they cost Performance/Best-Practices/Privacy points and aren't needed yet).

### What's next
- **2.03 — Reviews semantic search** goes live (real Voyage + Supabase keys + content + re-index webhook; run the unrun migration). (2.01 sign-off + intake merge runs in parallel on the Cowork side.)

---
*Reminder: `current-state.md` + `file-map.md` updated; `00_stack-and-config.md` unchanged (no dependency change this phase).*
