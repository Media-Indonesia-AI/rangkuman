"use client";

import { useCallback, useState } from "react";
import { Eye, EyeOff, Loader2, Plus, Search, X } from "lucide-react";
import type { WatchlistItem } from "@/lib/api";
import { useAddToWatchlist } from "@/lib/hooks/useAddToWatchlist";
import { useDeleteFromWatchlist } from "@/lib/hooks/useDeleteFromWatchlist";
import { useGetWatchlist } from "@/lib/hooks/useGetWatchlist";
import { useStocksSearch } from "@/lib/hooks/useStocksSearch";
import { cn } from "@/lib/utils";

interface AddStockDialogProps {
  onClose: () => void;
  existing: WatchlistItem[];
}

/** Modal for adding/removing stocks from the watchlist. */
export function AddStockDialog({ onClose, existing }: AddStockDialogProps) {
  const { add: addToList, isLoading: isAdding } = useAddToWatchlist();
  const { remove: removeFromList, isLoading: isRemoving } =
    useDeleteFromWatchlist();
  const { refresh } = useGetWatchlist();
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const { data: results, isLoading, error } = useStocksSearch(query);

  /** Membership is derived from the API items passed via `existing`
   *  — no localStorage lookup. Returns true when the row is
   *  already in the active user's watchlist (case-insensitive). */
  const isIn = useCallback(
    (kode: string) => {
      const target = kode.toUpperCase();
      return existing.some((i) => i.ticker_code === target);
    },
    [existing],
  );

  const handleToggle = async (kode: string) => {
    if (isIn(kode)) {
      const res = await removeFromList(kode);
      if (res !== null) {
        refresh();
        setToast(`✕ ${kode} dihapus dari watchlist`);
      } else {
        setToast(`⚠ Gagal hapus ${kode}`);
      }
    } else {
      // New row goes to the end of the user's list — `order`
      // is just the position within the list, and the backend
      // accepts any non-negative integer.
      const res = await addToList(kode, existing.length);
      if (res !== null) {
        refresh();
        setToast(`✓ ${kode} ditambahin ke watchlist`);
      } else {
        setToast(`⚠ Gagal nambahin ${kode}`);
      }
    }
    setTimeout(() => setToast(null), 2200);
  };

  const trimmed = query.trim();
  const showEmptyHint = trimmed.length === 0;
  const showLoading = isLoading && trimmed.length > 0;
  const showError = !!error && trimmed.length > 0;
  const showNoResults =
    trimmed.length > 0 && !isLoading && !error && results.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-label="Tambah saham ke watchlist"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-bg-secondary shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border bg-bg-tertiary px-3.5 py-2.5">
          <div className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5 text-brand" aria-hidden />
            <h2 className="text-[14px] font-bold tracking-tight text-text-primary">
              Tambah ke watchlist
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-text-faint hover:bg-bg-secondary hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </header>

        <div className="border-b border-border p-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint"
              aria-hidden
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari saham (kode atau nama)..."
              className="h-9 w-full rounded-md border border-border bg-bg-input pl-8 pr-3 text-[12.5px] text-text-primary placeholder:text-text-faint focus:border-brand focus:outline-none"
              autoFocus
            />
          </div>
          {toast && (
            <p className="mt-2 rounded border border-border bg-bg-tertiary px-2 py-1 font-mono text-[10.5px] text-text-primary">
              {toast}
            </p>
          )}
        </div>

        <ul className="max-h-[360px] overflow-y-auto p-1.5">
          {showEmptyHint ? (
            <li className="px-3 py-6 text-center text-[12px] text-text-muted">
              Ketik kode atau nama perusahaan buat mulai cari.
            </li>
          ) : showLoading ? (
            <li className="flex items-center justify-center gap-2 px-3 py-6 text-[12px] text-text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              <span>Nyari &ldquo;{trimmed}&rdquo;&hellip;</span>
            </li>
          ) : showError ? (
            <li className="px-3 py-6 text-center text-[12px] text-bearish">
              Gagal nyari saham. Coba lagi.
            </li>
          ) : showNoResults ? (
            <li className="px-3 py-6 text-center text-[12px] text-text-muted">
              Gak ada hasil untuk &ldquo;{trimmed}&rdquo;
            </li>
          ) : (
            results.map((s) => {
              const inList = isIn(s.ticker);
              const disabled = isAdding || isRemoving;
              return (
                <li key={s.ticker}>
                  <button
                    type="button"
                    onClick={() => handleToggle(s.ticker)}
                    disabled={disabled}
                    className={cn(
                      "flex w-full items-center gap-3 rounded px-2 py-2 text-left transition-colors",
                      "hover:bg-bg-tertiary",
                      inList && "bg-bullish-soft/30",
                      disabled && "opacity-60",
                    )}
                  >
                    <span className="inline-flex h-8 w-12 shrink-0 items-center justify-center rounded border border-border bg-bg-card font-mono text-[10.5px] font-bold tracking-tight text-text-primary">
                      {s.ticker}
                    </span>
                    <span className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold text-text-primary">
                        {s.company_name}
                      </p>
                    </span>
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        inList
                          ? "bg-bullish text-bg-primary"
                          : "border border-border bg-bg-tertiary text-text-faint",
                      )}
                    >
                      {inList ? (
                        <Eye className="h-3 w-3" aria-hidden />
                      ) : (
                        <EyeOff className="h-3 w-3" aria-hidden />
                      )}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <footer className="flex items-center justify-end border-t border-border bg-bg-tertiary px-3.5 py-2.5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 items-center rounded-md border border-border bg-bg-card px-3 text-[11.5px] font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            Selesai
          </button>
        </footer>
      </div>
    </div>
  );
}
