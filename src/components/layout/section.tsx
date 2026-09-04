import { cn } from "@/lib/utils";

/**
 * Section — vertical rhythm wrapper. Style A section padding (§4.1): 64px
 * desktop, 40px on a phone (Phase 3.01 — down from 48px, because below `sm` the
 * alternating band colours now carry the separation and padding no longer has to
 * do it alone). Pair with <Container> for horizontal gutters. Server component.
 */
export function Section({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return <section className={cn("py-12 max-sm:py-10 sm:py-16", className)} {...props} />;
}
