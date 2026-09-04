import { cn } from "@/lib/utils";

/**
 * Container — centres content at the Style A shell width (70rem) with the §4.6
 * page gutters. The gutter itself lives in one place (`--page-gutter` in
 * globals.css: 20px mobile / 32px ≥sm / 48px ≥lg, dropping to 16px below 360px)
 * so `.full-bleed` can cancel it exactly, and `page-gutter` widens it to clear
 * `env(safe-area-inset-*)` on a notched device in landscape. Server component.
 */
export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-shell page-gutter", className)}
      {...props}
    />
  );
}
