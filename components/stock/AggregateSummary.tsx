"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { formatTanggalIndonesia } from "@/lib/util/formatDate";
import { toSentimen } from "@/lib/util/sentiment";
import type { DailyRecap } from "@/lib/mock/recaps";
import { useHeadlineDetail } from "./HeadlineDetailProvider";
import { SourceBar } from "@/components/SourceBar";
import { LinkifiedText } from "@/components/LinkifiedText";

/** Sentiment → icon mapping. Lives here (rather than in the page) so
 *  the widget is self-contained — the page only passes the recap. */
const SentimenIcon = {
  positif: TrendingUp,
  netral: Minus,
  negatif: TrendingDown,
} as const;

/** Tailwind text color for the sentiment icon. */
function sentimenColor(s: DailyRecap["sentimen"]): string {
  if (s === "positif") return "text-bullish";
  if (s === "negatif") return "text-bearish";
  return "text-mixed";
}

/**
 * "Ringkasan AI" / aggregate-summary card for the stock detail page.
 *
 * Reads the deep-linked headline detail via `useHeadlineDetail()` so
 * the icon, color, date, summary text, and story count all track the
 * per-headline `?id=` payload whenever it's present, and fall back
 * to the aggregate `recap` otherwise.
 *
 * The media count and the "Disebut dalam" source list stay on the
 * recap's data: the headline-detail payload doesn't carry aggregate
 * media counts (it has `topics` instead of sources), and falling back
 * here keeps the section's "aggregate" framing intact.
 */
export function AggregateSummary({ recap }: { recap: DailyRecap }) {
  const { detail } = useHeadlineDetail();

  // Prefer the deep-linked headline's sentiment + date + summary +
  // story count; fall back to the recap when no `?id=` is set, the
  // fetch is in flight, or it failed. Single context read covers all
  // five slots so the header and body never disagree.
  const sentimen = detail ? toSentimen(detail.sentiment) : recap.sentimen;
  const tanggalLabel = detail
    ? formatTanggalIndonesia(detail.created_at)
    : formatTanggalIndonesia(recap.tanggal);
  const summaryText = detail?.summary ?? recap.ringkasan;
  // `detail.stories` is the array of related stories for THIS
  // headline (`HeadlineDetail.stories: EmbeddedStory[]`). When the
  // page is deep-linked, that count is more specific to the headline
  // than the recap's total-day article count.
  const jumlahBerita = detail ? detail.stories.length : recap.jumlahBerita;
  const Icon = SentimenIcon[sentimen];

  return (
    <section
      className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
      aria-label="Ringkasan agregat"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Icon
            className={`h-3.5 w-3.5 ${sentimenColor(sentimen)}`}
            aria-hidden
          />
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-text-primary">
            Ringkasan AI
          </span>
          <span className="font-mono text-[10.5px] text-text-muted num-tabular">
            · {tanggalLabel}
          </span>
        </div>
        <span className="font-mono text-[10.5px] font-semibold text-text-muted num-tabular">
          {jumlahBerita} artikel 
          {/* · {recap.sumber.length} media */}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-[15px] leading-[1.65] text-text-primary">
          <LinkifiedText text={summaryText} />
        </p>

        {/* <div className="mt-5 border-t border-border pt-4">
          <p className="label mb-2.5">Disebut dalam</p>
          <SourceBar sumber={recap.sumber} />
        </div> */}
      </div>
    </section>
  );
}