/**
 * Twitter share card (Phase 1.12) — identical to the default Open Graph card.
 * Re-exporting the `opengraph-image` route's generator (and its `alt` / `size` /
 * `contentType` / `generateStaticParams`) keeps a single source of truth: Next
 * mounts this as the `twitter:image` while the OG file convention provides
 * `og:image`, so each is emitted exactly once.
 */
export {
  default,
  alt,
  size,
  contentType,
  generateStaticParams,
} from "./opengraph-image";
