"use client";

/**
 * Perbarui save button + inline error display. Controlled
 * component — the page owns the visibility decision (whether to
 * mount this widget at all, gated on `settings != null &&
 * !toggleMatchesSaved`) and the click handler; the widget only
 * renders the visual affordance and the error message.
 *
 * Inline error vs. toast bus: the update hook extracts `.message`
 * from the `ApiError` and exposes it as a localised string. We
 * render it directly next to the button (above, right-aligned)
 * so the failure context lives with the affordance that caused
 * it — the user can read it, fix, and click again without
 * waiting for a transient toast.
 */

import { cn } from "@/lib/utils";

export function PerbaruiButton({
  onClick,
  isSaving,
  error,
}: {
  onClick: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-col items-end gap-1.5">
      {error && (
        <p className="font-mono text-[10.5px] text-bearish">
          ⚠ {error}
        </p>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={isSaving}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md px-4 font-mono text-[12px] font-semibold transition-colors",
          "bg-brand text-bg-primary hover:opacity-90",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {isSaving ? "Memperbarui…" : "Perbarui"}
      </button>
    </div>
  );
}