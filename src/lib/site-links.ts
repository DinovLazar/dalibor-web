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
  /**
   * Primary interview slot — the Bulgarian YouTube interview ("В читАлнЯта").
   * Read by the footer and the Contact page's "Interviews" link.
   */
  interview: "https://www.youtube.com/watch?v=Jgt3ZrJevkM",
  /**
   * Second interview candidate — Kanal VIS "Vis a Vis". URL is in the research
   * dossier but not yet lifted here; PROVISIONAL — confirm/fill in 2.01. Empty
   * for now so nothing renders a fabricated link.
   */
  interviewVis: "",
  /** Optional extra writing hubs — rendered only where the footer has room. */
  versopolis: "https://www.versopolis.com/author/54/dalibor-plecic",
  linkedin: "https://www.linkedin.com/in/plecicdalibor/",
  partizanska: "https://partizanskaknjiga.rs/translator/dalibor-plecic/",
  /** Site builder — the "Built by Vertex Consulting" credit in the header. */
  vertex: "https://www.vertexconsulting.mk",
} as const;

export type SiteLinks = typeof siteLinks;
export type SiteLinkKey = keyof SiteLinks;
