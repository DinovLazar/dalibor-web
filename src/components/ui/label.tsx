import { cn } from "@/lib/utils";

/**
 * Label — shadcn-shaped primitive, hand-rolled and themed to Style A (§6.12). A
 * native <label> is fully accessible via `htmlFor`/`id`; the Radix shadcn label
 * would add `@radix-ui/react-label`, which conflicts with this project's Base UI
 * deviation and the "no new top-level dependency" rule, so it is kept native.
 *
 * Lora 500 at 15px (`text-meta`) in espresso; the visible required `*` and the
 * "(optional)" suffix are passed in as children by the form so this stays generic.
 */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex select-none items-center gap-1 text-meta font-medium text-text",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
