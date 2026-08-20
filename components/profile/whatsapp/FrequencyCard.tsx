"use client";

/**
 * Frequency selection card — checkbox group for the three
 * time-of-day slots. Controlled component: the page owns the
 * `frequencies` Set and decides how the toggle behaves; the
 * widget just renders the rows.
 *
 * Each row is a full clickable label (the checkbox + the text)
 * so the whole card is touch-friendly. Visibility is controlled
 * by the page — this widget always renders when mounted; the
 * parent wraps it in `{enabled && <FrequencyCard ... />}` so it
 * stays hidden when the master toggle is off.
 */

import { cn } from "@/lib/utils";
import { FREQUENCY, type FrequencyId } from "./constants";

export function FrequencyCard({
  frequencies,
  onToggle,
}: {
  frequencies: Set<FrequencyId>;
  onToggle: (id: FrequencyId) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-bg-secondary p-4">
      <p className="label">Frekuensi</p>
      <p className="mt-1 font-mono text-[10.5px] text-text-faint">
        Pilih satu atau lebih slot notifikasi.
      </p>
      <div className="mt-2.5 space-y-2">
        {FREQUENCY.map((f) => {
          const active = frequencies.has(f.id);
          return (
            <label
              key={f.id}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 transition-colors",
                active
                  ? "border-brand bg-brand-soft"
                  : "border-border bg-bg-card hover:border-border-strong",
              )}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => onToggle(f.id)}
                className="mt-0.5 h-3.5 w-3.5 accent-brand"
              />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-text-primary">
                  {f.label}
                </p>
                <p className="mt-0.5 text-[11.5px] text-text-muted">
                  {f.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}