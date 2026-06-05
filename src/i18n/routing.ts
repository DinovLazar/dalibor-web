import { defineRouting } from "next-intl/routing";

/**
 * Single source of routing truth, shared by the proxy, the navigation helpers
 * and the request config. Decisions baked in (do not re-open):
 * - Macedonian (`mk`) is the default locale.
 * - `localePrefix: 'always'` — every URL carries its prefix (`/mk`, `/en`, `/sr`).
 * - `localeDetection: false` — the root never redirects by browser language or
 *   cookie; `/` → `/mk`, always.
 * Serbian is written in the Latin script; the architecture is script-agnostic,
 * so a future flip to Cyrillic only touches `sr.json` + the switcher label.
 */
export const routing = defineRouting({
  locales: ["mk", "en", "sr"],
  defaultLocale: "mk",
  localePrefix: "always",
  localeDetection: false,
});
