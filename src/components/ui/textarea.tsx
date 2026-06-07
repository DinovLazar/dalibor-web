import { cn } from "@/lib/utils";

/**
 * Textarea — shadcn-shaped primitive, hand-rolled and themed to Style A (§6.12).
 * Native element (no primitive library; keeps Base UI + the flat dependency surface
 * — see {@link ./input.tsx}). Same surface, boundary, focus and `aria-invalid`
 * error treatment as Input, with a 140px minimum height and vertical resize.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[140px] w-full resize-y rounded-input border border-border-strong bg-bg px-3.5 py-3 text-[1.0625rem] leading-[1.6] text-text placeholder:text-text-muted outline-none transition-shadow",
        "focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgb(168_116_55_/_0.18)]",
        "aria-[invalid=true]:border-error aria-[invalid=true]:shadow-[0_0_0_3px_rgb(143_53_38_/_0.15)]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
