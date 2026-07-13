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
  const s = stock ?? getStockByKode(recap.sahamKode);
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
          "group flex items-center gap-2 border-b border-border px-3 py-2 transition-colors hover:bg-bg-tertiary",
          className,
        )}
      >
        <Link
          href={href}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <span className="font-mono text-[12px] font-semibold text-text-primary group-hover:text-brand">
            {recap.sahamKode}
          </span>
          <span className="flex-1 truncate text-[12px] text-text-secondary">
            {s?.nama}
          </span>
          <SentimentBadge sentiment={recap.sentimen} size="sm" />
          <span className="num-tabular text-[11px] text-text-muted">
            {recap.jumlahBerita}
          </span>
        </Link>
        <SavedButton id={recap.sahamKode} kind="stock" publishedAt={recap.tanggal} tone="dark" />
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
        {/* Left side: ticker + gradient backdrop */}
        <Link
          href={href}
          className={cn(
            "relative block w-[120px] shrink-0 overflow-hidden sm:w-[160px]",
          )}
          aria-label={`${recap.sahamKode} — ${s?.nama ?? ""}`}
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
              <p className="mt-1 truncate text-[10.5px] text-text-secondary sm:text-[11.5px]">
                {s?.nama}
              </p>
            </div>
          </div>
        </Link>

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
            <div className="flex shrink-0 items-center gap-1">
              <SavedButton id={recap.sahamKode} kind="stock" publishedAt={recap.tanggal} tone="dark" />
              <ShareButton
                url={`https://rangkuman.news${href}`}
                title={`${recap.sahamKode} — ${s?.nama ?? ""} · Rangkuman`}
                tone="dark"
              />
            </div>
          </div>

          <p className="line-clamp-3 text-[13px] leading-[1.55] text-text-primary">
            {recap.ringkasan}
          </p>

          <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-2.5">
            <SourceBar sumber={recap.sumber} max={3} size="sm" />
            <Link
              href={href}
              className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-brand transition-colors hover:text-brand-hover"
            >
              Lihat recap
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </div>
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
        {/* Left side: ticker + gradient backdrop + name + sentiment — DESKTOP ONLY */}
        <Link
          href={href}
          className="relative hidden w-[150px] shrink-0 overflow-hidden sm:block"
          aria-label={`${recap.sahamKode} — ${s?.nama ?? ""}`}
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
              <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-text-secondary">
                {s?.nama}
              </p>
            </div>
          </div>
        </Link>

        {/* Right side: body */}
        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          {/* ── Mobile-only compact header (rank + ticker + name + sentiment) ── */}
          <div className="mb-1.5 flex items-center justify-between gap-2 sm:hidden">
            <Link
              href={href}
              className="group/link flex min-w-0 flex-1 items-baseline gap-2"
            >
              {rank !== undefined && (
                <span className="font-mono text-[10px] font-semibold text-text-faint num-tabular">
                  #{String(rank).padStart(2, "0")}
                </span>
              )}
              <h2 className="font-mono text-[18px] font-bold leading-none tracking-tighter text-text-primary group-hover/link:text-brand">
                {recap.sahamKode}
              </h2>
              {s?.nama && (
                <span className="truncate text-[11.5px] text-text-muted">
                  {s.nama}
                </span>
              )}
            </Link>
            <SentimentBadge sentiment={recap.sentimen} size="sm" />
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
            <div className="flex shrink-0 items-center gap-1">
              <SentimentBadge sentiment={recap.sentimen} size="sm" />
              <SavedButton
                id={recap.sahamKode}
                kind="stock"
                publishedAt={recap.tanggal}
                tone="dark"
              />
              <ShareButton
                url={`https://rangkuman.news${href}`}
                title={`${recap.sahamKode} — ${s?.nama ?? ""} · Rangkuman`}
                tone="dark"
              />
            </div>
          </div>

          {/* Summary */}
          <p className="line-clamp-1 text-[12.5px] leading-snug text-text-secondary sm:line-clamp-3 sm:text-[13px] sm:leading-[1.55] sm:text-text-primary">
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
            <div className="flex shrink-0 items-center gap-1">
              <SavedButton
                id={recap.sahamKode}
                kind="stock"
                publishedAt={recap.tanggal}
                tone="dark"
              />
              <ShareButton
                url={`https://rangkuman.news${href}`}
                title={`${recap.sahamKode} — ${s?.nama ?? ""} · Rangkuman`}
                tone="dark"
              />
            </div>
          </div>

          {/* Desktop footer: sources + buka */}
          <div className="mt-auto hidden items-end justify-between gap-2 border-t border-border pt-2.5 sm:flex">
            <SourceBar sumber={recap.sumber} max={3} size="sm" />
            <Link
              href={href}
              className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-brand transition-colors hover:text-brand-hover"
            >
              Lihat recap
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </div>
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
        {/* Header row: ticker on left, save/share on right */}
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <Link
            href={href}
            className="group/link flex min-w-0 flex-1 items-baseline gap-2"
          >
            {rank !== undefined && (
              <span className="font-mono text-[10px] font-semibold text-text-faint num-tabular">
                #{String(rank).padStart(2, "0")}
              </span>
            )}
            <h3 className="font-mono text-[22px] font-bold leading-none tracking-tighter text-text-primary group-hover/link:text-brand">
              {recap.sahamKode}
            </h3>
            {s?.nama && (
              <span className="hidden truncate text-[11.5px] text-text-muted sm:inline">
                {s.nama}
              </span>
            )}
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <SavedButton id={recap.sahamKode} kind="stock" publishedAt={recap.tanggal} tone="dark" />
            <ShareButton
              url={`https://rangkuman.news${href}`}
              title={`${recap.sahamKode} — ${s?.nama ?? ""} · Rangkuman`}
              tone="dark"
            />
          </div>
        </div>

        {/* Mobile-only name (since it's hidden on the row above at sm+) */}
        {s?.nama && (
          <p className="-mt-1 mb-1 truncate text-[11.5px] text-text-muted sm:hidden">
            {s.nama}
          </p>
        )}

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

        {/* Footer: sources + cta */}
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-2.5">
          <SourceBar sumber={recap.sumber} max={3} size="sm" />
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-0.5 text-[11.5px] font-semibold text-brand transition-colors hover:text-brand-hover"
          >
            Buka
            <ArrowUpRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
