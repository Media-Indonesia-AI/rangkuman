import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Shimmer } from "@/components/Shimmer";
import { cn } from "@/lib/utils";
import type { EmbeddedStory } from "@/lib/api";
import { sentimentMeta } from "./shared";

interface StorySidebarProps {
  /** Stories to show in the "Story Lainnya" card — typically
   *  `stories.slice(1, 6)` so we don't duplicate the featured one
   *  and cap at 5 to keep the card height bounded. */
  otherStories: EmbeddedStory[];
  isLoading: boolean;
  /** The headline id this page is scoped to — surfaced in the
   *  "Tentang Story" card so the live data is visible at a glance. */
  headlineId: string;
  /** Total fetched count, surfaced alongside `headlineId`. */
  totalCount: number;
}

/** Right-rail sidebar — "Story Lainnya" (other stories from the
 *  same headline) on top, "Tentang Story" (static blurb + live
 *  data summary) below. Both cards stay mounted across states; the
 *  contents swap between skeleton / list / empty. */
export function Sidebar({
  otherStories,
  isLoading,
  headlineId,
  totalCount,
}: StorySidebarProps) {
  return (
    <aside className="space-y-4">
      {/* Story Lainnya */}
      <div className="rounded-lg border border-border-strong bg-bg-secondary/40 p-4">
        <h3 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          Story Lainnya
        </h3>
        {isLoading ? (
          <OtherStoriesSkeleton />
        ) : otherStories.length > 0 ? (
          <ul className="space-y-2.5">
            {otherStories.map((s) => {
              const m = sentimentMeta[s.primary_sentiment];
              return (
                <li key={s.id}>
                  <div className="group flex items-start gap-2">
                    <span
                      className={cn(
                        "shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
                        m.color,
                      )}
                    >
                      {m.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-medium leading-snug text-text-primary transition-colors group-hover:text-brand">
                        {s.headline}
                      </span>
                      <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[9.5px] text-text-faint">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            m.dot,
                          )}
                          aria-hidden
                        />
                        <time dateTime={s.recap_date}>{s.recap_date}</time>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[11.5px] text-text-muted">
            Belum ada story lain.
          </p>
        )}
        <Link
          href="/saham"
          className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-brand transition-colors hover:text-text-primary"
        >
          Kembali ke /saham/
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>

      {/* Tentang Story */}
      <div className="rounded-lg border border-border bg-bg-tertiary/50 p-4 text-[11.5px] leading-relaxed text-text-muted">
        <p className="font-semibold text-text-secondary">Tentang Story</p>
        <p className="mt-1.5">
          Story adalah narasi perkembangan emiten dalam jangka panjang
          (mingguan/bulanan). Beda dengan /sorotan/[id]/ yang merupakan
          berita individual. Update tiap minggu dari tim redaksi.
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-[10px]">
          <dt className="text-text-faint">Headline ID</dt>
          <dd className="truncate text-text-secondary">{headlineId}</dd>
          <dt className="text-text-faint">Story diambil</dt>
          <dd className="text-text-secondary">{totalCount}</dd>
        </dl>
      </div>
    </aside>
  );
}

function OtherStoriesSkeleton() {
  return (
    <ul className="space-y-2.5">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex items-start gap-2">
          <Shimmer className="h-4 w-10 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Shimmer className="h-3 w-3/4" />
            <Shimmer className="h-2.5 w-1/2" />
          </div>
        </li>
      ))}
    </ul>
  );
}
