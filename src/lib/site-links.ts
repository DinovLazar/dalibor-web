/**
 * site-links — Dalibor's external links + contact, read by the footer now and the
 * Contact page later (1.11).
 *
 * PROVISIONAL — confirm/finalize in Phase 2.01; email in 2.02. Do NOT treat these
 * as published-accurate. URLs are the candidate links from the research dossier;
 * some handles are unconfirmed (flagged inline). Keep this file data-only (no
 * React/icons) so both the footer and the Contact page can import it freely.
 */
export const siteLinks = {
  /** Empty/inert until 2.02 — render the slot, but never invent an address. */
  email: "",
  /** Handle unconfirmed — verify in 2.01. */
  instagram: "https://www.instagram.com/daliborac/",
  facebook: "https://www.facebook.com/plecicd/",
  booksa: "https://booksa.hr/suradnici/dalibor-plecic",
  /** Bulgarian interview; the Kanal VIS video is a second candidate (2.01). */
  interview: "https://www.youtube.com/watch?v=Jgt3ZrJevkM",
  /** Optional extra writing hubs — rendered only where the footer has room. */
  versopolis: "https://www.versopolis.com/author/54/dalibor-plecic",
  linkedin: "https://www.linkedin.com/in/plecicdalibor/",
  partizanska: "https://partizanskaknjiga.rs/translator/dalibor-plecic/",
} as const;

export type SiteLinks = typeof siteLinks;
export type SiteLinkKey = keyof SiteLinks;
