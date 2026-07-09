"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { formatTanggalIndonesia } from "@/lib/util/formatDate";
import { sourceHomepage } from "@/lib/util/formatMedia";
import { toSentimen } from "@/lib/util/sentiment";
import type { DailyRecap, Sumber } from "@/lib/mock/recaps";
import { useHeadlineDetail } from "./HeadlineDetailProvider";
import { useListStory } from "@/lib/hooks/useListStory";
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
 * Reads the deep-linked headline detail via `useHeadlineDetail()` so
 * the icon, color, date, summary text, and story count all track the
 * per-headline `?id=` payload whenever it's present, and fall back
 * to the aggregate `recap` otherwise.
 *
 * The "Disebut dalam" source list comes from the headline-scoped
 * stories via `useListStory` — each story's `articles[]` is grouped by
 * `source_name` to derive per-media counts. While the fetch is in
 * flight, while no `?id=` is set, or after a failed call, we fall
 * back to `recap.sumber` so the section never goes blank.
 */
export function AggregateSummary({ recap }: { recap: DailyRecap }) {
  const { detail } = useHeadlineDetail();

  // Same gating pattern as NewsTimeline / ArticlesByMediaWidget: only
  // fetch when a headline id is present (no `?id=` → no useful filter).
  // Disabling the hook also clears stale results, so the source bar
  // doesn't briefly show the previous deep-link's medias.
  const { data: stories } = useListStory(
    10,
    0,
    detail ? [{ field: "headline_id", operator: "eq", value: detail.id }] : [],
    detail !== null,
  );

  // Flatten stories.articles and group by source_name → Sumber shape.
  // `logo` is left empty: the live payload ships `source_name` only,
  // and SourceBar derives its avatar from `initialsOf(media)`.
  // `url` is the publisher's homepage (article URL reduced to its
  // origin) so SourceBar can render the chip as a link to that
  // publisher rather than the specific article the recap cited.
  const sumberFromStories = useMemo<Sumber[]>(() => {
    const acc = new Map<string, { count: number; url?: string }>();
    for (const story of stories) {
      for (const article of story.articles ?? []) {
        const existing = acc.get(article.source_name);
        if (existing) {
          existing.count += 1;
        } else {
          acc.set(article.source_name, {
            count: 1,
            url: sourceHomepage(article.source_url),
          });
        }
      }
    }
    return Array.from(acc, ([media, { count, url }]) => ({
      media,
      logo: "",
      jumlah: count,
      url,
    }));
  }, [stories]);

  // Prefer the live, headline-scoped media; fall back to recap so
  // the section never renders an empty source bar during loading,
  // without a `?id=`, or after a fetch error.
  const sumber =
    detail !== null && sumberFromStories.length > 0
      ? sumberFromStories
      : recap.sumber;

  // Prefer the deep-linked headline's sentiment + date + summary +
  // story count; fall back to the recap when no `?id=` is set, the
  // fetch is in flight, or it failed. Single context read covers all
  // five slots so the header and body never disagree.
  const sentimen = detail ? toSentimen(detail.sentiment) : recap.sentimen;
  const tanggalLabel = detail
    ? formatTanggalIndonesia(detail.created_at)
    : formatTanggalIndonesia(recap.tanggal);
  const summaryText = stripSumberSuffix(detail?.summary ?? recap.ringkasan);
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

        <div className="mt-5 border-t border-border pt-4">
          <p className="label mb-2.5">Disebut dalam</p>
          <SourceBar sumber={sumber} />
        </div>
      </div>
    </section>
  );
}