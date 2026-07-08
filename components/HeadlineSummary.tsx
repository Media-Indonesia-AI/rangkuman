"use client";

import { useHeadlineDetail } from "./HeadlineDetailProvider";

/**
 * Editorial summary paragraph for the "Ringkasan AI" section. Prefers
 * the deep-linked headline's `summary` (from the `getHeadlineById`
 * response, read via `useHeadlineDetail()`) over the aggregate recap
 * summary.
 *
 * The single fetch is owned by `<HeadlineDetailProvider>` (mounted by the
 * stock page); this component just consumes the shared result. Falls back
 * to `fallback` when there's no `?id=`, while the fetch is in flight, or
 * if it failed — so the statically prerendered shell renders unchanged.
 */
export function HeadlineSummary({ fallback }: { fallback: string }) {
  const { detail } = useHeadlineDetail();
  const summary = detail?.summary ?? fallback;

  return (
    <p className="text-[15px] leading-[1.65] text-text-primary">{summary}</p>
  );
}
