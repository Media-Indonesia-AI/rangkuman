"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type DateTabValue = "today" | "yesterday" | "week";

interface TabDef {
  value: DateTabValue;
  label: string;
  micro: string;
}

const TABS: TabDef[] = [
  { value: "today", label: "Hari Ini", micro: "Live" },
  { value: "yesterday", label: "Kemarin", micro: "−1d" },
  { value: "week", label: "7 Hari Terakhir", micro: "−7d" },
];

interface DateTabsProps {
  value: DateTabValue;
  onChange?: (next: DateTabValue) => void;
  className?: string;
  /** Base path to push on tab change. Defaults to "/". */
  basePath?: string;
}

export function DateTabs({ value, onChange, className, basePath = "/" }: DateTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = (next: DateTabValue) => {
    onChange?.(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "today") params.delete("date");
    else params.set("date", next);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  };

  return (
    <div
      role="tablist"
      aria-label="Filter tanggal recap"
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-bg-secondary p-1",
        className,
      )}
    >
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => handleClick(tab.value)}
            className={cn(
              "group relative flex items-center gap-1.5 rounded px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              active
                ? "bg-bg-tertiary text-text-primary"
                : "text-text-muted hover:text-text-primary",
            )}
          >
            {active && (
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-bullish animate-pulse-dot"
              />
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
