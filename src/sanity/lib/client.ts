import {createClient} from "next-sanity";

import {apiVersion, dataset, projectId} from "../env";

/**
 * Public read client used by the website (server components). It reads only
 * PUBLISHED documents and serves them from the CDN — no token is needed because
 * the `production` dataset is public. Drafts/editing happen in the Studio behind
 * a Sanity login and never reach this client (`perspective: "published"`).
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
