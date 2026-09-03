import { cn } from "@/lib/utils";

/**
 * Skip-to-content link (§10). Visually hidden until focused, then appears as a
 * Style A pill in the top-left. Must be the FIRST focusable element in the
 * document so a keyboard user can jump straight to <main id="content">.
 */
export function SkipToContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href="#content"
      className={cn(
        "sr-only rounded-button bg-primary-strong font-medium text-on-primary",
        // When it appears it must be a real target: 44px tall, ≥44px wide, and
        // clear of the notch. Previously 32×16, which failed WCAG 2.2 AA SC 2.5.8.
        "focus:not-sr-only focus:fixed focus:z-[100] focus:inline-flex focus:min-h-11 focus:min-w-11 focus:items-center focus:justify-center focus:px-5 focus:py-2.5",
        "focus:left-[max(1rem,env(safe-area-inset-left))] focus:top-[max(1rem,env(safe-area-inset-top))]",
        "focus:outline-2 focus:outline-offset-2 focus:outline-focus",
        className,
      )}
    >
      {children}
    </a>
  );
}
