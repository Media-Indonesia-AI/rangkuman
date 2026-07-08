"use client";

import { useHeadlineDetail } from "./HeadlineDetailProvider";

/**
 * Hero chip that shows the deep-linked headline's `primary_ticker_code`
 * (from the `getHeadlineById` response, read via `useHeadlineDetail()`).
 *
 * The single fetch is owned by `<HeadlineDetailProvider>` (mounted by the
 * stock page); this component just consumes the shared result. Falls back
 * to `fallback` when there's no `?id=`, while the fetch is in flight, or
 * if it failed — so the statically prerendered shell renders unchanged.
 */
export function HeadlineTickerChip({ fallback }: { fallback: string }) {
  const { detail } = useHeadlineDetail();
  const label = detail?.primary_ticker_code ?? fallback;

  return (
    <span className="rounded border border-border bg-bg-primary/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-primary backdrop-blur-sm">
      {label}
    </span>
  );
}
