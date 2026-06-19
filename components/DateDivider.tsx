import { formatTanggalIndonesia } from "@/lib/util/formatDate";
import { cn } from "@/lib/utils";

interface DateDividerProps {
  isoDate: string;
  className?: string;
}

export function DateDivider({ isoDate, className }: DateDividerProps) {
  return (
    <div
      role="separator"
      aria-label={formatTanggalIndonesia(isoDate)}
      className={cn("my-6 flex items-center gap-3", className)}
    >
      <span className="h-px flex-1 bg-border-strong" aria-hidden />
      <span className="inline-flex items-center gap-2 rounded border border-border bg-bg-secondary px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-text-secondary">
        <span className="h-1.5 w-1.5 rounded-full bg-text-muted" aria-hidden />
        {formatTanggalIndonesia(isoDate)}
      </span>
      <span className="h-px flex-1 bg-border-strong" aria-hidden />
    </div>
  );
}
