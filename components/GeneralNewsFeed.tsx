"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Newspaper, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { ShareButton } from "./ShareButton";
import { Shimmer } from "./Shimmer";
import { getNewsStoriesByDate, getStoryCountsByDate, getLatestTime, type NewsCategory } from "@/lib/mock/general-news";
import { useTopics } from "@/lib/hooks/useTopics";
import { cn } from "@/lib/utils";

const categoryConfig: Record<
  NewsCategory,
  { label: string; text: string; bg: string; border: string; dot: string }
> = {
  ekonomi: {
    label: "Ekonomi",
    text: "text-cat-ekonomi",
    bg: "bg-cat-ekonomi-soft",
    border: "border-cat-ekonomi-line",
    dot: "bg-cat-ekonomi",
  },
  pemerintah: {
    label: "Pemerintah",
    text: "text-cat-pemerintah",
    bg: "bg-cat-pemerintah-soft",
    border: "border-cat-pemerintah-line",
    dot: "bg-cat-pemerintah",
  },
  politik: {
    label: "Politik",
    text: "text-cat-politik",
    bg: "bg-cat-politik-soft",
    border: "border-cat-politik-line",
    dot: "bg-cat-politik",
  },
  emiten: {
    label: "Emiten",
    text: "text-cat-emiten",
    bg: "bg-cat-emiten-soft",
    border: "border-cat-emiten-line",
    dot: "bg-cat-emiten",
  },
  global: {
    label: "Global",
    text: "text-cat-global",
    bg: "bg-cat-global-soft",
    border: "border-cat-global-line",
    dot: "bg-cat-global",
  },
};

type Filter = "semua" | string;

interface GeneralNewsFeedProps {
  isoDate: string;
}

export function GeneralNewsFeed({ isoDate }: GeneralNewsFeedProps) {
  const [filter, setFilter] = useState<Filter>("semua");
  const allStories = useMemo(() => getNewsStoriesByDate(isoDate), [isoDate]);
  const counts = useMemo(() => getStoryCountsByDate(isoDate), [isoDate]);

  // Fetch live topics to drive the tab menu. The hook returns `[]`
  // on error / empty response so the `displayTopics` fallback below
  // takes over and the user still sees the mock category list.
  const { data: liveTopics, isLoading: topicsLoading } = useTopics(10, 0, []);

  // Map a topic to its categoryConfig entry (for accent / dot color)
  // and to its mock count. The topic.slug values are expected to
  // match NewsCategory strings today ("ekonomi", "pemerintah", …) —
  // unknown slugs render with no accent.
  const displayTopics = liveTopics.length > 0
    ? liveTopics
    : (Object.keys(categoryConfig) as NewsCategory[]).map((cat) => ({
        id: cat,
        slug: cat,
        name: categoryConfig[cat].label,
      }));

  const filtered = useMemo(() => {
    if (filter === "semua") return allStories;
    // Topic slug doubles as the mock `category` for known topics,
    // so the existing per-category filter keeps working unchanged.
    return allStories.filter((s) => s.category === filter);
  }, [filter, allStories]);

  return (
    <section aria-label="Berita ekonomi, pemerintah, dan politik">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-border-strong pb-2">
        <div>
          <div className="mb-0.5 flex items-center gap-1.5">
            <Newspaper className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="label text-text-secondary">Macro & Politik</span>
            <span className="font-mono text-[10.5px] text-text-muted">
              · {allStories.length} story · diagregasi dari {allStories.reduce((acc, s) => acc + s.sources.length, 0)} sumber
            </span>
          </div>
          <h2 className="text-[15px] font-bold tracking-tight text-text-primary">
            Ekonomi, Pemerintah & Politik
          </h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-text-muted">
            Banyak media, satu cerita. Tiap story udah kami ringkas — gak perlu bolak-balik cek sumber.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filter kategori berita"
          className="-mx-4 flex items-center gap-1 overflow-x-auto scrollbar-hide px-4 sm:mx-0 sm:px-0"
        >
          <div className="inline-flex items-center gap-1 rounded-md border border-border bg-bg-secondary p-1">
            <FilterPill
              active={filter === "semua"}
              onClick={() => setFilter("semua")}
              label="Semua"
              count={allStories.length}
            />
            {topicsLoading ? (
              // Single shimmer bar sized to roughly match a tab row,
              // so the menu doesn't visually pop in when topics land.
              <Shimmer className="h-6 w-48" />
            ) : (
              displayTopics.map((topic) => {
                // topic.slug is expected to match a NewsCategory key
                // (ekonomi / pemerintah / politik / emiten / global);
                // unknown slugs render with no accent color.
                const cat = (categoryConfig as Record<
                  string,
                  (typeof categoryConfig)[NewsCategory]
                >)[topic.slug];
                const count = (counts as Record<string, number>)[topic.slug] ?? 0;
                return (
                  <FilterPill
                    key={topic.id}
                    active={filter === topic.slug}
                    onClick={() => setFilter(topic.slug)}
                    label={topic.name}
                    count={count}
                    accent={cat?.text}
                  />
                );
              })
            )}
          </div>
        </div>
      </header>

      <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-bg-secondary">
        {filtered.map((story) => (
          <StoryItem key={story.id} story={story} isoDate={isoDate} />
        ))}
      </ol>
    </section>
  );
}

