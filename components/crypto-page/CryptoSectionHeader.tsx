import type { ReactNode } from "react";

interface CryptoSectionHeaderProps {
  /** Small lucide icon shown next to the title (e.g. `Flame`,
   *  `BookOpen`, `BarChart3`). */
  icon: ReactNode;
  /** Section title shown in the brand-color mono caps row. */
  title: string;
  /** Single-line description / subtitle under the title. */
  subtitle?: string;
  /** Right-aligned count meta in mono gray (e.g. "1 cerita"). */
  count: string;
}

/**
 * Section header shared by every layer of the `/crypto` page —
 * Sorotan, Berita Terkini, and the Pasar tab's "Top Movers".
 * Lays out as a left-aligned title+subtitle pair
 * (`border-b border-border-strong`) with a right-aligned count.
 *
 * Pure presentational — no state, no fetch, no icon-defaulting
 * (callers must pass an icon explicitly so the visual identity of
 * each section stays its own).
 */
export function CryptoSectionHeader({
  icon,
  title,
  subtitle,
  count,
}: CryptoSectionHeaderProps) {
  return (
    <div className="mb-3 flex items-end justify-between border-b border-border-strong pb-1.5">
      <div>
        <h2 className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          {icon}
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-[11px] text-text-muted">{subtitle}</p>}
      </div>
      <span className="font-mono text-[10px] text-text-faint">{count}</span>
    </div>
  );
}
