import {defineCliConfig} from "sanity/cli";

import {dataset, projectId} from "./src/sanity/env";

/**
 * Config for the Sanity CLI (`sanity schema extract`, `typegen generate`,
 * `dataset import`, …). Project/dataset come from the same env as the app.
 */
export default defineCliConfig({
  api: {projectId, dataset},
  // Hosted Studio target (Phase 2.04): deployed to https://daliborplecic.sanity.studio.
  // Pinning the appId keeps `sanity deploy` non-interactive on future deploys.
  deployment: {appId: "mesr4xa2evz7kwohj4488y94"},
  // TypeGen: scan src for `defineQuery`, read the extracted schema.json, and
  // emit typed query results to src/sanity/sanity.types.ts. (This replaces the
  // deprecated standalone sanity-typegen.json.)
  typegen: {
    path: "./src/**/*.{ts,tsx}",
    schema: "./schema.json",
    generates: "./src/sanity/sanity.types.ts",
  },
});
