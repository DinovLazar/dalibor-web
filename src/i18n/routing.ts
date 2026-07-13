import { defineRouting } from "next-intl/routing";

/**
 * Single source of routing truth, shared by the proxy, the navigation helpers
 * and the request config. Decisions baked in:
 * - English (`en`) is the default locale (reversal of the original mk default —
 *   Lazar's call, 2026-07-13; the site now opens in English). See
 *   Dalibor-Website-Decisions.md.
 * - `localePrefix: 'always'` — every URL carries its prefix (`/mk`, `/en`, `/sr`).
 * - `localeDetection: false` — the root never redirects by browser language or
 *   cookie; `/` → `/en`, always.
 * Serbian is written in the Latin script; the architecture is script-agnostic,
 * so a future flip to Cyrillic only touches `sr.json` + the switcher label.
 */
export const routing = defineRouting({
  locales: ["mk", "en", "sr"],
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: false,
});
