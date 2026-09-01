import { ChevronDown, Loader2, RefreshCw } from "lucide-react";

interface CategoryLoadMoreProps {
  /** Fired when the user clicks the button. Caller increments
   *  the page's `skip` value so the next fetch pulls the next
   *  page of categories. */
  onClick: () => void;
  /** True while the next page request is in flight — disables
   *  the button and swaps the icon + label for a spinner. */
  loading?: boolean;
  /** True when the most recent load-more attempt failed — the
   *  button label flips to "Coba lagi" so retry is obvious. */
  error?: boolean;
  /** Forwarded so the button can stretch to match the grid's
   *  card width when the parent wants full-width buttons. */
  className?: string;
}

/**
 * Trailing "Muat lebih banyak" button for the category grid.
 *
 * Three states driven by the parent:
 *
 *   - **idle** — green-light call to action. Click fires
 *     `onClick`; the parent advances `skip` and refetches.
 *   - **loading** — the next page request is in flight; the
 *     button is disabled and shows a spinner so the user knows
 *     their click registered and a second click won't double-
 *     fire the request.
 *   - **error** — the most recent load-more attempt failed;
 *     label flips to "Coba lagi" so the same button reads as
 *     a retry affordance instead of a duplicate "load more"
 *     that obscures the failure.
 *
 * Sits centered under the grid with `mt-3` so it doesn't crash
 * into the last card row.
 */
export function CategoryLoadMore({
  onClick,
  loading = false,
  error = false,
  className,
}: CategoryLoadMoreProps) {
  const label = loading
    ? "Memuat..."
    : error
      ? "Coba lagi"
      : "Muat lebih banyak";
  const Icon = loading ? Loader2 : error ? RefreshCw : ChevronDown;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
      className={
        "mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-bg-secondary px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60" +
        (className ? ` ${className}` : "")
      }
    >
      <Icon
        className={"h-3 w-3" + (loading ? " animate-spin" : "")}
        aria-hidden
      />
      {label}
    </button>
  );
}
