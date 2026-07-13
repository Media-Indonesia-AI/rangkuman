import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { SentimentBadge } from "./SentimentBadge";
import { SourceBar } from "./SourceBar";
import { ShareButton } from "./ShareButton";
import { SavedButton } from "./SavedButton";
import { cn } from "@/lib/utils";
import type { DailyRecap } from "@/lib/mock/recaps";
import { getStockByKode, type Saham } from "@/lib/mock/stocks";
import { formatTanggalIndonesia, formatTanggalSingkat } from "@/lib/util/formatDate";
import { pickHeroGradient } from "@/lib/util/heroGradient";

interface StockCardProps {
  recap: DailyRecap;
  stock?: Saham;
  variant?: "feed" | "featured" | "compact" | "list";
  className?: string;
  rank?: number;
  /** Optional backend headline id. When set, the navigation href
   *  becomes `/stock/{kode}?id={id}` so the detail page can call
   *  `api.getHeadlineById(id)` on mount. */
  id?: string;
}

export function StockCard({
  recap,
  stock,
  variant = "feed",
  className,
  rank,
  id,
}: StockCardProps) {
  // const s = stock ?? getStockByKode(recap.sahamKode);
  // Build href once. With an `id`, append it as a query param so the
  // stock detail page can deep-link to a specific headline; without,
  // the href is identical to the pre-existing behavior.
  const params = id ? new URLSearchParams({ id }).toString() : "";
  const href = `/stock/${recap.sahamKode}${params ? `?${params}` : ""}`;
  const heroGradient = pickHeroGradient(recap.sahamKode);
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div
        className={cn(
          "group relative flex items-center gap-2 border-b border-border px-3 py-2 transition-colors hover:bg-bg-tertiary",
          className,
        )}
      >
        {/* Static content sits at z-auto; the stretched link at the
            end visually overlays it so a click anywhere on the row
            navigates to the detail page. */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="font-mono text-[12px] font-semibold text-text-primary group-hover:text-brand">
            {recap.sahamKode}
          </span>
          <SentimentBadge sentiment={recap.sentimen} size="sm" />
          <span className="num-tabular text-[11px] text-text-muted">
            {recap.jumlahBerita}
          </span>
        </div>
        {/* Save button must stay reachable — z-10 lifts it above the
            stretched link. Its own onClick calls preventDefault +
            stopPropagation, so the link's navigation is cancelled
            when the button is clicked. */}
        <div className="relative z-10">
          <SavedButton id={recap.sahamKode} kind="stock" publishedAt={recap.tanggal} tone="dark" />
        </div>
        {/* Stretched link — covers the entire row. `aria-label` is
            the ticker so screen readers announce the link target
            even though the element has no visible text. */}
        <Link
          href={href}
          aria-label={`${recap.sahamKode}`}
          className="absolute inset-0 z-0"
        />
      </div>
    );
  }

  if (isFeatured) {
    return (
      <article
        className={cn(
          "group relative flex overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all duration-200",
          "hover:border-border-strong hover:shadow-card-hover",
          className,
        )}
      >
        {/* Left side: ticker + gradient backdrop. Was a <Link>
            before; converted to a <div> so the single stretched
            <Link> at the end of the card is the only anchor —
            avoids duplicate links pointing at the same URL. */}
        <div
          className={cn(
            "relative block w-[120px] shrink-0 overflow-hidden sm:w-[160px]",
          )}
          aria-hidden
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br", heroGradient)} aria-hidden />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
            aria-hidden
          />

          <div className="relative flex h-full min-h-[160px] flex-col justify-between p-3 sm:p-4">
            {rank !== undefined && (
              <span className="font-mono text-[10px] font-semibold tracking-widest text-text-primary/80 num-tabular">
                #{String(rank).padStart(2, "0")}
              </span>
            )}

            <div>
              <h2 className="font-mono text-[32px] font-bold leading-[0.9] tracking-tighter text-text-primary sm:text-[40px]">
                {recap.sahamKode}
              </h2>
            </div>
          </div>
        </div>

        {/* Right side: body */}
        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden />
                {formatTanggalIndonesia(recap.tanggal)}
              </span>
              <span aria-hidden>·</span>
              <span className="font-mono font-semibold num-tabular text-text-secondary">
                {recap.jumlahBerita} artikel
              </span>
              <span aria-hidden>·</span>
              <span className="font-mono num-tabular text-text-secondary">
                {recap.sumber.length} media
              </span>
              <span aria-hidden>·</span>
              <SentimentBadge sentiment={recap.sentimen} size="sm" />
            </div>
            {/* Save/Share buttons sit at z-10 so they stay clickable
                above the stretched link. Their onClick handlers
                cancel the link's default navigation. */}
            <div className="relative z-10 flex shrink-0 items-center gap-1">
              <SavedButton id={recap.sahamKode} kind="stock" publishedAt={recap.tanggal} tone="dark" />
              <ShareButton
                url={`https://rangkuman.news${href}`}
                title={`${recap.sahamKode} — Rangkuman`}
                tone="dark"
              />
            </div>
          </div>

          <p className="line-clamp-3 text-[13px] leading-[1.55] text-text-primary">
            {recap.ringkasan}
          </p>

          <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-2.5">
            {/* SourceBar is wrapped at z-10 so the per-media external
                links remain clickable (they open in a new tab). The
                "Lihat recap" CTA is also wrapped at z-10 above the
                stretched link so the explicit button stays reachable
                — clicking it OR anywhere else on the card navigates
                to the same detail page. */}
            <div className="relative z-10">
              <SourceBar sumber={recap.sumber} max={3} size="sm" />
            </div>
            <Link
              href={href}
              className="relative z-10 inline-flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-brand transition-colors hover:text-brand-hover"
            >
              Lihat recap
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Stretched link — the entire card is one click target. */}
        <Link
          href={href}
          aria-label={`${recap.sahamKode}`}
          className="absolute inset-0 z-0"
        />
      </article>
    );
  }

  if (variant === "list") {
    return (
      <article
        className={cn(
          "group relative flex overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all duration-200",
          "hover:border-border-strong hover:shadow-card-hover",
          className,
        )}
      >
        {/* Left side: ticker + gradient backdrop + name + sentiment —
            DESKTOP ONLY. Was a <Link> before; converted to a <div>
            so the stretched link at the end is the single anchor. */}
        <div
          className="relative hidden w-[150px] shrink-0 overflow-hidden sm:block"
          aria-hidden
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br", heroGradient)} aria-hidden />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
            aria-hidden
          />

          <div className="relative flex h-full min-h-[140px] flex-col justify-between p-3.5">
            {rank !== undefined && (
              <span className="font-mono text-[10px] font-semibold tracking-widest text-text-primary/80 num-tabular">
                #{String(rank).padStart(2, "0")}
              </span>
            )}

            <div>
              <h2 className="font-mono text-[28px] font-bold leading-[0.9] tracking-tighter text-text-primary">
                {recap.sahamKode}
              </h2>
            </div>
          </div>
        </div>

        {/* Right side: body */}
        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          {/* ── Mobile-only compact header (rank + ticker + name + sentiment) ── */}
          <div className="mb-1.5 flex items-center justify-between gap-2 sm:hidden">
            {/* The mobile ticker header was a <Link> — converted to a
                <div> with `group/link`/hover color on the ticker so
                the visual feedback still works through the parent
                `group` on the article. */}
            <div className="group/link flex min-w-0 flex-1 items-baseline gap-2">
              {rank !== undefined && (
                <span className="font-mono text-[10px] font-semibold text-text-faint num-tabular">
                  #{String(rank).padStart(2, "0")}
                </span>
              )}
              <h2 className="font-mono text-[18px] font-bold leading-none tracking-tighter text-text-primary group/link:text-brand">
                {recap.sahamKode}
              </h2>
            </div>
            <div className="relative z-10">
              <SentimentBadge sentiment={recap.sentimen} size="sm" />
            </div>
          </div>

          {/* Desktop meta line + actions */}
          <div className="mb-2 hidden items-start justify-between gap-2 sm:flex">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[10.5px] text-text-muted">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" aria-hidden />
                <span>{formatTanggalSingkat(recap.tanggal)}</span>
              </span>
              <span aria-hidden>·</span>
              <span className="num-tabular text-text-secondary">
                {recap.jumlahBerita} artikel
              </span>
              <span aria-hidden>·</span>
              <span className="num-tabular text-text-secondary">
                {recap.sumber.length} media
              </span>
            </div>
            <div className="relative z-10 flex shrink-0 items-center gap-1">
              <SentimentBadge sentiment={recap.sentimen} size="sm" />
              <SavedButton
                id={recap.sahamKode}
                kind="stock"
                publishedAt={recap.tanggal}
                tone="dark"
              />
              <ShareButton
                url={`https://rangkuman.news${href}`}
                title={`${recap.sahamKode} — Rangkuman`}
                tone="dark"
              />
            </div>
          </div>

          {/* Summary */}
          <p className="line-clamp-3 text-[12.5px] leading-snug text-text-secondary sm:line-clamp-3 sm:text-[13px] sm:leading-[1.55] sm:text-text-primary">
            {recap.ringkasan}
          </p>

          {/* Mobile-only footer: date · articles + actions */}
          <div className="mt-1.5 flex items-center justify-between gap-2 sm:hidden">
            <p className="inline-flex items-center gap-1.5 font-mono text-[10.5px] text-text-muted">
              <Clock className="h-2.5 w-2.5" aria-hidden />
              <span>{formatTanggalSingkat(recap.tanggal)}</span>
              <span aria-hidden>·</span>
              <span className="num-tabular text-text-secondary">
                {recap.jumlahBerita} artikel
              </span>
            </p>
            <div className="relative z-10 flex shrink-0 items-center gap-1">
              <SavedButton
                id={recap.sahamKode}
                kind="stock"
                publishedAt={recap.tanggal}
                tone="dark"
              />
              <ShareButton
                url={`https://rangkuman.news${href}`}
                title={`${recap.sahamKode} — Rangkuman`}
                tone="dark"
              />
            </div>
          </div>

          {/* Desktop footer: sources + explicit "Lihat recap" CTA.
              Both wrappers sit at z-10 so they stay clickable above
              the stretched card link — same URL, but the explicit
              button gives a clear visual affordance. */}
          <div className="mt-auto hidden items-end justify-between gap-2 border-t border-border pt-2.5 sm:flex">
            <div className="relative z-10">
              <SourceBar sumber={recap.sumber} max={3} size="sm" />
            </div>
            <Link
              href={href}
              className="relative z-10 inline-flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-brand transition-colors hover:text-brand-hover"
            >
              Lihat recap
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Stretched link — the entire card is one click target. */}
        <Link
          href={href}
          aria-label={`${recap.sahamKode}`}
          className="absolute inset-0 z-0"
        />
      </article>
    );
  }

  // FEED variant — compact, dense, like cryptoslate's news rows
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all duration-200",
        "hover:border-border-strong hover:shadow-card-hover",
        className,
      )}
    >
      {/* Top accent bar — 2px, sector hue */}
      <div
        className={cn("h-0.5 w-full bg-gradient-to-r", heroGradient)}
        aria-hidden
      />

      <div className="flex flex-1 flex-col p-3.5">
        {/* Header row: ticker on left, save/share on right. The ticker
            was a <Link> — converted to a <div> with `group/link`
            hover on the ticker so the brand color still flips on
            card hover. The stretched link at the end of the article
            is the single anchor. */}
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <div className="group/link flex min-w-0 flex-1 items-baseline gap-2">
            {rank !== undefined && (
              <span className="font-mono text-[10px] font-semibold text-text-faint num-tabular">
                #{String(rank).padStart(2, "0")}
              </span>
            )}
            <h3 className="font-mono text-[22px] font-bold leading-none tracking-tighter text-text-primary group/link:text-brand">
              {recap.sahamKode}
            </h3>
          </div>
          <div className="relative z-10 flex shrink-0 items-center gap-1">
            <SavedButton id={recap.sahamKode} kind="stock" publishedAt={recap.tanggal} tone="dark" />
            <ShareButton
              url={`https://rangkuman.news${href}`}
              title={`${recap.sahamKode} — Rangkuman`}
              tone="dark"
            />
          </div>
        </div>

        {/* Meta line: date · articles · sentiment */}
        <p className="mb-2 inline-flex flex-wrap items-center gap-1.5 font-mono text-[10.5px] text-text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" aria-hidden />
            <span>{formatTanggalSingkat(recap.tanggal)}</span>
          </span>
          <span aria-hidden>·</span>
          <span className="num-tabular text-text-secondary">
            {recap.jumlahBerita} artikel
          </span>
          <span aria-hidden>·</span>
          <SentimentBadge sentiment={recap.sentimen} size="sm" />
        </p>

        {/* Summary */}
        <p className="line-clamp-3 text-[12.5px] leading-[1.55] text-text-secondary">
          {recap.ringkasan}
        </p>

        {/* Footer: sources + explicit "Buka" CTA. Both wrappers sit
            at z-10 so they stay clickable above the stretched card
            link — same URL, but the explicit button gives a clear
            visual affordance on the dense feed card. */}
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-2.5">
          <div className="relative z-10">
            <SourceBar sumber={recap.sumber} max={3} size="sm" />
          </div>
          <Link
            href={href}
            className="relative z-10 inline-flex shrink-0 items-center gap-0.5 text-[11.5px] font-semibold text-brand transition-colors hover:text-brand-hover"
          >
            Buka
            <ArrowUpRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </div>

      {/* Stretched link — the entire card is one click target. */}
      <Link
        href={href}
        aria-label={`${recap.sahamKode}`}
        className="absolute inset-0 z-0"
      />
    </article>
  );
}
