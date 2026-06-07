import {createImageUrlBuilder, type SanityImageSource} from "@sanity/image-url";

import {dataset, projectId} from "../env";

// Named export (the default export is deprecated in @sanity/image-url v2).
const builder = createImageUrlBuilder({projectId, dataset});

/**
 * Build a CDN URL for a Sanity image source (asset ref, image object, etc.).
 * Chain transforms on the result, e.g. `urlForImage(img).width(132).height(198).url()`.
 */
export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}
