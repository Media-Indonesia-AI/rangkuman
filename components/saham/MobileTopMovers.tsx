"use client";

import Link from "next/link";
import { TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { type IndexMoverItem } from "@/lib/api";
import { useIndexMovers } from "@/lib/hooks/useIndexMovers";
import { LoginPromptOverlay } from "../LoginPromptOverlay";
import { cn } from "@/lib/utils";

/**
 * Index Movers strip — horizontal scrollable cards of the stocks
 * moving the composite index, shown in the order the API returns.
 * Fetches live data from /stocks/index-mover. Renders:
 * - Shimmer skeletons while loading
 * - Error state with retry on failure
 * - Real cards when ready
 *
 * Data + login-driven refetch live in `useIndexMovers`. Each card is
 * colored by its own day-change sign (up = bullish, down = bearish).
 */
export function MobileTopMovers() {
  const { state, refetch } = useIndexMovers(10);

  // A 401 means the endpoint is auth-gated and the user is logged out.
  // The LoginPromptOverlay already covers the strip, so treat it as an
  // empty (non-error) list rather than showing a failure message.
  const isError = state.kind === "error" && state.status !== 401;
  const loading = state.kind === "loading";
  const movers = state.kind === "ready" ? state.movers : [];

  return (
    <section
      className="relative overflow-hidden rounded-lg border border-border bg-bg-secondary xl:hidden"
      aria-label="Index Movers"
    >
      <header className="flex items-center gap-1.5 border-b border-border bg-bg-tertiary px-3 py-1.5">
        <TrendingUp className="h-3 w-3 text-brand" aria-hidden />
        <h2 className="label">Index Movers · IDX</h2>
        <span className="ml-auto font-mono text-[10px] text-text-faint num-tabular">
          {state.kind === "ready"
            ? `${movers.length} saham`
            : loading
              ? "…"
              : "-"}
        </span>
      </header>

      <div className="relative">
        {isError ? (
          <ErrorState
            message={
              state.kind === "error" && state.message
                ? `Gagal memuat: ${state.message}`
                : "Gagal memuat index movers."
            }
            onRetry={refetch}
          />
        ) : (
          <MoverRow loading={loading} rows={movers} />
        )}
        <LoginPromptOverlay />
      </div>
    </section>
  );
}

interface MoverRowProps {
  loading: boolean;
  rows: IndexMoverItem[];
}

function MoverRow({ rows, loading }: MoverRowProps) {
  return (
    <div className="px-3 py-2">
      <div className="-mx-3 grid grid-cols-2 gap-2 px-3 pb-1 sm:grid-cols-3 md:grid-cols-5">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
          : rows.length === 0
            ? null
            : rows.map((s) => (
                <StockCard
                  key={s.ticker}
                  ticker={s.ticker}
                  companyName={s.company_name}
                  percentChange={s.percent_change}
                />
              ))}
      </div>
    </div>
  );
}

function StockCard({
  ticker,
  companyName,
  percentChange,
}: {
  ticker: string;
  companyName: string;
  percentChange: number;
}) {
  const positive = percentChange >= 0;
  const colorClass = positive ? "text-bullish" : "text-bearish";
  const href = `/stock/${ticker}`;
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-col gap-0.5 rounded-md border border-border bg-bg-tertiary px-2.5 py-1.5 transition-colors hover:border-border-strong"
    >
      <span className="font-mono text-[12px] font-semibold text-text-primary">
        {ticker}
      </span>
      <span className="truncate text-[10px] text-text-muted">
        {companyName}
      </span>
      <span
        className={cn(
          "mt-0.5 font-mono text-[11px] font-semibold num-tabular",
          colorClass,
        )}
      >
        {positive ? "+" : ""}
        {percentChange.toFixed(2)}%
      </span>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-md border border-border bg-bg-tertiary px-2.5 py-1.5">
      <div className="h-3 w-12 animate-pulse rounded bg-bg-secondary" />
      <div className="h-2.5 w-20 animate-pulse rounded bg-bg-secondary/60" />
      <div className="mt-0.5 h-3 w-10 animate-pulse rounded bg-bg-secondary" />
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-3 py-4 text-center">
      <AlertCircle className="h-4 w-4 text-bearish" aria-hidden />
      <p className="font-mono text-[11px] text-bearish">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 inline-flex items-center gap-1.5 rounded border border-border bg-bg-tertiary px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
      >
        <RefreshCw className="h-3 w-3" aria-hidden />
        Coba lagi
      </button>
    </div>
  );
}