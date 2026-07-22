import { Newspaper } from "lucide-react";

/** Empty-state panel for the listing. Shown when `data.length === 0`
 *  (today: always, since `useMultiStories("")` short-circuits and
 *  the multi-date-stories endpoint doesn't yet support no-ticker
 *  queries). The copy points readers at the per-emiten stories on
 *  `/saham/` so they have an alternative path. */
export function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-bg-secondary/30 p-8 text-center">
      <Newspaper
        className="mx-auto mb-2 h-6 w-6 text-text-faint"
        aria-hidden
      />
      <p className="font-mono text-[12px] font-semibold uppercase tracking-widest text-text-muted">
        Belum ada cerita
      </p>
      <p className="mt-1 text-[12.5px] text-text-faint">
        Listing lintas ticker akan tersedia setelah endpoint
        multi-date-stories mendukung query tanpa ticker. Untuk saat
        ini, buka story per emiten dari halaman /saham/.
      </p>
    </div>
  );
}
