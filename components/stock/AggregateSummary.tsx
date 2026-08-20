"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { DatePicker } from "@/components/DatePicker";
import { Shimmer } from "@/components/Shimmer";
import { todayIsoDate } from "@/lib/util/formatDate";
import type { DailyRecap, Sumber } from "@/lib/mock/recaps";
import type { TickerArticles } from "@/lib/api/types/stocks";
import { EmptyState } from "@/components/EmptyState";
import { LinkifiedText } from "@/components/LinkifiedText";
import { ShareButton } from "@/components/ShareButton";
import { SourceBar } from "@/components/SourceBar";
import { SITE_URL } from "@/lib/og";

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

/** Strip trailing attributions from an AI summary.
 *  1) A "Sumber: …" sentence (the API's source list). This widget
 *     already renders the same media list below via `<SourceBar>`,
 *     so keeping it in the prose would duplicate the info and read
 *     as a redundant citation at the end of every recap.
 *  2) One or more URLs at the very end, separated by whitespace
 *     and/or commas (e.g. "https://x.com https://y.com" or
 *     "https://x.com, https://y.com, https://z.com."), optionally
 *     followed by a trailing period. The model occasionally tacks
 *     on one or several citation links; the `<SourceBar>` already
 *     shows the publishers, so the raw URLs add nothing for the
 *     reader. The two passes are ordered so any URL inside a
 *     "Sumber:" line is dropped by step 1, and any URLs that
 *     survive (e.g. "lihat https://…") are dropped by step 2. */
function stripSumberSuffix(text: string): string {
  return text
    .replace(/\s*Sumber:\s+[\s\S]*$/, "")
    .replace(/\s*(?:https?:\/\/\S+[\s,]*)+[\s.]*$/, "")
    .trimEnd();
}

/**
 * "Ringkasan AI" / aggregate-summary card for the stock detail page.
 *
 * Uses the ticker-information description and articles supplied by the
 * parent page. Articles are grouped by source to build the media bar.
 */
