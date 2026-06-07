import { cn } from "@/lib/utils";

/**
 * Section — vertical rhythm wrapper. Style A section padding (§4.1): 48px mobile,
 * 64px desktop. Pair with <Container> for horizontal gutters. Server component.
 */
export function Section({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return <section className={cn("py-12 sm:py-16", className)} {...props} />;
}
