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
        "sr-only rounded-button bg-primary-strong px-4 py-2 font-medium text-on-primary",
        "focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:outline-2 focus:outline-offset-2 focus:outline-focus",
        className,
      )}
    >
      {children}
    </a>
  );
}
