"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { api, type ApiError, type TopStockItem } from "@/lib/api";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { LoginPromptOverlay } from "./LoginPromptOverlay";
import { cn } from "@/lib/utils";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; gainers: TopStockItem[]; losers: TopStockItem[] }
  | { kind: "error"; message: string };

/**
 * Top Movers strip — horizontal scrollable cards of gainers + losers.
 * Fetches live data from /stocks/top-stocks. Renders:
 * - Shimmer skeletons while loading
 * - Error state with retry on failure
 * - Real cards when ready
 *
 * Re-fetches when the user logs in/out.
 */
export function MobileTopMovers() {
  const user = useCurrentUser();
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const fetchOnce = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const res = await api.getTopStocks();
      const groups = res.data ?? [];
      const gainers =
        groups.find((g) => g.type === "top-gainer")?.stocks ?? [];
      const losers =
        groups.find((g) => g.type === "top-looser")?.stocks ?? [];
      setState({ kind: "ready", gainers, losers });
    } catch (err) {
      const apiErr = err as ApiError;
      setState({
        kind: "error",
        message:
          apiErr?.message
            ? `Gagal memuat: ${apiErr.message}`
            : "Gagal memuat top movers.",
      });
    }
  }, []);

  // Refetch on login / logout.
  useEffect(() => {
    void fetchOnce();
  }, [user, fetchOnce]);

  const total =
    state.kind === "ready"
      ? state.gainers.length + state.losers.length
      : 0;

  return (
    <section
      className="relative overflow-hidden rounded-lg border border-border bg-bg-secondary xl:hidden"
      aria-label="Top Movers"
    >
      <header className="flex items-center gap-1.5 border-b border-border bg-bg-tertiary px-3 py-1.5">
        <TrendingUp className="h-3 w-3 text-brand" aria-hidden />
        <h2 className="label">Top Movers · IDX</h2>
        <span className="ml-auto font-mono text-[10px] text-text-faint num-tabular">
          {state.kind === "ready"
            ? `${total} saham`
            : state.kind === "loading"
              ? "…"
              : "-"}
        </span>
      </header>

      <div className="relative">
        {state.kind === "error" ? (
          <ErrorState message={state.message} onRetry={fetchOnce} />
        ) : (
          <>
            <MoverRow
              title="Gainers"
              Icon={ArrowUp}
              direction="up"
              loading={state.kind === "loading"}
              rows={state.kind === "ready" ? state.gainers : []}
            />
            <div className="border-t border-border" />
            <MoverRow
              title="Losers"
              Icon={ArrowDown}
              direction="down"
              loading={state.kind === "loading"}
              rows={state.kind === "ready" ? state.losers : []}
            />
          </>
        )}
        <LoginPromptOverlay />
      </div>
    </section>
  );
}

interface MoverRowProps {
  title: string;
  direction: "up" | "down";
  loading: boolean;
  rows: TopStockItem[];
  Icon: typeof ArrowUp;
}

function MoverRow({ title, rows, direction, Icon, loading }: MoverRowProps) {
  const colorClass = direction === "up" ? "text-bullish" : "text-bearish";

  return (
    <div className="px-3 py-2">
      <p
        className={cn(
          "label mb-1.5 flex items-center gap-1",
          colorClass,
        )}
      >
        <Icon className="h-2.5 w-2.5" aria-hidden /> {title}
      </p>
      <div className="-mx-3 grid grid-cols-2 gap-2 px-3 pb-1 sm:grid-cols-3 md:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : rows.length === 0
            ? null
            : rows.map((s) => (
                <StockCard
                  key={s.ticker}
                  ticker={s.ticker}
                  companyName={s.company_name}
                  percentChange={s.percent_change}
                  colorClass={colorClass}
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
  colorClass,
}: {
  ticker: string;
  companyName: string;
  percentChange: number;
  colorClass: string;
}) {
  const positive = percentChange >= 0;
  return (
    <Link
      href={`/stock/${ticker}`}
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