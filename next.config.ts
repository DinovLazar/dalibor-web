import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    // Allow next/image to optimize Sanity-hosted images. Scoped to this
    // project's image path on the Sanity CDN (be as specific as possible).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/ndqmaath/**",
      },
    ],
  },
};

// Wrap (don't replace) the existing config with the next-intl plugin, pointing
// it at the per-request i18n config. The `--webpack` build flag lives in the
// package.json scripts and is unaffected by this wrapper.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
