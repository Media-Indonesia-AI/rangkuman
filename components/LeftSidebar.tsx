"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, RefreshCw, AlertCircle } from "lucide-react";
import { type ApiError, type TopStockItem } from "@/lib/api";
import { loadTopStocks } from "@/lib/api/cache";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { MOCK_TOP_STOCKS } from "@/lib/mock/top-stocks";
import { LoginPromptOverlay } from "./LoginPromptOverlay";
import { cn } from "@/lib/utils";

/** Skeleton row count per group — matches the 10-row layout shown in the design (5 gainers + 5 losers). */
const SKELETON_ROWS = 5;

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; gainers: TopStockItem[]; losers: TopStockItem[] }
  | { kind: "error"; message: string };

/**
 * Left rail — Top Movers (gainers + losers). Visible on desktop only.
 * Fetches live data from /stocks/top-stocks. Renders:
 * - Skeleton (10 rows) while loading
 * - Error message + retry when the request fails
 * - Real rows once data arrives
 *
 * Re-fetches automatically when the user logs in/out (the `user` dep).
 */
export function LeftSidebar() {
  const user = useCurrentUser();
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const fetchOnce = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const res = await loadTopStocks();
      // Backend wraps the array in `{ data: [...] }`.
      const groups = res.data ?? [];
      const gainers =
        groups.find((g) => g.type === "top-gainer")?.stocks ?? [];
      const losers = groups.find((g) => g.type === "top-looser")?.stocks ?? [];
      setState({ kind: "ready", gainers, losers });
    } catch (err) {
      const apiErr = err as ApiError;
      // 401 = the endpoint requires auth and the user is logged out. Show
      // a static mock list under the LoginPromptOverlay rather than an
      // error — the list itself is secondary to the login prompt.
      if (apiErr?.status === 401) {
        const groups = MOCK_TOP_STOCKS.data;
        setState({
          kind: "ready",
          gainers: groups.find((g) => g.type === "top-gainer")?.stocks ?? [],
          losers: groups.find((g) => g.type === "top-looser")?.stocks ?? [],
        });
        return;
      }
      setState({
        kind: "error",
        message:
          apiErr?.message
            ? `Gagal memuat top movers: ${apiErr.message}`
            : "Gagal memuat top movers.",
      });
    }
  }, []);

  // Refetch when the user changes (login / logout).
  useEffect(() => {
    void fetchOnce();
  }, [user, fetchOnce]);

  const total =
    state.kind === "ready"
      ? state.gainers.length + state.losers.length
      : SKELETON_ROWS * 2;

  return (
    <aside className="space-y-4" aria-label="Top movers kiri">
      <section
        className="relative overflow-hidden rounded-lg border border-border bg-bg-secondary"
        aria-label="Top movers"
      >
        <header className="flex items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3 py-2">
          <h3 className="label">Top Movers · IDX</h3>
          <span className="font-mono text-[10px] text-text-muted num-tabular">
            {state.kind === "ready"
              ? `${total} saham`
              : state.kind === "loading"
                ? "…"
                : "-"}
          </span>
        </header>

        <div className="relative min-h-[360px]">
          {state.kind === "error" ? (
            <ErrorState message={state.message} onRetry={fetchOnce} />
          ) : (
            <>
              <MoverList
                title="Gainers"
                direction="up"
                loading={state.kind === "loading"}
                rows={state.kind === "ready" ? state.gainers : []}
              />
              <div className="border-t border-border" />
              <MoverList
                title="Losers"
                direction="down"
                loading={state.kind === "loading"}
                rows={state.kind === "ready" ? state.losers : []}
              />
            </>
          )}
          <LoginPromptOverlay />
        </div>
      </section>
    </aside>
  );
}

interface MoverListProps {
  title: string;
  direction: "up" | "down";
  loading: boolean;
  rows: TopStockItem[];
}

function MoverList({ title, direction, loading, rows }: MoverListProps) {
  const Icon = direction === "up" ? ArrowUp : ArrowDown;
  const colorClass = direction === "up" ? "text-bullish" : "text-bearish";

  return (
    <div className="px-3 py-2">
      <p className={cn("label mb-1.5 flex items-center gap-1", colorClass)}>
        <Icon className="h-2.5 w-2.5" aria-hidden /> {title}
      </p>
      <ul className="space-y-0.5">
        {loading
          ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <SkeletonRow key={i} />
            ))
          : rows.length === 0
            ? null
            : rows.map((s) => (
                <Row key={s.ticker} stock={s} colorClass={colorClass} />
              ))}
      </ul>
    </div>
  );
}

function Row({
  stock,
  colorClass,
}: {
  stock: TopStockItem;
  colorClass: string;
}) {
  const positive = stock.percent_change >= 0;
  const href = `/stock/${stock.ticker}`;
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center justify-between gap-2 rounded px-1 py-1.5 transition-colors hover:bg-bg-tertiary"
      >
        <div className="min-w-0">
          <p className="truncate font-mono text-[12px] font-semibold text-text-primary group-hover:text-brand">
            {stock.ticker}
          </p>
          <p className="truncate text-[10.5px] text-text-muted">
            {stock.company_name}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="num-tabular text-[11.5px] font-medium text-text-primary">
            {stock.price.toLocaleString("id-ID")}
          </p>
          <p
            className={cn(
              "num-tabular text-[10.5px] font-semibold",
              colorClass,
            )}
          >
            {positive ? "▲ +" : "▼ "}
            {Math.abs(stock.percent_change).toFixed(2)}%
          </p>
        </div>
      </Link>
    </li>
  );
}

/** Single shimmer row matching the layout of <Row>: ticker / name on the left, price / % on the right. */
function SkeletonRow() {
  return (
    <li className="flex items-center justify-between gap-2 rounded px-1 py-1.5">
      <div className="flex flex-col gap-1">
        <div className="h-3 w-12 animate-pulse rounded bg-bg-tertiary" />
        <div className="h-2.5 w-20 animate-pulse rounded bg-bg-tertiary/60" />
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="h-3 w-14 animate-pulse rounded bg-bg-tertiary" />
        <div className="h-2.5 w-10 animate-pulse rounded bg-bg-tertiary/60" />
      </div>
    </li>
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