type Story = ReturnType<typeof getNewsStoriesByDate>[number];

function StoryItem({ story, isoDate }: { story: Story; isoDate: string }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = categoryConfig[story.category];
  const latest = getLatestTime(story);

  return (
    <li>
      {/* ── Mobile: accordion header (always) + body (when expanded) ── */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="block w-full px-4 py-3 text-left transition-colors hover:bg-bg-tertiary/40"
        >
          <div className="mb-1.5 flex items-center gap-2">
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", cfg.dot)} aria-hidden />
            <span
              className={cn(
                "rounded border px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-widest",
                cfg.text, cfg.bg, cfg.border, "border",
              )}
            >
              {cfg.label}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9.5px] text-text-faint">
              {latest}
              {expanded ? (
                <ChevronUp className="h-3 w-3" aria-hidden />
              ) : (
                <ChevronDown className="h-3 w-3" aria-hidden />
              )}
            </span>
          </div>
          <h3 className="text-[13px] font-bold leading-snug text-text-primary">
            {story.title}
          </h3>
        </button>

        {expanded && (
          <div className="border-t border-border bg-bg-tertiary/30 px-4 py-3">
            <p className="mb-2 text-[12px] leading-[1.55] text-text-secondary">
              {story.summary}
            </p>
            {story.keyPoints.length > 0 && (
              <ul className="mb-2 flex flex-wrap gap-1">
                {story.keyPoints.map((kp) => (
                  <li
                    key={kp}
                    className="inline-flex items-center rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[10px] text-text-secondary"
                  >
                    {kp}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center justify-between border-t border-border pt-2">
              <p className="font-mono text-[10px] text-text-muted">
                {story.sources.length} sumber
              </p>
              <div className="flex items-center gap-1">
                <ShareButton
                  url={`https://rangkuman.news/?date=${isoDate}#${story.id}`}
                  title={story.title}
                  tone="dark"
                  surface="general_news_feed_row"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop: always-expanded stream row ── */}
      <div className="group hidden px-4 py-3 transition-colors hover:bg-bg-tertiary/40 sm:block">
        <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3">
          <div className="flex shrink-0 flex-col items-start gap-1">
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest",
                cfg.text, cfg.bg, cfg.border, "border",
              )}
            >
              {cfg.label}
            </span>
            <span className="font-mono text-[10px] text-text-faint">
              {latest}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="text-[13.5px] font-bold leading-snug text-text-primary group-hover:text-brand">
              {story.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-[12px] leading-[1.55] text-text-secondary">
              {story.summary}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {story.keyPoints.slice(0, 3).map((kp) => (
                <span
                  key={kp}
                  className="inline-flex items-center rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[10px] text-text-secondary"
                >
                  {kp}
                </span>
              ))}
            </div>
            <p className="mt-2 font-mono text-[10px] text-text-muted">
              {story.sources.map((s) => s.name).join(" · ")}
            </p>
          </div>
          <div className="flex items-start gap-1">
            <ShareButton
              url={`https://rangkuman.news/?date=${isoDate}#${story.id}`}
              title={story.title}
              tone="dark"
              surface="general_news_feed_header"
            />
          </div>
        </div>
      </div>
    </li>
  );
}

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  accent?: string;
}

function FilterPill({ active, onClick, label, count, accent }: FilterPillProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded px-2.5 py-1 text-[12px] font-medium transition-colors",
        active
          ? cn("bg-bg-tertiary text-text-primary", accent)
          : "text-text-muted hover:text-text-primary",
      )}
    >
      <span>{label}</span>
      <span className="font-mono text-[10px] text-text-faint">{count}</span>
    </button>
  );
}
