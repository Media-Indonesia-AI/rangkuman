"use client";

import { Newspaper } from "lucide-react";
import { initialsOf } from "@/lib/util/formatMedia";
import type { TickerArticles } from "@/lib/api/types/stocks";

interface ArticlesByMediaWidgetProps {
  articles: TickerArticles[];
  className?: string;
}

/** "Diliput media" — ticker articles grouped by publisher. */
export function ArticlesByMediaWidget({
  articles,
  className,
}: ArticlesByMediaWidgetProps) {
  const groups = new Map<string, TickerArticles[]>();
  for (const article of articles) {
    const bucket = groups.get(article.source_name);
    if (bucket) bucket.push(article);
    else groups.set(article.source_name, [article]);
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
                {items.map((article) => (
                  <li key={article.id} className="px-4 py-3">
                    <h4 className="text-[14px] font-semibold leading-snug text-text-primary">
                      {article.title}
                    </h4>
                    {article.content && (
                      <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-text-muted">
                        {article.content}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 px-3.5 py-10 text-center">
          <Newspaper className="h-5 w-5 text-text-faint" aria-hidden />
          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-text-muted">
            Belum ada liputan media
          </p>
          <p className="max-w-xs text-[11.5px] leading-relaxed text-text-faint">
            Belum ada artikel dari media untuk saham ini.
          </p>
        </div>
      )}
    </section>
  );
}
