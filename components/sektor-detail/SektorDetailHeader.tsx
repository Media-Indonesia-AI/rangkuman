"use client";

import { Building2 } from "lucide-react";
import { SentimentBadge } from "@/components/SentimentBadge";
import { hueBg, hueBorder, hueText } from "@/components/sektor";
import type { SektorDisplay } from "@/lib/util/sectorMappers";
import { cn } from "@/lib/utils";

interface SektorDetailHeaderProps {
  /** The live-mapped sector to render. Provides name, hue,
   *  sentiment, avgChange, and totalStock — the description
   *  string is derived inline since the wire shape doesn't
   *  carry one (whereas the mock catalog did). */
  sektor: SektorDisplay;
}

/** Three-bucket sentiment label + text color matching the
 *  `SentimentBadge` convention used elsewhere. Inlined here
 *  rather than imported because the detail-header is the only
 *  consumer of the "label-only" mode (no badge needed, just
 *  raw text and color). */
const sentimentLabel: Record<"positif" | "netral" | "negatif", string> = {
  positif: "Positif",
  netral: "Netral",
  negatif: "Negatif",
};
const sentimentTextClass: Record<"positif" | "netral" | "negatif", string> = {
  positif: "text-bullish",
  netral: "text-mixed",
  negatif: "text-bearish",
};

/**
 * Header strip for the sector detail page — `/sektor/[slug]`.
 *
 * Renders the hue-tinted Building2 icon badge, the sentiment
 * chip, the sector name + description, and the two mini stats
 * (Rata-rata / Sentimen). Self-contained so `<SektorDetailPage />`
 * only has to drop a single tag into the layout.
 *
 * The description string is rebuilt inline (not from the wire)
 * because the live `/stocks/sectors` payload doesn't carry
 * per-sector prose — the mock catalog did. The wording mirrors
 * the original site copy closely so the SEO/UX intent is the same.
 */
export function SektorDetailHeader({ sektor }: SektorDetailHeaderProps) {
  const positive = sektor.avgChange >= 0;

  return (
    <header className="mb-5 overflow-hidden rounded-lg border border-border bg-bg-secondary">
      <div className="flex flex-wrap items-start gap-4 p-5">
        <span
          className={cn(
            "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border",
            hueBorder[sektor.hue],
            hueBg[sektor.hue],
            hueText[sektor.hue],
          )}
        >
          <Building2 className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="label">Sektor</span>
            <SentimentBadge sentiment={sektor.sentiment} size="sm" />
            <span className="font-mono text-[10.5px] text-text-muted">
              · {sektor.totalStock} emiten
            </span>
          </div>
          <h2 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[30px]">
            {sektor.name}
          </h2>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-[1.55] text-text-secondary">
            Sentimen, saham unggulan, dan rata-rata perubahan hari ini untuk
            sektor {sektor.name.toLowerCase()}.
          </p>
        </div>

        {/* Mini stats */}
        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:grid-cols-2">
          <div>
            <p className="label">Rata-rata</p>
            <p
              className={cn(
                "mt-0.5 font-mono text-[18px] font-bold leading-none num-tabular",
                positive ? "text-bullish" : "text-bearish",
              )}
            >
              {positive ? "+" : ""}
              {sektor.avgChange.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="label">Sentimen</p>
            <p
              className={cn(
                "mt-0.5 text-[16px] font-bold leading-none",
                sentimentTextClass[sektor.sentiment],
              )}
            >
              {sentimentLabel[sektor.sentiment]}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}