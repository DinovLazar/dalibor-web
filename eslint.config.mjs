import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Hosted Sanity Studio build output (gitignored artifact from `sanity deploy`,
    // 2.04) — large minified bundles, never app source. Linting it OOMs ESLint.
    "dist/**",
    // Sanity TypeGen output (generated) + seed tooling/data (not app code):
    "src/sanity/sanity.types.ts",
    "sanity/seed/**",
  ]),
]);

export default eslintConfig;
