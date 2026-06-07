import Image from "next/image";
import { BookOpen } from "lucide-react";

import { urlForImage } from "@/sanity/lib/image";
import { localizedValue } from "@/sanity/lib/localize";
import type { LocalizedImage } from "@/sanity/sanity.types";
import { cn } from "@/lib/utils";

/**
 * Book-cover image (§6.11) — a 2:3 portrait rendered through `next/image` (sized
 * for the layout via the Sanity image-url builder, `fill` + `sizes` to avoid
 * layout shift). When no image is set it falls back to the graceful Style A
 * placeholder: a parchment block with an inset hairline frame, a `book-open`
 * glyph, and the work's monogram. No skeuomorphism.
 *
 * Shared by the Home / Book / Reviews surfaces. Pure of server-only deps (the
 * Sanity image builder needs only the public project id/dataset), so it renders
 * in client components too — the Reviews search results reuse it on the client.
 *
 * `decorative` covers (the cover inside a card whose title already names the
 * link) get `alt=""` so screen readers don't hear duplicate link text (§6.6).
 * The placeholder is purely visual, so it is always `aria-hidden`.
 */
export function Cover({
  image,
  locale,
  sizes,
  pixelWidth,
  monogram,
  decorative = false,
  className,
}: {
  image: LocalizedImage | null;
  locale: string;
  /** `next/image` sizes hint for the responsive srcset. */
  sizes: string;
  /** Source width for the Sanity transform (≈2× the largest display width). */
  pixelWidth: number;
  /** Initial shown in the no-image placeholder. */
  monogram?: string;
  /** Inside a card link → alt="" to avoid duplicate accessible name. */
  decorative?: boolean;
  /** Sets the cover's (responsive) width; height comes from the 2:3 ratio. */
  className?: string;
}) {
  const hasImage = Boolean(image?.asset);

  return (
    <div
      className={cn(
        "relative aspect-[2/3] shrink-0 overflow-hidden rounded-image shadow-cover",
        className,
      )}
    >
      {hasImage ? (
        <Image
          src={urlForImage(image!)
            .width(pixelWidth)
            .height(Math.round(pixelWidth * 1.5))
            .auto("format")
            .url()}
          alt={decorative ? "" : (localizedValue(image!.alt, locale) ?? "")}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-image border border-border bg-surface text-text-muted"
        >
          <BookOpen className="size-7" strokeWidth={1.75} />
          {monogram ? (
            <span className="font-display text-h3 leading-none">{monogram}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
