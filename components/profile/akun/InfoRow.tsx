"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoRowProps {
  /** Field label shown above the value — e.g. "Email", "Provider". */
  label: string;
  /** Leading icon for the row. */
  icon: LucideIcon;
  /** Field value. Truncated with an ellipsis when it overflows. */
  value: string;
  /** Render the value in `font-mono`. Used for the email row —
   *  addresses read better in mono. Opt-in so the widget doesn't
   *  need to know field-specific conventions. */
  mono?: boolean;
  /** Optional right-side adornment (e.g. "Verified" pill). */
  rightAdornment?: React.ReactNode;
}

/** Single row in the Akun info table. Icon + label-above-value
 *  on the left, optional right adornment on the right. The row
 *  is read-only — there's no pencil affordance today (the edit
 *  fields stay stubbed until the profile-edit API lands). */
export function InfoRow({
  label,
  icon: Icon,
  value,
  mono,
  rightAdornment,
}: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-3.5 py-2.5 last:border-b-0">
      <Icon className="h-3.5 w-3.5 shrink-0 text-text-faint" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-text-muted">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 truncate text-[13px] text-text-primary",
            mono && "font-mono",
          )}
        >
          {value}
        </p>
      </div>
      {rightAdornment}
    </div>
  );
}
