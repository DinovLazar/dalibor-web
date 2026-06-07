# Part-1-Phase-11-Completion.md

> **Location in repo:** `src/_project-state/`

---

**Phase ID + name:** 1.11 — Contact + Privacy (Code)

**Executing Claude:** Code

**Date completed:** 2026-06-08

---

### What shipped
- **Real Style A Contact page** at `src/app/[locale]/contact/page.tsx` (mk/en/sr), **replacing** the 1.06 stub. `PageHeader` (title + intro), then two columns ≥ `md` per handover §7.8 — the accessible `ContactForm` on the left, `ContactLinks` on the right; stacks **form-first** on mobile. Minimal per-locale `generateMetadata` (title + `metaDescription`). Statically prerendered (`●`) in all three locales.
- **Accessible, env-gated Contact form** (`src/components/contact/contact-form.tsx`, `'use client'`) — **no `@formspree/react`/new dependency** (Decision §2.1). Fields **Name\*** (`name`), **Email\*** (`email`), **Subject** (optional, `subject`), **Message\*** (`message`, textarea) + a hidden honeypot `_gotcha`. Required-fields legend; visible `*` markers; Subject shows "(optional)".
  - **WCAG 2.2 AA wiring:** programmatic `<label>` per field; client validation (required + email format) sets `aria-invalid` + `aria-describedby` and **moves focus to the first invalid field**; a **visually-rendered polite `aria-live` region** announces submitting / error / preview; the **success panel is focused** (`role="status"`, `tabIndex=-1`) so it is announced when it replaces the form. Honeypot is `display:none` + `tabIndex=-1` + `aria-hidden` (keyboard-unreachable).
  - **States:** idle → submitting (button disabled, "Sending…") → **success** (form replaced by a parchment confirmation panel + "Send another message" that resets to idle/empty) or **error** (notice shown, **user input preserved**) or **preview** (neutral notice when no endpoint).
  - **Env-gated submit** (Decision §2.2): reads `NEXT_PUBLIC_FORMSPREE_ENDPOINT`. Empty in Part 1 → a valid submit short-circuits to the `contact.form.preview` notice and **sends nothing**; when set (2.02) it `fetch`es Formspree (`Accept`/`Content-Type: application/json`, JSON body `name`/`email`/`subject`/`message`/`_subject`/`_gotcha`), treating HTTP 200 or `{ok:true}` as success.
  - **Progressive enhancement** (Decision §2.3): `<form method="POST" action={endpoint}>`; `onSubmit` always `preventDefault()`s and runs the AJAX path when hydrated. (Confirmed in testing: before hydration the native fallback POSTs to `action`; after hydration the JS path takes over — exactly the intended PE behaviour.)
  - Privacy note rendered with `t.rich("form.privacyNote", { link })` → the next-intl `<Link href="/privacy">` (auto-prefixes the locale).
- **`ContactLinks`** (`src/components/contact/contact-links.tsx`, server) — Dalibor's links beside the form, reading **only** from `@/lib/site-links` (no hardcoded URLs) with the localized `links.*Desc` descriptions. Email slot rendered but **inert** (no `mailto:` until 2.02); Instagram/Facebook/Booksa/Interviews are external (`target="_blank" rel="noopener noreferrer"`).
- **Real Style A Privacy page** at `src/app/[locale]/privacy/page.tsx` (mk/en/sr), replacing the 1.06 stub. `<h1>` + §6.16 double rule + lede + **six `<h2>`/`<p>` sections** (`collect`/`handle`/`retention`/`cookies`/`choices`/`changes`) in a `max-w-prose` reading column with Style A typography (Playfair headings, Lora body). Rendered as **semantic HTML, not Portable Text** (Decision §2.7). Minimal `generateMetadata`. Static (`●`).
- **New Style-A form primitives** — `src/components/ui/input.tsx`, `ui/label.tsx`, `ui/textarea.tsx`. Themed to §6.12 (48px / parchment-on-cream / `--color-border-strong` boundary / Lora 17px / caramel focus). **Hand-rolled** (see "Decisions").
- **Data/config:** `site-links.ts` confirmed (Instagram/Facebook/Booksa URLs already matched the brief) and extended with an empty provisional `interviewVis` slot (Kanal VIS "Vis a Vis"); `.env.example` + `.env.local` gained `NEXT_PUBLIC_FORMSPREE_ENDPOINT=` (empty, "filled in 2.02"); the now-unused `common.comingSoon` string removed from all three message files.
- **Trilingual copy** for the full `contact` + `privacy` namespaces merged into `mk/en/sr.json` (keys identical across locales).

