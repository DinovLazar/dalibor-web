import { cn } from "@/lib/utils";

/**
 * Input — shadcn-shaped primitive, hand-rolled and themed to Style A "Hardcover"
 * (§6.12). Hand-rolled rather than pulled from the registry: a text input is a
 * native element that needs no primitive library, and the project runs on Base UI
 * (not Radix), so keeping it native avoids a new top-level dependency (Decision §2.1).
 *
 * 48px tall, `--radius-input`, a `--color-border-strong` boundary on cream, Lora
 * body text at 17px. Focus and error are colour + soft ring only (the border width
 * never changes) so there is no layout shift between states — matching the §6.9
 * search box already in the repo. Error styling is driven by `aria-invalid`, so the
 * form sets one attribute and both the border and message turn brick.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-input border border-border-strong bg-bg px-3.5 text-[1.0625rem] text-text placeholder:text-text-muted outline-none transition-shadow",
        "focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgb(168_116_55_/_0.18)]",
        "aria-[invalid=true]:border-error aria-[invalid=true]:shadow-[0_0_0_3px_rgb(143_53_38_/_0.15)]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
