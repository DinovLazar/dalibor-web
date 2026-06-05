import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
};

// Wrap (don't replace) the existing config with the next-intl plugin, pointing
// it at the per-request i18n config. The `--webpack` build flag lives in the
// package.json scripts and is unaffected by this wrapper.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