### Decisions made on the fly (with why)
- **Form primitives were hand-rolled, not pulled from the shadcn registry.** `input`/`textarea` are native elements (shadcn's versions are just styled `<input>`/`<textarea>` — no primitive library), and shadcn's `label` pulls `@radix-ui/react-label`, which **contradicts this project's Base-UI deviation and Decision §2.1 ("no new top-level dependency")**. Hand-rolling native elements in `src/components/ui/` is exactly the brief's sanctioned fallback ("if a primitive isn't in the Base UI registry, hand-roll a Style-A equivalent"), keeps the dependency/audit surface flat (still 19 moderate transitive findings, unchanged), and gives full control of the Style A classes. They keep the shadcn API shape (`React.ComponentProps<...>` + `cn` merge + `data-slot`), so they're drop-in compatible. **`00_stack-and-config.md` was not changed (no dependency added).**
- **Two-column Contact layout (handover §7.8), not a single vertical stack.** The brief's step-4 ordering ("then `ContactForm`, then `ContactLinks`") reads as a stack, but the master spec §7.8 specifies two columns ≥ md (form left, links right, form-first on mobile). The handover wins where it is explicit; DOM order is form→links so mobile is form-first automatically.
- **Field focus/error styling uses colour + soft ring at a constant 1px border width — no width change on focus/error.** §6.12/the mockup show a "2px" focus/error border, but the binding DoD requirement is **"No layout shift between states."** I matched the **already-shipped §6.9 search box** pattern (1px border → caramel border-colour + 3px soft ring on focus; brick border-colour + subtle ring on `aria-invalid`), which is visually emphatic without reflowing. Consistent with the repo and AA-safe.
- **Error/preview/success icons:** `CircleAlert` (error, also each field error), `Info` (preview), `CircleCheck` (success) — current lucide-react 1.x canonical names (verified exported). The mockup used an `x` for errors; a circle-alert reads better than "close" and isn't colour-only (text + icon).
- **`generateMetadata` narrows the locale** with `hasLocale(routing.locales, locale)` before `getTranslations({ locale, namespace })` — `params.locale` is typed `string`, and `getTranslations` wants the `Locale` union; the guard both satisfies the type and returns `{}` for a bad locale. (Required to make the build type-check.)
- **`interviewVis` added as an empty provisional slot** rather than a fabricated URL. The brief wants Interviews to record both the Bulgarian YouTube (`interview`, real) and the Kanal VIS "Vis a Vis" interview; I don't have a verified URL for the latter (it's in the gitignored dossier), and inventing one would violate "don't present unverified facts as truth." The slot + comment marks it for 2.01; the Contact page's single "Interviews" link uses the existing real `interview`. The footer's `siteLinks.interview` usage is untouched (kept it a string, not an array — no footer change needed).
- **Email slot rendered as static (non-link) text** on the Contact page (icon + name + "Write directly" description). It becomes a `mailto:` once `siteLinks.email` is filled in 2.02. I did not borrow the footer's "Coming soon" marker (cross-namespace) or invent copy.
- **No "effective date" on Privacy.** §7.9 mentions a last-updated meta, but the brief defers a real effective date to launch QA; the §4 copy has no date string, so none is shown. The `changes` section covers future updates.
- **No test framework introduced** (consistent with 1.09/1.10 and "no new dependency"). The form was verified by running it in the browser across every state (see Tests) rather than by adding a runner.

### Surprises or off-spec changes
- **Privacy/legal copy is a plain-language placeholder** (mk + sr) pending Dalibor's review at launch — he's a translator, the right approver. **`sr` is in Latin script** to match the locale's current behaviour (e.g. `sr-Latn` dates); this is the **open script question** — if `sr` later flips to Cyrillic, these strings transliterate in one pass. (Both flagged per the brief.)
- **Verifying the AJAX request was a test-harness fight, not a code issue.** The preview tool's synthetic `fill`/`click` events didn't reliably sync React's controlled-input state or trigger submit, producing several misleading "NOT CALLED"/no-op runs. Driving the form deterministically (native value-setter + `input` dispatch + `form.requestSubmit()`, with a test endpoint baked into a throwaway build and `window.fetch` stubbed) confirmed the request is built **exactly to spec** and the success/error/reset states all work. One early "navigated to /mk" was the pre-hydration native fallback firing — i.e. progressive enhancement working, not a bug.
- No stack change → `00_stack-and-config.md` deliberately **not** updated (the brief said to update it only if a dependency was added; none was).

