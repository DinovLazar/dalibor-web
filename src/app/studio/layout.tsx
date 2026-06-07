import type {ReactNode} from "react";

/**
 * Second root layout — sibling of src/app/[locale]/layout.tsx.
 *
 * The 1.04 setup made `[locale]/layout.tsx` the project's root layout (there is
 * no src/app/layout.tsx). The non-localized /studio branch therefore needs its
 * own root layout that renders <html>/<body>. The proxy (src/proxy.ts) excludes
 * /studio from locale routing so it is never redirected to /mk/studio.
 *
 * No globals.css here on purpose — the Studio ships its own styling and the
 * site's Tailwind preflight should not bleed into it. Per-page metadata/viewport
 * (incl. robots: noindex) are set in [[...tool]]/page.tsx via next-sanity.
 */
export default function StudioLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
