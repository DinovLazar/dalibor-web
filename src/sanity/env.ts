/**
 * Sanity environment variables, read + validated once. These are all PUBLIC
 * values (no secret token): the website reads only published documents.
 *
 * - NEXT_PUBLIC_SANITY_PROJECT_ID — the project id from sanity.io/manage
 * - NEXT_PUBLIC_SANITY_DATASET    — "production" (public dataset)
 * - NEXT_PUBLIC_SANITY_API_VERSION — pinned API date (content-lake versioning)
 */

function assertValue<T>(value: T | undefined, errorMessage: string): T {
  if (value === undefined) {
    throw new Error(errorMessage);
  }
  return value;
}

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-06-06";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET",
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID",
);
