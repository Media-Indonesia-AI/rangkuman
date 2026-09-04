import { AlertCircle, RefreshCw } from "lucide-react";

interface TopMoversErrorProps {
  /** API error message — falls back to a generic copy when
   *  the error arrived without a body. */
  message: string;
  /** Re-runs `loadCoinTopTickers` via the host hook. */
  onRetry: () => void;
}

/**
 * Failure shell for the Top Movers section — single panel with
 * an icon, the API error message, and a retry button. Only
 * rendered for non-401 errors; `<TopMoversLoginPrompt />` takes
 * over the 401 branch so a logged-out visitor or expired
 * session sees a clear "log in" CTA instead of a generic
 * failure panel with a "coba lagi" button that won't help.
 */
export function TopMoversError({ message, onRetry }: TopMoversErrorProps) {
  return (
    <div className="rounded-lg border border-border bg-bg-secondary px-4 py-6 text-center">
      <AlertCircle
        className="mx-auto mb-2 h-4 w-4 text-bearish"
        aria-hidden
      />
      <p className="font-mono text-[11px] text-bearish">
        {message || "Gagal memuat top movers."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center gap-1.5 rounded border border-border bg-bg-tertiary px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
      >
        <RefreshCw className="h-3 w-3" aria-hidden />
        Coba lagi
      </button>
    </div>
  );
}
