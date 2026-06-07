"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

/**
 * Separator — shadcn/ui primitive (Base UI). Sized from the `orientation` prop
 * directly (no shadcn/tailwind.css custom variants), hairline colour `bg-border`.
 * Override the colour via `className` where it sits on a dark ground (e.g. footer).
 */
function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
