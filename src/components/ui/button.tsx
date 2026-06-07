import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button — shadcn/ui primitive (Base UI) restyled to Style A "Hardcover" (§6.1).
 *
 * The handover's three button kinds map to:
 *  - `default`  → Primary   (deep-caramel fill; the label clears AA at any size — §2.5)
 *  - `outline`  → Secondary (caramel outline, deep-caramel label, caramel wash on hover)
 *  - `ghost`    → Quiet / text
 * Focus uses the global Style A ring (2px deep-caramel outline, 2px offset), not the
 * shadcn neutral ring. Caramel (`--color-primary`) is NEVER a text-bearing fill.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-button border border-transparent bg-clip-padding px-5 font-medium text-base tracking-[0.02em] whitespace-nowrap outline-none select-none transition-[background-color,transform,box-shadow,border-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-primary-strong text-on-primary hover:-translate-y-px hover:bg-primary-hover active:translate-y-0 active:bg-[#4A351F] disabled:bg-surface disabled:text-text-muted",
        outline:
          "border-[1.5px] border-primary bg-transparent text-primary-strong hover:border-primary-strong hover:bg-[rgb(168_116_55_/_0.14)] active:bg-[rgb(168_116_55_/_0.20)] disabled:border-transparent disabled:bg-surface disabled:text-text-muted",
        ghost:
          "bg-transparent px-2 text-primary-strong hover:bg-[rgb(168_116_55_/_0.08)] hover:underline disabled:text-text-muted disabled:no-underline",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-3.5 text-[0.9375rem]",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
