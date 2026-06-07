"use client";

import {NextStudio} from "next-sanity/studio";

import config from "../../../../sanity.config";

/**
 * Client wrapper for the embedded Studio. It imports `sanity.config` directly so
 * the (non-serializable) config never crosses a server -> client props boundary.
 * The Studio is a browser SPA, so its config + schema belong in the client bundle.
 */
export default function Studio() {
  return <NextStudio config={config} />;
}
