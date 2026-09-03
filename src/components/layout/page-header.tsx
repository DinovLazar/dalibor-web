import { cn } from "@/lib/utils";

/**
 * PageHeader — the shared page/section head (§6.15, §7): optional eyebrow over a
 * title, with an optional one-line description. Default heading is <h1> (one per
 * page); pass `as="h2"` for in-page section heads. Mobile down-sizes the H1 per
 * the §3.2 type scale. Server component.
 */
export function PageHeader({
  title,
  eyebrow,
  description,
  as: Heading = "h1",
  className,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col", className)}>
      {eyebrow ? (
        <p className="eyebrow mb-2 text-eyebrow uppercase text-primary-strong">
          {eyebrow}
        </p>
      ) : null}
      <Heading
        className={cn(
          "font-display text-text",
          Heading === "h1" ? "text-h1" : "text-h2",
        )}
      >
        {title}
      </Heading>
      {description ? (
        <p className="mt-3 max-w-prose text-body-lg text-text-muted">
          {description}
        </p>
      ) : null}
    </header>
  );
}
