interface StockAboutPanelProps {
  /** Ticker code; drives the panel header. */
  kode: string;
  /** Sector name — rendered in the "Sektor" row. Renders `"N/A"`
   *  when `null`/`undefined`. */
  sektor?: string | null;
  /** Pre-formatted price for the "Harga" row. */
  price?: string | null;
  /** Pre-formatted day-change string for the "Perubahan" row
   *  (caller-formatted, e.g. `"+4,45%"` or `"-1,20%"`). */
  change?: string | null;
  /** Coverage stats for the "Coverage" row. */
  coverage?: { media: number; artikel: number } | null;
}

/**
 * "Tentang {kode}" — the stock-info card for the stock detail page.
 *
 * One self-contained `<section>` with a header and a 4-row `<dl>`
 * (Sektor / Harga / Perubahan / Coverage). Designed to sit in the
 * right rail as its own card, above a separate `<SimilarStocks />`
 * card. Keeping it independent from the peer list makes it easier
 * to reorder, hide, or restyle either block on its own.
 *
 * Placeholder behavior matches the original inline JSX so the
 * page keeps rendering gracefully while its data hooks are still
 * in flight:
 *   - `sektor == null`   → renders `"N/A"`
 *   - `price == null`    → renders `"N/A"`
 *   - `change == null`   → renders `"N/A"`
 *   - `coverage == null` → renders `"0 media, 0 artikel"`
 */
export function StockAboutPanel({
  kode,
  sektor,
  price,
  change,
  coverage,
}: StockAboutPanelProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
      <header className="border-b border-border bg-bg-tertiary px-3 py-2">
        <h3 className="label">Tentang {kode}</h3>
      </header>

      <dl className="divide-y divide-border text-[12.5px]">
        <div className="flex justify-between gap-2 px-3 py-2">
          <dt className="text-text-muted">Sektor</dt>
          <dd className="text-right text-text-primary">{sektor ?? "N/A"}</dd>
        </div>
        <div className="flex justify-between gap-2 px-3 py-2">
          <dt className="text-text-muted">Harga</dt>
          <dd className="font-mono text-text-primary num-tabular">
            {price ?? "N/A"}
          </dd>
        </div>
        <div className="flex justify-between gap-2 px-3 py-2">
          <dt className="text-text-muted">Perubahan</dt>
          <dd className="font-mono font-semibold text-text-primary num-tabular">
            {change ?? "N/A"}
          </dd>
        </div>
        <div className="flex justify-between gap-2 px-3 py-2">
          <dt className="text-text-muted">Coverage</dt>
          <dd className="text-text-primary">
            {coverage
              ? `${coverage.media} media, ${coverage.artikel} artikel`
              : "0 media, 0 artikel"}
          </dd>
        </div>
      </dl>
    </section>
  );
}