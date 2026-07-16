/**
 * Empty-state shell shown when the fetch resolves to no
 * commodities (or failed and the hook returned `null`).
 *
 * Same outer `<section>` + header strip as the populated grid
 * so the layout stays stable when the data flips between
 * populated and empty states.
 */
export function CommodityPricesEmpty() {
  return (
    <section aria-label="Harga Komoditas">
      <header className="mb-2 flex items-end justify-between gap-3 border-b border-border-strong pb-1.5">
        <div className="min-w-0">
          <h2 className="truncate text-[14px] font-bold tracking-tight text-text-primary">
            Komoditas · penggerak IHSG
          </h2>
          <p className="text-[10.5px] text-text-muted">
            Update harian · dikaitkan ke emiten IDX terdampak
          </p>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-text-faint">
          0 instrumen
        </span>
      </header>
      <div className="rounded-md border border-border bg-bg-secondary px-4 py-8 text-center">
        <p className="text-[12.5px] text-text-muted">
          Belum ada data komoditas.
        </p>
        <p className="mt-1 font-mono text-[10.5px] text-text-faint">
          Coba muat ulang beberapa saat lagi.
        </p>
      </div>
    </section>
  );
}