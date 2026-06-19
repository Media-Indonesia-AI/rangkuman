"use client";

import { cn } from "@/lib/utils";

export type CryptoSubNavValue = "top" | "pasar";

interface CryptoSubNavProps {
  active: CryptoSubNavValue;
  onChange: (v: CryptoSubNavValue) => void;
  className?: string;
}

const TABS: { value: CryptoSubNavValue; label: string }[] = [
  { value: "top", label: "Recap" },
  { value: "pasar", label: "Pasar" },
];

export function CryptoSubNav({ active, onChange, className }: CryptoSubNavProps) {
  return (
    <div
      role="tablist"
      aria-label="Sub-tab crypto"
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
