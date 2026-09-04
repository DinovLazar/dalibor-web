import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * `tailwind-merge` has to classify a class before it can decide what conflicts
 * with what, and it only knows Tailwind's *stock* scales. Style A's type scale
 * lives entirely in `@theme` under names Tailwind never ships (`text-h1`,
 * `text-meta`, `text-chip`, …), so out of the box tailwind-merge read every one
 * of them as a text *colour* — and then let a real colour later in the same
 * `cn()` call override it. `cn("text-h4 text-text")` silently returned
 * `"text-text"`, and the element rendered at the inherited 16px instead of its
 * designed size.
 *
 * Found in Phase 3.01: it is why the Reviews topic chips rendered at 16px
 * rather than 13px, and it would have quietly disabled the whole phone type
 * scale in every component that composes classes through `cn()`. Declaring the
 * scale here makes the size and the colour coexist, while two competing sizes
 * still collapse to the last one, which is the behaviour we actually want.
 *
 * Keep this list in sync with the `--text-*` tokens in `src/app/globals.css`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "h1",
            "h2",
            "h3",
            "h4",
            "body-lg",
            "body",
            "meta",
            "caption",
            "eyebrow",
            "chip",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
