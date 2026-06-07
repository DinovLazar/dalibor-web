import { cn } from "@/lib/utils";

/**
 * Container — centres content at the Style A shell width (70rem) with the §4.6
 * page gutters: 20px mobile, 32px ≥sm, 48px ≥lg. Server component.
 */
export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-shell px-5 sm:px-8 lg:px-12", className)}
      {...props}
    />
  );
}
