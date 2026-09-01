import { AlertCircle, RefreshCw } from "lucide-react";

interface CategoryGridErrorProps {
  /** API error message — falls back to a generic copy when the
   *  error arrived without a body. */
  message: string;
  /** Re-runs `useCoinCategories`'s fetch. */
  onRetry: () => void;
}

/**
 * Failure shell for the category grid — single panel with the
 * API error message and a retry button. Mirrors
 * `<TopMoversError />` so every Pasar-tab error reads the same
 * way: same panel shape, same retry button styling, same
 * fallback copy.
 */
export function CategoryGridError({ message, onRetry }: CategoryGridErrorProps) {
  return (
    <div className="rounded-lg border border-border bg-bg-secondary px-4 py-6 text-center">
      <AlertCircle
        className="mx-auto mb-2 h-4 w-4 text-bearish"
        aria-hidden
      />
      <p className="font-mono text-[11px] text-bearish">
        {message || "Gagal memuat kategori koin."}
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
