import type {Metadata} from "next";
import {metadata as studioMetadata} from "next-sanity/studio";

import Studio from "./Studio";

/**
 * Embedded Sanity Studio at /studio (optional catch-all handles /studio and all
 * sub-paths). This server file owns the route's metadata/viewport — including
 * `robots: noindex` from next-sanity — and opts the static studio shell in;
 * the interactive <NextStudio> is rendered by the client wrapper.
 */
export const dynamic = "force-static";

export {viewport} from "next-sanity/studio";

export const metadata: Metadata = {
  ...studioMetadata,
  title: "Dalibor Plečić — Studio",
};

export default function StudioPage() {
  return <Studio />;
}
