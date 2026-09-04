import { Clock, Tag } from "lucide-react";
import { CATEGORY_CONFIG, type StoryEvent } from "@/lib/highlight";
import { cn } from "@/lib/utils";

interface StoryTimelineProps {
  events: StoryEvent[];
}

const HERO_GRADIENT: Record<string, string> = {
  saham: "bg-hero-saham",
  bisnis: "bg-hero-bisnis",
  ekonomi: "bg-hero-ekonomi",
  kebijakan: "bg-hero-kebijakan",
  global: "bg-hero-global",
  komoditas: "bg-hero-komoditas",
};

export function StoryTimeline({ events }: StoryTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line connector */}
      <div
        className="absolute left-[7.5px] top-2 bottom-2 w-px bg-gradient-to-b from-border-strong via-border to-transparent"
        aria-hidden
      />

      <ol className="space-y-4">
        {events.map((evt, i) => {
          const cat = evt.category;
          const cfg = cat ? CATEGORY_CONFIG[cat] : null;
          const dotClass = cat ? HERO_GRADIENT[cat] : "bg-text-muted";

          return (
            <li key={i} className="relative flex gap-3 sm:gap-4">
              {/* Dot */}
              <div className="relative z-10 flex shrink-0 flex-col items-center pt-1.5">
                <div
                  className={cn(
                    "h-[15px] w-[15px] rounded-full ring-2 ring-bg-primary",
                    dotClass,
                  )}
                  aria-hidden
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="inline-flex items-center gap-1 rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-text-secondary">
                    <Clock className="h-2.5 w-2.5" aria-hidden />
                    {evt.time}
                  </span>
                  {cfg && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider",
                        cfg.colorClass,
                        `border-current/20`,
                      )}
                    >
                      <Tag className="h-2 w-2" aria-hidden />
                      {cfg.label}
                    </span>
                  )}
                  {evt.source && (
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-text-faint">
                      · {evt.source}
                    </span>
                  )}
                </div>
                <h3 className="mt-1.5 text-[13.5px] font-semibold leading-snug text-text-primary">
                  {evt.title}
                </h3>
                {evt.detail && (
                  <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
                    {evt.detail}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
