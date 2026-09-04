import type { MetadataRoute } from "next";

/**
 * Web app manifest (Phase 3.01) — served at `/manifest.webmanifest` by the Next
 * file convention. Minimal on purpose: this is a reading site, not an app, so
 * `display: "browser"` keeps saved-to-home-screen visits in the normal browser
 * with its back button and share sheet rather than a chrome-less shell.
 *
 * The name is the Latin form in every locale (it is a person's name, and the
 * header wordmark is Latin site-wide — §6.3). Colours are the locked Style A
 * page ground, so the Android splash/theme matches the site instead of the
 * browser default. Icons reuse the existing `app/icon.png` (512×512) and
 * `app/apple-icon.png` (180×180) metadata routes — no new assets.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dalibor Plečić",
    short_name: "Dalibor Plečić",
    description:
      "Writer, literary critic and translator — reviews, essays and books.",
    start_url: "/",
    display: "browser",
    background_color: "#F4EDE1",
    theme_color: "#F4EDE1",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
