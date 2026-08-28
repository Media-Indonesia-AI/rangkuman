"use client";

import { ArrowUpRight, Newspaper } from "lucide-react";
import { initialsOf } from "@/lib/util/formatMedia";
import { Shimmer } from "@/components/Shimmer";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import type { EmbeddedStory, StoryArticle } from "@/lib/api";

interface SorotanDetailSourcesProps {
  /** Stories fetched via `useListStory(headline_id)`. The widget
   *  flattens each story's `articles[]` and groups by
   *  `source_name` to build the media-grouped view. The same
   *  data also feeds the timeline section, so we don't issue a
   *  second fetch here. */
  stories: EmbeddedStory[];
  /** Loading flag from the parent fetch — drives the shimmer. */
  isLoading?: boolean;
}

interface MediaGroup {
  media: string;
  items: StoryArticle[];
}

// `source_url` may arrive as either a hostname (`market.bisnis.com`)
// or a full canonical URL. Anchor `href` needs a scheme, so we normalize.
function articleHref(sourceUrl: string): string {
  return /^https?:\/\//i.test(sourceUrl) ? sourceUrl : `https://${sourceUrl}`;
}

/** Flatten `stories → articles` and bucket them by `source_name`,
 *  preserving first-seen order so the most-cited media lands on
 *  top of the list. */
function groupArticlesByMedia(stories: EmbeddedStory[]): MediaGroup[] {
  const groups = new Map<string, StoryArticle[]>();
  for (const story of stories) {
    for (const article of story.articles ?? []) {
      const bucket = groups.get(article.source_name);
      if (bucket) bucket.push(article);
      else groups.set(article.source_name, [article]);
    }
  }
  return Array.from(groups, ([media, items]) => ({ media, items }));
}

const SHIMMER_GROUP_COUNT = 3;
const SHIMMER_ARTICLES_PER_GROUP = 2;

/** Skeleton shown while stories are in flight. Mirrors the real
 *  group + article-row structure so the layout doesn't shift. */
function SorotanDetailSourcesShimmer() {
  return (
    <div className="space-y-3">
      {Array.from({ length: SHIMMER_GROUP_COUNT }).map((_, i) => (
        <div
          key={`skel-${i}`}
          className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
        >
          <header className="flex items-center gap-3 border-b border-border bg-bg-tertiary px-3 py-2">
            <Shimmer className="h-6 w-6 rounded" />
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-2.5 w-6" />
          </header>
          <ul className="divide-y divide-border">
            {Array.from({ length: SHIMMER_ARTICLES_PER_GROUP }).map((_, j) => (
              <li key={`skel-${i}-${j}`} className="px-4 py-3">
                <Shimmer className="h-3.5 w-full" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * "Daftar sumber" — articles grouped by media for the sorotan detail
 * page. Mirrors the structure of `ArticlesByMediaWidget` on the
 * stock side:
 *
 *   - One card per media (publisher) with the media's initials
 *     avatar, name, and article count.
 *   - Each article row is a clickable link that opens the
 *     publisher's URL in a new tab (`target="_blank"` +
 *     `rel="noopener noreferrer"`).
 *   - Shimmer shown while the parent fetch is in flight.
 *   - Empty state with the same icon + copy as the stock widget
 *     so the two surfaces feel like one design.
 *
 * Data is grouped from the `stories: EmbeddedStory[]` prop the
 * orchestrator already has on its hands (it feeds the timeline
 * section as well), so no extra fetch is issued here.
 */
export function SorotanDetailSources({
  stories,
  isLoading = false,
}: SorotanDetailSourcesProps) {
  const user = useCurrentUser();
  if (!user) return null;

  const grouped = groupArticlesByMedia(stories);

  return (
    <section aria-label="Daftar sumber" className="mt-8">
      <header className="mb-4 flex items-end justify-between border-b border-border-strong pb-2">
        <div>
          <h2 className="label text-text-secondary">Sumber</h2>
          <h3 className="text-[15px] font-bold tracking-tight text-text-primary sm:text-[16px]">
            {grouped.length} media meliput cerita ini
          </h3>
        </div>
      </header>

      {isLoading ? (
        <SorotanDetailSourcesShimmer />
      ) : grouped.length > 0 ? (
        <div className="space-y-3">
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
                      {a.excerpt && (
                        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-text-muted">
                          {a.excerpt}
                        </p>
                      )}
                    </a>
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
            Headline ini belum punya artikel dari media. Coba cek
            headline lain atau kembali ke beranda.
          </p>
        </div>
      )}
    </section>
  );
}
