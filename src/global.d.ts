import type messages from "@/messages/en.json";

import type { routing } from "@/i18n/routing";

/**
 * Strongly-typed locales + message keys for next-intl (use-intl `AppConfig`).
 * English is the canonical key source; `mk.json` / `sr.json` mirror its shape.
 * This gives autocomplete + compile-time checking of `t("…")` keys everywhere.
 */
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
