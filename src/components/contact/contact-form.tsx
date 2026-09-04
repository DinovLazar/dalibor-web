"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CircleAlert, CircleCheck, Info } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ContactForm (§6.12, §7.8) — the site's single conversion point. A custom,
 * fully-accessible form built without `@formspree/react` (Decision §2.1): full
 * control over the Style A markup and the WCAG 2.2 AA wiring, and zero new
 * dependencies. Live since Phase 2.02 — sends to Formspree for real.
 *
 * Progressive enhancement (Decision §2.3): the <form> carries `method="POST"` and
 * `action={endpoint}`, so a no-JS submit still reaches Formspree. With JS on,
 * `onSubmit` always calls `preventDefault()`, validates, and runs the AJAX path
 * (the in-page focused success panel + polite error region, better than a reload).
 *
 * Env-gated submit (Decision §2.2): the endpoint is read from the public
 * `NEXT_PUBLIC_FORMSPREE_ENDPOINT` (Formspree endpoints live in a form's `action`,
 * so `NEXT_PUBLIC_` is correct). It is set in 2.02, so the live form submits for
 * real. The gate is retained as a safety net: if the variable is ever absent
 * (misconfig / a fresh checkout), a valid submit short-circuits to a neutral
 * preview notice and sends nothing rather than POSTing to nowhere.
 *
 * Accessibility: every field has a programmatic <label>; required fields are marked
 * with `*` and explained by the legend; invalid fields set `aria-invalid` +
 * `aria-describedby` and focus moves to the first invalid field on a failed submit;
 * a polite, visually-rendered `aria-live` region announces submitting / error /
 * preview, and the success panel is focused so it is announced too. Spam protection
 * is a honeypot only (`_gotcha`) — reCAPTCHA is deferred to 2.02 if ever needed.
 */

// Live endpoint (see .env.example / .env.local). Read once at module scope:
// NEXT_PUBLIC_ vars are inlined at build time. Falls back to "" → preview mode
// only if the variable is ever absent.
const ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ?? "";

// Pragmatic format check (non-empty local part, "@", non-empty domain with a dot).
// The real authority is Formspree's server-side validation; this just catches typos.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "submitting" | "success" | "error" | "preview";
type FieldName = "name" | "email" | "message";
type Fields = { name: string; email: string; subject: string; message: string };

const EMPTY: Fields = { name: "", email: "", subject: "", message: "" };

