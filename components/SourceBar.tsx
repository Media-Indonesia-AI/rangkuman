import { cn } from "@/lib/utils";
import type { Sumber } from "@/lib/mock/recaps";
import { initialsOf } from "@/lib/util/formatMedia";

interface SourceBarProps {
  sumber: Sumber[];
  size?: "sm" | "md";
  /** Cap the number of media chips shown. Any beyond this are
   *  collapsed into a trailing `+N` chip. Omit to show all. */
  max?: number;
  className?: string;
}

export function SourceBar({ sumber, size = "md", max, className }: SourceBarProps) {
  const visible = max != null ? sumber.slice(0, max) : sumber;
  const overflow = sumber.length - visible.length;

  return (
    <ul
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      aria-label="Media yang memberitakan"
    >
      {visible.map((s) => {
        // Shared chip body — the avatar circle, the media name, and
        // the optional "×N" count. Same DOM in both render branches;
        // only the outer element (anchor vs span) changes.
        const body = (
          <>
            <span
              aria-hidden
              className={cn(
                "inline-flex items-center justify-center rounded-sm bg-bg-elevated font-mono font-semibold uppercase text-text-secondary",
                size === "sm" ? "h-4 w-4 text-[8px]" : "h-5 w-5 text-[9px]",
              )}
            >
              {initialsOf(s.media)}
            </span>
            <span
              className={cn(
                "font-medium text-text-secondary",
                size === "sm" ? "text-[10.5px]" : "text-[11.5px]",
              )}
            >
              {s.media}
            </span>
            {s.jumlah > 1 && (
              <span className="font-mono text-[9.5px] font-semibold text-brand num-tabular">
                ×{s.jumlah}
              </span>
            )}
          </>
        );

        // When `s.url` is present, the chip becomes an external link
        // to a representative article from that publisher. When
        // absent (e.g. mock recaps without URLs, or trending stories
        // where only the count+name are shipped), it stays a plain
        // `<span>` so the affordance doesn't promise a navigation.
        const baseChip =
          "inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-tertiary px-1.5 py-0.5";

        return (
          <li key={s.media}>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Kunjungi ${s.media}`}
                aria-label={`Kunjungi ${s.media} (tab baru)`}
                className={cn(
                  baseChip,
                  "transition-colors hover:border-border-strong hover:bg-bg-elevated hover:text-text-primary",
                )}
              >
                {body}
              </a>
            ) : (
              <span className={baseChip}>{body}</span>
            )}
          </li>
        );
      })}
      {overflow > 0 && (
        <li
          className={cn(
            "inline-flex items-center rounded-md border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono font-semibold text-text-muted num-tabular",
            size === "sm" ? "text-[10.5px]" : "text-[11.5px]",
          )}
          aria-label={`${overflow} media lainnya`}
        >
          +{overflow}
        </li>
      )}
    </ul>
  );
}
