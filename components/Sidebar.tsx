import Link from "next/link";
import { ChevronRight, Clock, BookOpen } from "lucide-react";
import { headlines, marketStories, type MarketHeadline } from "@/lib/mock/headlines";
import { cn } from "@/lib/utils";
import { SentimentBadge } from "./SentimentBadge";

export function Sidebar() {
  return (
    <aside className="space-y-4" aria-label="Sidebar">
      {/* Latest Headlines — vertical timeline, compact */}
      <CompactHeadlines headlines={headlines.slice(0, 6)} />
    </aside>
  );
}

function CompactHeadlines({ headlines }: { headlines: MarketHeadline[] }) {
  return (
    <section
      className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
      aria-label="Latest headlines"
    >
      <header className="flex items-center justify-between border-b border-border bg-bg-tertiary px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-brand" aria-hidden />
          <h3 className="label">Latest Headlines</h3>
        </div>
        <span className="font-mono text-[9.5px] text-text-muted num-tabular">
          {headlines.length}
        </span>
      </header>

      <ol className="relative">
        {headlines.map((h, idx) => {
          const isLast = idx === headlines.length - 1;
          const story = h.storyId ? marketStories.find((s) => s.id === h.storyId) : undefined;
          const storyColor = story
            ? story.sentiment === "positif"
              ? "bg-bullish"
              : story.sentiment === "negatif"
                ? "bg-bearish"
                : "bg-mixed"
            : "bg-text-muted";
          return (
            <li
              key={h.id}
              className={cn(
                "group relative pl-8 pr-3 py-2.5 transition-colors hover:bg-bg-tertiary",
                !isLast && "border-b border-border",
              )}
            >
              {/* Timeline rail */}
              <span
                aria-hidden
                className={cn(
                  "absolute left-3 top-0 bottom-0 w-0.5 -translate-x-1/2",
                  story ? storyColor : "bg-border",
                )}
              />
              {/* Timeline dot */}
              <span
                aria-hidden
                className={cn(
                  "absolute left-3 top-3.5 h-2 w-2 -translate-x-1/2 rounded-full ring-4 ring-bg-secondary",
                  story ? storyColor : "bg-text-muted",
                )}
              />

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-muted num-tabular">
                    {h.relativeTime}
                  </span>
                  {h.ticker && (
                    <span className="inline-flex items-center gap-0.5 rounded border border-border bg-bg-tertiary px-1 py-px font-mono text-[9.5px] font-semibold text-text-primary">
                      {h.ticker}
                      {h.tickerChange !== undefined && (
                        <span
                          className={cn(
                            "num-tabular ml-0.5",
                            h.tickerChange >= 0 ? "text-bullish" : "text-bearish",
                          )}
                        >
                          {(h.tickerChange >= 0 ? "+" : "") +
                            h.tickerChange.toFixed(2)}
                          %
                        </span>
                      )}
                    </span>
                  )}
                  {h.sentiment && (
                    <SentimentBadge sentiment={h.sentiment} size="sm" />
                  )}
                  {story && (
                    <span className="inline-flex items-center gap-0.5 rounded border border-brand-line bg-brand-soft px-1 py-px font-mono text-[9px] font-semibold uppercase tracking-widest text-brand">
                      <BookOpen className="h-2 w-2" aria-hidden />
                      Story
                    </span>
                  )}
                </div>
                <p className="text-[11.5px] font-medium leading-snug text-text-primary group-hover:text-brand">
                  {h.title}
                </p>
                {h.source && (
                  <p className="font-mono text-[9.5px] text-text-muted">{h.source}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
