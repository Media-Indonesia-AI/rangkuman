import { cn } from "@/lib/utils";
import { FileSearch } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  suggestion?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  suggestion,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-bg-tertiary text-text-muted">
        <FileSearch className="h-5 w-5" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-[14px] font-semibold text-text-primary">{title}</p>
        {description && (
          <p className="text-[13px] text-text-secondary">{description}</p>
        )}
        {suggestion && (
          <p className="text-[11px] text-text-muted">{suggestion}</p>
        )}
      </div>
    </div>
  );
}