### Files written / updated
**Created**
- `src/components/contact/contact-form.tsx` — the `'use client'` accessible, env-gated form + all states.
- `src/components/contact/contact-links.tsx` — server; Dalibor's links from `site-links.ts`.
- `src/components/ui/input.tsx`, `src/components/ui/label.tsx`, `src/components/ui/textarea.tsx` — hand-rolled Style-A form primitives.
- `src/_project-state/Part-1-Phase-11-Completion.md` — this report.

**Updated**
- `src/app/[locale]/contact/page.tsx` — real Contact page (was the 1.06 stub).
- `src/app/[locale]/privacy/page.tsx` — real Privacy page (was the 1.06 stub).
- `src/lib/site-links.ts` — added the provisional `interviewVis` slot + clarified comments.
- `src/messages/{en,mk,sr}.json` — full `contact` + `privacy` namespaces; removed `common.comingSoon`.
- `.env.example` — added `NEXT_PUBLIC_FORMSPREE_ENDPOINT=` (empty; "filled in 2.02").
- `.env.local` (gitignored, local-only) — same var, empty, documented.
- `src/_project-state/current-state.md`, `src/_project-state/file-map.md` — state docs.

**No change:** `00_stack-and-config.md` (no dependency added); `.claude/launch.json` (a temporary `dev` config was added for fetch verification and then reverted).

### Tests run + results
- `npm run lint` — clean (no findings).
- `npm run build` — **succeeds.** `/[locale]/contact` and `/[locale]/privacy` are both `●` (SSG), prerendering all 3 locales each; all other routes unchanged.
- **Browser verification (`npm start`, all three locales, against the real rendered/hydrated app):**
  - **Render:** `/{mk,en,sr}/contact` show the real page (no stub text) — title/intro, required-fields legend, the four fields (Subject's accessible name correctly includes "(optional)"), submit, the `t.rich` privacy-policy link, and `ContactLinks` with the inert Email entry; `/{mk,en,sr}/privacy` show `<h1>` + lede + all six `<h2>`/`<p>` sections. `html lang` correct per locale; sr renders Latin.
  - **Validation:** empty submit → three field errors, each with `aria-invalid` + `aria-describedby`, focus on the first invalid (`contact-name`); invalid email ("not-an-email") → "Please enter a valid email address." + focus on `contact-email`; **no navigation** in either case.
  - **Env-gated preview (empty endpoint):** a valid submit shows "This form isn't connected yet…" and **sends nothing** (no `fetch`), no navigation.
  - **AJAX construction + states (throwaway build with a test endpoint, `fetch` stubbed — nothing actually sent):** request = `POST https://formspree.io/f/…`, headers `Accept`/`Content-Type: application/json`, body `{name,email,subject,message,_subject:"New message from Ana Test",_gotcha:""}` — **exactly per spec**; 200/`{ok:true}` → success panel (focused, `role="status"`) + "Send another" resets to a clean idle form; a 500/`{ok:false}` → error notice with **input preserved**.
  - **A11y:** honeypot `display:none`/`tabindex=-1`/`aria-hidden`; tab order name→email→subject→message→submit→privacy link (honeypot skipped); `focus-visible` classes present (same proven §6.9 pattern); language switcher targets `/{en,sr}/contact` equivalents. Ran the `design:accessibility-review` pass on the form — **0 critical / 0 major / 0 minor** (2 optional, deferred: link the required-legend via `aria-describedby`; give the `<form>` an `aria-label`).
  - **Console:** no errors or warnings on any page.

### Blocked / carryover items
- **2.02 (Contact goes live):** the real Formspree endpoint (`NEXT_PUBLIC_FORMSPREE_ENDPOINT`), the real contact email (Contact + footer email slots inert now), optional reCAPTCHA, optional native `_next` thank-you redirect. The form is fully built/validated/AJAX-verified — only the endpoint is missing.
- **2.01:** confirm/finalize `site-links.ts` URLs, incl. lifting the Kanal VIS "Vis a Vis" URL into `interviewVis`.
- **Launch QA:** native/legal review of the mk/sr privacy wording + a real effective date; the **sr Cyrillic-vs-Latin** decision.
- **1.12:** hreflang / canonical / JSON-LD schema / `sitemap.xml` / `robots.txt` / the full Lighthouse + a11y pass. The per-page `generateMetadata` here is intentionally minimal.

### What's next
- **1.12 — SEO / accessibility / Lighthouse pass** — the final phase of Part 1 (every Part-1 page now exists).

---
*Reminder: `current-state.md` updated; `file-map.md` updated; `00_stack-and-config.md` not updated (no stack change).*