export function AggregateSummary({
  kode,
  description,
  articles,
  recapDate,
  isLoading = false,
}: {
  kode: string;
  description?: string | null;
  articles: TickerArticles[];
  /** Calendar day the recap is for (`YYYY-MM-DD`). When set, the
   *  card header shows "Ringkasan AI · Kamis, 30 Juli 2026" for
   *  that specific day instead of today. Sourced from the
   *  `/stock/[kode]/[recapDate]` URL segment; absent on
   *  `/stock/[kode]` (no date) — in that case the card stays
   *  on today's date. */
  recapDate?: string;
  /** When `true`, the body renders `<Shimmer />` placeholders
   *  (paragraph lines for the AI summary + a row of pill blocks
   *  for the source bar) instead of the real `<LinkifiedText>`
   *  / `<SourceBar>`. The header (chip, sentiment icon, date
   *  picker) and the section chrome stay mounted — only the
   *  content slots swap, so the page layout doesn't reflow when
   *  the response lands. Falls through to the normal
   *  EmptyState / populated branch when `false`. */
  isLoading?: boolean;
}) {
  const sumber = useMemo<Sumber[]>(() => {
    const acc = new Map<string, { count: number }>();
    for (const article of articles) {
      const existing = acc.get(article.source_name);
      if (existing) existing.count += 1;
      else acc.set(article.source_name, { count: 1 });
    }
    return Array.from(acc, ([media, { count }]) => ({
      media,
      logo: "",
      jumlah: count,
    }));
  }, [articles]);

  const sentimen = "netral" as const;
  // The card header now hosts a date picker (was a static label).
  // When the URL pins a recap day (`/stock/{kode}/{recapDate}`), the
  // picker reflects that day; on the bare `/stock/{kode}` route we
  // fall through to today. Picking a new date navigates to the same
  // `/stock/{kode}/{iso}` URL via `DatePicker`'s `hrefFor` builder,
  // so `StockDetailPage` re-renders with the new `params.recapDate`,
  // the `useTickerInformation` hook refetches, and the new summary
  // lands in `tickerInfo`. Navigation is fully declarative — Next.js
  // `<Link>` prefetches the destination so the recap day loads
  // instantly and we don't need a `useRouter` hook here at all.
  const isoDate = recapDate ?? todayIsoDate();
  const summaryText = stripSumberSuffix(description ?? "");
  const jumlahBerita = articles.length;
  const Icon = SentimenIcon[sentimen];

  return (
    <section
      aria-busy={isLoading || undefined}
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
          <DatePicker
            value={isoDate}
            hrefFor={(iso) => `/stock/${kode}/${iso}`}
            todayIso={todayIsoDate()}
            maxLookbackDays={30}
          />
        </div>
        {isLoading ? (
          // `!bg-bg-tertiary/60` overrides the `<Shimmer />`
          // default (`bg-bg-tertiary`). On this card's light
          // `bg-bg-secondary` body, the full-strength token
          // read as a near-black blob that competed with the
          // header bar — too heavy for a placeholder. 60%
          // opacity keeps the same warm-gray tone but lifts it
          // toward the section background so the shimmer
          // registers as a subtle "waiting" block rather than
          // a heavy divider. The `!` prefix is Tailwind v3's
          // important modifier; it forces the override
          // regardless of class-name order.
          <Shimmer className="!bg-bg-tertiary/60 h-3 w-28" />
        ) : (
          <div className="flex items-center gap-2">
            {/* Share button — sits at the right edge of the
                header row so visitors can share the recap
                directly from the card they're reading. URL is
                the bare `/stock/{kode}` (not the recapDate
                variant) so receivers land on the freshest
                recap. Title is just the ticker code — this
                widget doesn't have company-name data, and the
                ticker is the most identifiable token of the
                recap anyway. */}
            <ShareButton
              title={kode}
              url={`${SITE_URL}/stock/${kode}/${isoDate}`}
            />
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        {/* Three-state body. Loading wins over the EmptyState
            check so a fetch in flight on a "blank" day still
            shows the user something's happening (rather than
            flashing the empty message before swapping to the
            prose). The header (icon, label, date picker) stays
            visible across all three states so the user can
            still navigate to a different recap day during the
            loading window — the picker is the only path to a
            non-empty recap on a "blank day". */}
        {isLoading ? (
          <div className="space-y-4">
            {/* Summary prose — three lines that taper in width
                so the block reads as a paragraph (rather than a
                rectangular bar) when the real text lands. The
                h-3.5 height matches the body's text-[15px]
                line-height (~24px) so the placeholder and the
                populated paragraph occupy roughly the same
                vertical space, avoiding a visible jump when
                data lands. */}
            <div className="space-y-2">
              <Shimmer className="!bg-bg-tertiary/60 h-3.5 w-full" />
              <Shimmer className="!bg-bg-tertiary/60 h-3.5 w-11/12" />
              <Shimmer className="!bg-bg-tertiary/60 h-3.5 w-10/12" />
            </div>
            {/* Source bar — label + a few pill placeholders
                sized to match the real `<SourceBar />` chips.
                Three pills is a reasonable middle ground: the
                ticker typically has 2–5 media sources so the
                shimmer hints at the layout without committing
                to a count. */}
            <div className="border-t border-border pt-4">
              <Shimmer className="!bg-bg-tertiary/60 mb-2.5 h-3 w-24" />
              <div className="flex flex-wrap gap-2">
                <Shimmer className="!bg-bg-tertiary/60 h-6 w-20" />
                <Shimmer className="!bg-bg-tertiary/60 h-6 w-16" />
                <Shimmer className="!bg-bg-tertiary/60 h-6 w-24" />
              </div>
            </div>
          </div>
        ) : summaryText.trim() === "" ? (
          <EmptyState
            title="Belum ada ringkasan"
            description={`Ringkasan AI belum tersedia untuk ${kode}.`}
            suggestion="Coba cek headline lain atau kembali ke beranda."
          />
        ) : (
          <>
            <p className="text-[15px] leading-[1.65] text-text-primary">
              <LinkifiedText text={summaryText} />
            </p>

            <div className="mt-5 border-t border-border pt-4">
              <p className="label mb-2.5">Disebut dalam</p>
              <SourceBar sumber={sumber} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}