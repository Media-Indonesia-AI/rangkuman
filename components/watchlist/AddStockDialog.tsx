"use client";

import { useCallback, useState } from "react";
import { Eye, EyeOff, Loader2, Plus, Search, X } from "lucide-react";
import type { WatchlistItem } from "@/lib/api";
import { WATCHLIST_LIMIT } from "@/lib/auth";
import { useAddToWatchlist } from "@/lib/hooks/useAddToWatchlist";
import { useDeleteFromWatchlist } from "@/lib/hooks/useDeleteFromWatchlist";
import { useStocksSearch } from "@/lib/hooks/useStocksSearch";
import { cn } from "@/lib/utils";

interface AddStockDialogProps {
  onClose: () => void;
  existing: WatchlistItem[];
}

/** Modal for adding/removing stocks from the watchlist.
 *
 *  The list refresh on successful add/remove is automatic:
 *  each mutation hook calls `invalidateWatchlist()` on success,
 *  which notifies every mounted `useGetWatchlist` via the cache
 *  subscriber bus — the dialog (and the page grid behind it)
 *  re-fetches without this component wiring `refresh()` itself.
 *
 *  Adds are gated on `WATCHLIST_LIMIT`:
 *   - Rows already in `existing` stay toggleable (off) even at
 *     the cap, so the user can always free a slot by removing.
 *   - Rows not yet in the list are disabled with a tooltip once
 *     `existing.length >= WATCHLIST_LIMIT`, and a banner above
 *     the search box spells out the cap.
 *   - `handleToggle` re-checks the cap before firing the add
 *     mutation so a stale `existing` (e.g. a remove that's
 *     mid-flight) can't sneak through and surface a backend
 *     error — the same message the banner shows is surfaced via
 *     the toast instead. */
export function AddStockDialog({ onClose, existing }: AddStockDialogProps) {
  const { add: addToList, isLoading: isAdding } = useAddToWatchlist();
  const { remove: removeFromList, isLoading: isRemoving } =
    useDeleteFromWatchlist();
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const { data: results, isLoading, error } = useStocksSearch(query);
  const isAtLimit = existing.length >= WATCHLIST_LIMIT;

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
      // Remove path — always allowed (removing lowers the count,
      // so the cap is irrelevant). Keeping this enabled at the
      // limit is what lets the user free a slot without leaving
      // the dialog.
      const { ok } = await removeFromList(kode);
      setToast(
        ok
          ? `✕ ${kode} dihapus dari watchlist`
          : `⚠ Gagal hapus ${kode}`,
      );
    } else if (isAtLimit) {
      // Add path blocked at the cap. The result-list button is
      // also disabled in this state, so this branch only fires
      // for a stale `existing` (e.g. a remove that's still
      // mid-flight). Surface the same explanation the banner
      // shows so the feedback is consistent either way.
      setToast(
        `⚠ Watchlist penuh (${WATCHLIST_LIMIT}/${WATCHLIST_LIMIT}). Hapus salah satu dulu.`,
      );
    } else {
      // New row goes to the end of the user's list — `order`
      // is just the position within the list, and the backend
      // accepts any non-negative integer.
      const res = await addToList(kode, existing.length + 1);
      setToast(
        res !== null
          ? `✓ ${kode} ditambahin ke watchlist`
          : `⚠ Gagal nambahin ${kode}`,
      );
    }
    setTimeout(() => setToast(null), 2200);
  };

  const trimmed = query.trim();
  const showEmptyHint = trimmed.length === 0;
  const showLoading = isLoading && trimmed.length > 0;
  const showError = !!error && trimmed.length > 0;
  const showNoResults =
    trimmed.length > 0 && !isLoading && !error && results.length === 0;
  // Shared tooltip / aria text for cap-blocked buttons so the
  // reason is consistent across mouse-hover and screen readers.
  const limitTooltip = `Watchlist penuh (${WATCHLIST_LIMIT}/${WATCHLIST_LIMIT})`;

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
            {/* Always-visible counter so the user can plan their
                next action without reading the banner. Flips to
                `text-bearish` at the cap so the "10/10" state
                reads as a single visual group with the red banner
                below (and the red toast that fires if the user
                somehow tries to add past the cap). */}
            <span
              className={cn(
                "font-mono text-[10.5px]",
                isAtLimit ? "text-bearish" : "text-text-muted",
              )}
            >
              {existing.length}/{WATCHLIST_LIMIT}
            </span>
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

        {isAtLimit && (
          <div className="border-b border-border bg-bg-tertiary px-3 py-2 text-[11.5px] leading-snug text-bearish">
            Watchlist penuh ({existing.length}/{WATCHLIST_LIMIT}). Hapus salah satu saham buat nambah yang baru.
          </div>
        )}

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
            <p
              className={cn(
                "mt-2 rounded border bg-bg-tertiary px-2 py-1 font-mono text-[10.5px]",
                // Warnings (`⚠ …`) flip to the project's red pair —
                // `text-bearish` + a faint `border-bearish/40` — so
                // the cap-block and any failed-mutation toast read
                // as one visual group. Success / info toasts stay
                // on the default neutral border + primary text.
                toast.startsWith("⚠")
                  ? "border-bearish/40 text-bearish"
                  : "border-border text-text-primary",
              )}
            >
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
              // Already-in-list rows stay toggleable even when at
              // the cap so the user can free a slot. Not-yet-in
              // rows are gated on the cap; the button is disabled
              // (no click event) and surfaces the cap reason via
              // tooltip + aria-label.
              const blockedByLimit = !inList && isAtLimit;
              const disabled = isAdding || isRemoving || blockedByLimit;
              return (
                <li key={s.ticker}>
                  <button
                    type="button"
                    onClick={() => handleToggle(s.ticker)}
                    disabled={disabled}
                    title={blockedByLimit ? limitTooltip : undefined}
                    aria-label={blockedByLimit ? limitTooltip : undefined}
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
