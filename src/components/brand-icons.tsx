/**
 * Brand glyphs (Instagram · Facebook · YouTube).
 *
 * lucide-react 1.x removed its brand/logo icons (trademark reasons), so these are
 * the same MIT-licensed Lucide outlines used in the 1.03 mockups, inlined as tiny
 * components with the Lucide API surface we use (`className`, `strokeWidth`). Size
 * is driven by `className` (e.g. `size-5`); default stroke is 1.75 per §5.
 */
type BrandIconProps = {
  className?: string;
  strokeWidth?: number;
};

const base = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function InstagramIcon({ className, strokeWidth = 1.75 }: BrandIconProps) {
  return (
    <svg className={className} strokeWidth={strokeWidth} {...base}>
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function FacebookIcon({ className, strokeWidth = 1.75 }: BrandIconProps) {
  return (
    <svg className={className} strokeWidth={strokeWidth} {...base}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function YoutubeIcon({ className, strokeWidth = 1.75 }: BrandIconProps) {
  return (
    <svg className={className} strokeWidth={strokeWidth} {...base}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}
