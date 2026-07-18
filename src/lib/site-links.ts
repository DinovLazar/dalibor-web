/**
 * site-links — Dalibor's external links + contact, read by the footer and the
 * Contact page.
 *
 * CONFIRMED in Phase 2.01b from Dalibor's intake answers (§7 email, §8 links):
 * the email is real and shown publicly; X/Twitter (@PlecicD) was dropped at his
 * request and is intentionally absent; Instagram @daliborac, Booksa, Versopolis,
 * Partizanska, LinkedIn and Facebook are confirmed his; the three YouTube
 * interview links are his additions. Keep this file data-only (no React/icons)
 * so both the footer and the Contact page can import it freely.
 */
export const siteLinks = {
  /** Shown publicly (Contact + footer, mailto) — confirmed in intake §7. */
  email: "plecicdalibor@gmail.com",
  instagram: "https://www.instagram.com/daliborac/",
  facebook: "https://www.facebook.com/plecicd/",
  booksa: "https://booksa.hr/suradnici/dalibor-plecic",
  /**
   * Interview / media appearances — the three YouTube links Dalibor supplied in
   * intake §8. Rendered as a small list (Contact "Interviews" + footer) so all
   * three appear. (Replaces the single provisional `interview` slot.)
   */
  interviews: [
    "https://www.youtube.com/watch?v=p7luU3at4cI&t=5s",
    "https://www.youtube.com/watch?v=ZVLyyy8Pc7k&t=2114s",
    "https://www.youtube.com/watch?v=Jgt3ZrJevkM&t=77s",
  ],
  /**
   * Q21 / MuseumsQuartier Wien artist-in-residence profile (April–May 2015),
   * the residency his About-page bio names. NOT rendered anywhere — it exists
   * only to feed `sameAs` in the Person schema, where an institutional profile
   * page on a third-party domain is a strong identity signal. Verified live
   * 2026-07-18.
   */
  mqWien:
    "https://www.mqw.at/en/institutions/q21/artists-in-residence/2015/dalibor-plecic/",
  /** Optional extra writing hubs — rendered only where the footer has room. */
  versopolis: "https://www.versopolis.com/author/54/dalibor-plecic",
  linkedin: "https://www.linkedin.com/in/plecicdalibor/",
  partizanska: "https://partizanskaknjiga.rs/translator/dalibor-plecic/",
  /** Site builder — the "Built by Vertex Consulting" credit in the header. */
  vertex: "https://www.vertexconsulting.mk",
} as const;

export type SiteLinks = typeof siteLinks;
export type SiteLinkKey = keyof SiteLinks;