export function ContactForm({ className }: { className?: string }) {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const successRef = useRef<HTMLDivElement>(null);

  // Move screen-reader focus to the confirmation when the form is replaced.
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  function validate(v: Fields): Partial<Record<FieldName, string>> {
    const e: Partial<Record<FieldName, string>> = {};
    if (!v.name.trim()) e.name = t("form.errors.nameRequired");
    if (!v.email.trim()) e.email = t("form.errors.emailRequired");
    else if (!EMAIL_RE.test(v.email.trim()))
      e.email = t("form.errors.emailInvalid");
    if (!v.message.trim()) e.message = t("form.errors.messageRequired");
    return e;
  }

  function update<K extends keyof Fields>(field: K, value: string) {
    setFields((f) => ({ ...f, [field]: value }));
    // Clear that field's error as the reader corrects it.
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field as FieldName];
      return next;
    });
    // Drop a stale error/preview notice once the reader starts editing again.
    setStatus((s) => (s === "error" || s === "preview" ? "idle" : s));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors = validate(fields);
    setErrors(nextErrors);
    const firstInvalid: FieldName | undefined = (
      ["name", "email", "message"] as const
    ).find((k) => nextErrors[k]);
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    // Safety net: if the endpoint is ever absent (misconfig) → neutral preview
    // notice, nothing sent. With the endpoint set (2.02) this never triggers.
    if (!ENDPOINT) {
      setStatus("preview");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fields.name,
          // Formspree sets the email Reply-To from a field literally named `email`,
          // so Dalibor's reply goes straight back to the visitor.
          email: fields.email,
          subject: fields.subject,
          message: fields.message,
          // Active UI language (mk/en/sr) so Dalibor sees which language to reply in.
          locale,
          _subject: t("form.subjectLine", { name: fields.name }),
          _gotcha: "",
        }),
      });
      const data: { ok?: boolean } | null = await res
        .json()
        .catch(() => null);
      if (res.status === 200 || data?.ok === true) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setFields(EMPTY);
    setErrors({});
    setStatus("idle");
  }

  // Confirmation panel replaces the form (§6.12 success). Focused for SR users.
  if (status === "success") {
    return (
      <div className={className}>
        <div
          ref={successRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 card-flat p-6 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <CircleCheck
            className="mt-0.5 size-6 shrink-0 text-primary-strong"
            strokeWidth={1.75}
            aria-hidden
          />
          <div>
            <p className="text-body text-text">{t("form.success")}</p>
            <button
              type="button"
              onClick={reset}
              className={cn(buttonVariants({ variant: "outline" }), "mt-4 max-sm:h-12 max-sm:w-full")}
            >
              {t("form.sendAnother")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <div className={className}>
      <form
        method="POST"
        action={ENDPOINT || undefined}
        onSubmit={onSubmit}
        noValidate
        className="space-y-6"
      >
        <p className="text-meta text-text-muted">{t("form.requiredHint")}</p>

        <div className="space-y-5">
          {/* Name * */}
          <div className="grid gap-1.5">
            <Label htmlFor="contact-name">
              {t("form.name")}{" "}
              <span aria-hidden className="text-primary-strong">
                *
              </span>
            </Label>
            <Input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={fields.name}
              onChange={(e) => update("name", e.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
            />
            {errors.name ? (
              <FieldError id="contact-name-error">{errors.name}</FieldError>
            ) : null}
          </div>

          {/* Email * */}
          <div className="grid gap-1.5">
            <Label htmlFor="contact-email">
              {t("form.email")}{" "}
              <span aria-hidden className="text-primary-strong">
                *
              </span>
            </Label>
            <Input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={fields.email}
              onChange={(e) => update("email", e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
            />
            {errors.email ? (
              <FieldError id="contact-email-error">{errors.email}</FieldError>
            ) : null}
          </div>

          {/* Subject (optional) */}
          <div className="grid gap-1.5">
            <Label htmlFor="contact-subject">
              {t("form.subject")}{" "}
              <span className="font-normal text-text-muted">
                {t("form.optional")}
              </span>
            </Label>
            <Input
              id="contact-subject"
              name="subject"
              type="text"
              value={fields.subject}
              onChange={(e) => update("subject", e.target.value)}
            />
          </div>

          {/* Message * */}
          <div className="grid gap-1.5">
            <Label htmlFor="contact-message">
              {t("form.message")}{" "}
              <span aria-hidden className="text-primary-strong">
                *
              </span>
            </Label>
            <Textarea
              id="contact-message"
              name="message"
              required
              value={fields.message}
              onChange={(e) => update("message", e.target.value)}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={
                errors.message ? "contact-message-error" : undefined
              }
            />
            {errors.message ? (
              <FieldError id="contact-message-error">
                {errors.message}
              </FieldError>
            ) : null}
          </div>

          {/* Honeypot — off-screen, keyboard-unreachable, hidden from AT. Formspree
              drops submissions where it is filled. */}
          <input
            type="text"
            name="_gotcha"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ display: "none" }}
          />
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={submitting}
            className={cn(buttonVariants(), "w-full max-sm:h-12 sm:w-auto")}
          >
            {submitting ? t("form.sending") : t("form.send")}
          </button>

          {/* Polite status region — present at all times while the form is shown so
              transitions are announced. Visually rendered per the brief. */}
          <div role="status" aria-live="polite" aria-atomic="true">
            {status === "submitting" ? (
              <p className="text-meta text-text-muted">{t("form.sending")}</p>
            ) : status === "error" ? (
              <p className="flex items-start gap-1.5 text-meta text-error">
                <CircleAlert
                  className="mt-0.5 size-4 shrink-0"
                  strokeWidth={2}
                  aria-hidden
                />
                <span>{t("form.error")}</span>
              </p>
            ) : status === "preview" ? (
              <p className="flex items-start gap-1.5 text-meta text-text-muted">
                <Info
                  className="mt-0.5 size-4 shrink-0"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span>{t("form.preview")}</span>
              </p>
            ) : null}
          </div>
        </div>

        <p className="text-meta text-text-muted">
          {t.rich("form.privacyNote", {
            link: (chunks) => (
              <Link
                href="/privacy"
                className="text-primary-strong underline underline-offset-2 outline-none hover:text-primary-hover focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      </form>
    </div>
  );
}

/** Inline field error (§6.12) — brick text + icon, referenced by `aria-describedby`. */
function FieldError({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-meta text-error">
      <CircleAlert
        className="mt-0.5 size-4 shrink-0"
        strokeWidth={2}
        aria-hidden
      />
      <span>{children}</span>
    </p>
  );
}
