import { cn } from "@/lib/utils";

interface GradientDividerProps {
  className?: string;
  /** Vertical margin in tailwind units. Defaults to "my-8". */
  spacing?: string;
}

/** Subtle gradient-fade horizontal divider (instead of a flat <hr>). */
export function GradientDivider({ className, spacing = "my-8" }: GradientDividerProps) {
  return (
    <div
      role="separator"
      aria-hidden
      className={cn(spacing, className)}
    >
      <div className="divider-gradient" />
    </div>
  );
}
