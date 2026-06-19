"use client";

import { cn } from "@/lib/utils";

export type SahamTab = "recap" | "sektor";

interface SahamSubTabsProps {
  active: SahamTab;
  onChange: (tab: SahamTab) => void;
  className?: string;
}

const TABS: { value: SahamTab; label: string; description: string }[] = [
  {
    value: "recap",
    label: "Recap",
    description: "Recap saham harian & sentimen pasar",
  },
  {
    value: "sektor",
    label: "Sektor",
    description: "12 sektor IHSG + harga komoditas",
  },
];

export function SahamSubTabs({ active, onChange, className }: SahamSubTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Sub-tab saham"
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-bg-secondary p-1",
        className,
      )}
    >
      {TABS.map((t) => {
        const isActive = active === t.value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.value)}
            title={t.description}
            className={cn(
              "rounded px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
              isActive
                ? "bg-bg-tertiary text-text-primary"
                : "text-text-muted hover:text-text-primary",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
