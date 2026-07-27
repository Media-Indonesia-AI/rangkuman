import { WATCHLIST_LIMIT } from "@/lib/auth";

/** Static "Tentang watchlist" footer aside — explains storage + limits. */
export function WatchlistInfo() {
  return (
    <aside className="mt-6 rounded-lg border border-border bg-bg-secondary/50 p-3.5">
      <p className="label mb-1.5">Tentang watchlist</p>
      <ul className="space-y-1 text-[11.5px] leading-relaxed text-text-muted">
        <li>· Disimpan di localStorage browser kamu. Gak ada backend, data gak ke-upload.</li>
        <li>· Maksimal {WATCHLIST_LIMIT} saham (free tier). Hapus dulu kalo mau ganti.</li>
        <li>· Sentiment badge & jumlah berita dari agregat media hari ini.</li>
      </ul>
    </aside>
  );
}