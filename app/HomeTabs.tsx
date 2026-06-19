"use client";

import { Suspense } from "react";
import { DateTabs, type DateTabValue } from "@/components/DateTabs";

function TabsFallback() {
  // Static, non-interactive placeholder for SSR / pre-hydration.
  return (
    <div
      role="tablist"
      aria-label="Filter tanggal recap"
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg-secondary p-1"
    >
      <span
        role="tab"
        aria-selected="true"
        className="rounded-md bg-bg-primary px-3 py-1.5 text-sm font-medium text-text-primary shadow-card"
      >
        Hari Ini
      </span>
      <span
        role="tab"
        aria-selected="false"
        className="rounded-md px-3 py-1.5 text-sm font-medium text-text-secondary"
      >
        Kemarin
      </span>
      <span
        role="tab"
        aria-selected="false"
        className="rounded-md px-3 py-1.5 text-sm font-medium text-text-secondary"
      >
        7 Hari Terakhir
      </span>
    </div>
  );
}

export function HomeTabs({
  value,
  onChange,
}: {
  value: DateTabValue;
  onChange: (next: DateTabValue) => void;
}) {
  return (
    <Suspense fallback={<TabsFallback />}>
      <DateTabs value={value} onChange={onChange} />
    </Suspense>
  );
}
