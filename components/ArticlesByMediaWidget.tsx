"use client";

import { ArrowUpRight } from "lucide-react";
import { useHeadlineDetail } from "./HeadlineDetailProvider";
import { useListStory } from "@/lib/hooks/useListStory";
import { initialsOf } from "@/lib/util/formatMedia";
import { cn } from "@/lib/utils";
import type { StoryArticle } from "@/lib/api";

interface ArticlesByMediaWidgetProps {
  className?: string;
}

/** `source_url` may arrive as either a hostname (`market.bisnis.com`)
 *  or a full canonical URL — the wire comment in `types/story.ts`
 *  documents both. Anchor `href` needs a scheme, so we normalize. */
function articleHref(sourceUrl: string): string {
  return /^https?:\/\//i.test(sourceUrl) ? sourceUrl : `https://${sourceUrl}`;
}

/** "Diliput media" — the deep-linked headline's articles grouped by
 *  publisher. Data path:
 *  `useHeadlineDetail()` → `detail.id`
 *  → `useListStory(10, 0, [{ field: "headline_id", operator: "eq",
 *  value: detail.id }], detail !== null)` → stories
 *  → flatten each story's `articles[]` and group by `source_name`.
 *
 *  The `enabled: detail !== null` gate prevents the no-filter request
 *  the hook would otherwise issue on first render (when `detail` is
 *  still null in the provider).
 *
 *  Renders a single `-` placeholder when there are no articles —
 *  matches the per-day placeholder style in `<NewsTimeline>` for
 *  visual consistency. */
export function ArticlesByMediaWidget({ className }: ArticlesByMediaWidgetProps) {
  const { detail } = useHeadlineDetail();
  const { data: stories } = useListStory(
    10,
    0,
    detail ? [{ field: "headline_id", operator: "eq", value: detail.id }] : [],
    detail !== null,
  );

  // Flatten stories → articles, group by source_name.
  const groups = new Map<string, StoryArticle[]>();
  for (const story of stories) {
    for (const article of story.articles ?? []) {
      const bucket = groups.get(article.source_name);
      if (bucket) bucket.push(article);
      else groups.set(article.source_name, [article]);
    }
  }
  const grouped = Array.from(groups.entries()).map(([media, items]) => ({
    media,
    items,
  }));

  return (
    <section className={className} aria-label="Berita per media">
      <header className="mb-4 flex items-end justify-between border-b border-border-strong pb-2">
        <h2 className="text-[18px] font-bold tracking-tight text-text-primary">
          Diliput media
        </h2>
        <span className="font-mono text-[10.5px] font-semibold text-text-muted num-tabular">
          {grouped.length} media
        </span>
      </header>

      {grouped.length > 0 ? (
        <div className="space-y-5">
          {grouped.map(({ media, items }) => (
            <div
              key={media}
              className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
            >
              <header className="flex items-center gap-3 border-b border-border bg-bg-tertiary px-3 py-2">
                <span
                  aria-hidden
                  className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-bg-card font-mono text-[9.5px] font-semibold uppercase text-text-secondary"
                >
                  {initialsOf(media)}
                </span>
                <h3 className="text-[13px] font-semibold text-text-primary">
                  {media}
                </h3>
                <span className="font-mono text-[10.5px] font-semibold text-brand num-tabular">
                  ×{items.length}
                </span>
              </header>
              <ul className="divide-y divide-border">
                {items.map((a) => (
                  <li key={`${a.title}::${a.source_url}`}>
                    <a
                      href={articleHref(a.source_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block px-4 py-3 transition-colors hover:bg-bg-tertiary"
                    >
                      <h4 className="text-[14px] font-semibold leading-snug text-text-primary group-hover:text-brand">
                        {a.title}
                        <ArrowUpRight
                          className="ml-1 inline-block h-3 w-3 text-text-muted opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden
                        />
                      </h4>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 rounded-md border border-dashed border-border bg-bg-tertiary/20 px-4 py-3">
          <span className="font-mono text-[11.5px] text-text-faint">-</span>
        </div>
      )}
    </section>
  );
}