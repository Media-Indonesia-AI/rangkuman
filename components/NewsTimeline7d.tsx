import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecapForStock } from "@/lib/mock/recaps";
import { format, subDays, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface NewsTimeline7dProps {
  kode: string;
  todayIso: string;
  className?: string;
}

/**
 * 7-day news timeline. For each of the last 7 days, look up whether a recap
 * exists for this stock. If yes, show a sentiment dot + article count + mini
 * headline. Empty days are rendered as faded entries so the timeline stays
 * contiguous.
 */
export function NewsTimeline7d({ kode, todayIso, className }: NewsTimeline7dProps) {
  const today = parseISO(todayIso);
  const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  return (
    <section
      className={cn("overflow-hidden rounded-lg border border-border bg-bg-secondary", className)}
      aria-label="Timeline berita 7 hari"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-brand" aria-hidden />
          <span className="label">Timeline Berita · 7 Hari</span>
        </div>
        <span className="font-mono text-[10px] text-text-faint">hari ini + 6 hari ke belakang</span>
      </header>

      <ol className="relative px-3.5 py-3.5">
        {/* Vertical rail */}
        <span
          aria-hidden
          className="absolute left-[26px] top-3.5 bottom-3.5 w-px bg-border"
        />
        {days.map((d) => {
          const iso = format(d, "yyyy-MM-dd");
          const recap = getRecapForStock(kode, iso);
          const isToday = iso === todayIso;
          const date = format(d, "d MMM", { locale: idLocale });
          const dayName = format(d, "EEE", { locale: idLocale });

          const dotColor = recap
            ? recap.sentimen === "positif"
              ? "bg-bullish"
              : recap.sentimen === "negatif"
                ? "bg-bearish"
                : "bg-mixed"
            : "bg-border";

          return (
            <li
              key={iso}
              className={cn(
                "relative grid grid-cols-[40px_1fr] items-start gap-3 py-2",
                isToday && "font-semibold",
              )}
            >
              {/* Date pill on the left */}
              <div className="flex flex-col items-end">
                <span
                  className={cn(
                    "rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest",
                    isToday ? "text-brand" : "text-text-secondary",
                  )}
                >
                  {date}
                </span>
                <span className="mt-0.5 font-mono text-[8.5px] uppercase tracking-wider text-text-faint">
                  {dayName}
                </span>
              </div>

              {/* Dot on the rail */}
              <div className="relative min-w-0">
                <span
                  aria-hidden
                  className={cn(
                    "absolute -left-[19px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-bg-secondary",
                    dotColor,
                    !recap && "opacity-40",
                    isToday && "ring-2",
                  )}
                />
                {recap ? (
                  <div className="rounded-md border border-border bg-bg-tertiary/40 p-2.5">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded px-1 py-px font-mono text-[8.5px] font-semibold uppercase tracking-widest",
                          recap.sentimen === "positif"
                            ? "bg-bullish-soft text-bullish"
                            : recap.sentimen === "negatif"
                              ? "bg-bearish-soft text-bearish"
                              : "bg-mixed-soft text-mixed",
                        )}
                      >
                        {recap.sentimen}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted">
                        {recap.jumlahBerita} artikel
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[11.5px] leading-snug text-text-primary">
                      {recap.ringkasan}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-md border border-dashed border-border bg-bg-tertiary/20 px-2.5 py-1.5">
                    <Clock className="h-2.5 w-2.5 text-text-faint" aria-hidden />
                    <span className="font-mono text-[10.5px] italic text-text-faint">
                      Gak ada berita
                    </span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
