"use client";

import Link from "next/link";
import { RefreshCw, AlertCircle } from "lucide-react";
import { type IndexMoverItem } from "@/lib/api";
import { useIndexMovers } from "@/lib/hooks/useIndexMovers";
import { LoginPromptOverlay } from "../LoginPromptOverlay";
import { cn } from "@/lib/utils";

/** Skeleton rows per Leading/Lagging group while the movers load. */
const GROUP_SKELETON_ROWS = 5;

/**
 * Left rail — Index Movers. Visible on desktop only. Fetches live data
 * from /stocks/index-mover and renders the response as two titled
 * groups — `Leading` (positive JCI point contributors) above
 * `Lagging` (negative). Renders:
 * - Skeleton rows in both groups while loading
 * - Error message + retry when the request fails
 * - Real rows once data arrives
 *
 * Data + login-driven refetch live in `useIndexMovers`; each row is
 * colored by its own day-change sign.
 */
export function LeftSidebar() {
  const { state, refetch } = useIndexMovers();

  // A 401 means the endpoint is auth-gated and the user is logged out.
  // The LoginPromptOverlay already covers the strip, so treat it as an
  // empty (non-error) list rather than showing a failure message.
  const isError = state.kind === "error" && state.status !== 401;
  const loading = state.kind === "loading";
  const leading = state.kind === "ready" ? state.leading : [];
  const lagging = state.kind === "ready" ? state.lagging : [];

  const total =
    state.kind === "ready"
      ? leading.length + lagging.length
      : GROUP_SKELETON_ROWS * 2;

  return (
    <aside className="space-y-4" aria-label="Index movers kiri">
      <section
        className="relative overflow-hidden rounded-lg border border-border bg-bg-secondary"
        aria-label="Index movers"
      >
        <header className="flex items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3 py-2">
          <h3 className="label">Index Movers · IDX</h3>
          <span className="font-mono text-[10px] text-text-muted num-tabular">
            {state.kind === "ready"
              ? `${total} saham`
              : loading
                ? "…"
                : "-"}
          </span>
        </header>

        <div className="relative min-h-[360px]">
          {isError ? (
            <ErrorState
              message={
                state.kind === "error" && state.message
                  ? `Gagal memuat index movers: ${state.message}`
                  : "Gagal memuat index movers."
              }
              onRetry={refetch}
            />
          ) : (
            <>
              <MoverList
                loading={loading}
                rows={leading}
                title="Leading"
                tone="bullish"
              />
              <MoverList
                loading={loading}
                rows={lagging}
                title="Lagging"
                tone="bearish"
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
  loading: boolean;
  rows: IndexMoverItem[];
  /** Section title shown above the rows (e.g. "Leading"). */
  title: string;
  /** Sign of the section's `jci_point` — drives the title accent so
   *  the header reads as bullish (green) for leaders and bearish
   *  (red) for laggers without changing layout. */
  tone: "bullish" | "bearish";
}

function MoverList({ loading, rows, title, tone }: MoverListProps) {
  return (
    <div className="px-3 py-2">
      <div className="mb-1 flex items-center justify-between">
        <h4
          className={cn(
            "label",
            tone === "bullish" ? "text-bullish" : "text-bearish",
          )}
        >
          {title}
        </h4>
        {!loading && (
          <span className="font-mono text-[10px] text-text-faint num-tabular">
            {rows.length}
          </span>
        )}
      </div>
      <ul className="space-y-0.5">
        {loading
          ? Array.from({ length: GROUP_SKELETON_ROWS }).map((_, i) => (
              <SkeletonRow key={i} />
            ))
          : rows.length === 0
            ? null
            : rows.map((s) => <Row key={s.ticker} stock={s} />)}
      </ul>
    </div>
  );
}

function Row({ stock }: { stock: IndexMoverItem }) {
  const positive = stock.percent_change >= 0;
  const colorClass = positive ? "text-bullish" : "text-bearish";
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