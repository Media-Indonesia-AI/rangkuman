"use client";

import { useMemo } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useAddToWatchlist } from "@/lib/hooks/useAddToWatchlist";
import { useDeleteFromWatchlist } from "@/lib/hooks/useDeleteFromWatchlist";
import { useGetWatchlist } from "@/lib/hooks/useGetWatchlist";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { WATCHLIST_LIMIT } from "@/lib/auth";
import { showToast } from "@/components/Toast";
import { GUEST_LOGIN_DIALOG_OPEN_EVENT } from "@/components/GuestLoginDialog";
import { track, EVENTS } from "@/lib/analytics-events";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  /** Ticker code, e.g. `"BBCA"`. The button toggles membership
   *  for this ticker on the active user's watchlist. */
  kode: string;
  /** GA4 attribution key — see `EVENTS` in
   *  `lib/analytics-events.ts`. Forwarded on add /
   *  blocked events so the GA funnel can split watchlist
   *  interactions by surface (e.g. `stock_aggregate_summary`
   *  vs `stock_card_actions`). Mirrors the ShareButton
   *  contract: defaults to `"unknown"` rather than throwing,
   *  so pre-existing call sites keep compiling while the prop
   *  is being rolled out. */
  surface?: string;
}

/**
 * Icon-only toggle button for adding/removing a ticker to the
 * active user's watchlist. Sized and styled to mirror
 * `<ShareButton />`'s `compact` variant so the two buttons can
 * sit side-by-side in tight chrome rows (e.g. the header bar
 * of `<AggregateSummary />`).
 *
 * Visual states:
 *
 *   - **Guest**            — icon is `Bookmark` (outline);
 *                            click force-opens the global
 *                            `<GuestLoginDialog />` via the
 *                            `guest-login-dialog:open` window
 *                            event. The dialog handles the auth
 *                            route — after login,
 *                            `<PathnameTracker />`'s capture
 *                            plus the login page's
 *                            `getAuthRedirectTarget()` send the
 *                            user back to this page
 *                            automatically. No watchlist read
 *                            fires for guests (the
 *                            `loadWatchlist()` request would
 *                            401 and `useGetWatchlist` already
 *                            swallows that error).
 *   - **Logged-in, not tracked** — icon is `Bookmark` (outline).
 *   - **Logged-in, tracked**     — icon is `BookmarkCheck`
 *                                  (filled), border + icon pick
 *                                  up `text-brand` so the
 *                                  "on" state is visible at a
 *                                  glance — same brand accent
 *                                  the toast `save` variant
 *                                  uses for symmetry.
 *
 * Mutation flow:
 *   - Read membership off `useGetWatchlist().items` (case-
 *     insensitive on `ticker_code`), the same pattern
 *     `<AddStockDialog />` uses.
 *   - `add` / `remove` flow through the existing
 *     `useAddToWatchlist` / `useDeleteFromWatchlist` mutation
 *     hooks so cache invalidation + GA event fan-out stay
 *     identical to the dialog.
 *   - At the cap (`items.length >= WATCHLIST_LIMIT`), the
 *     button is disabled for non-tracked tickers with a
 *     tooltip explaining why. Removing a tracked ticker is
 *     always allowed (it frees a slot) — same contract as
 *     the dialog.
 *
 * Analytics:
 *   - `watchlist_add` fires on successful add (the delete
 *     hook already fires `watchlist_remove` itself, so the
 *     button does NOT re-fire to avoid double-counting).
 *   - `watchlist_add_blocked_at_limit` fires when the user
 *     tries to add at the cap — a product-demand signal that
 *     tells us when to raise the limit.
 *
 * Hydration:
 *   - `useCurrentUser()` returns `undefined` while
 *     localStorage hydration is in flight. The button treats
 *     that the same as a guest (`!user` is true) — the
 *     `<GuestLoginDialog />`'s force-open handler also checks
 *     `!user`, so a click during hydration is a safe no-op
 *     for already-logged-in users.
 */
export function WatchlistButton({
  kode,
  surface = "unknown",
}: WatchlistButtonProps) {
  const user = useCurrentUser();
  const { items, isLoading: isLoadingList } = useGetWatchlist();
  const { add, isLoading: isAdding } = useAddToWatchlist();
  const { remove, isLoading: isRemoving } = useDeleteFromWatchlist();

  const normalized = kode.toUpperCase();
  // Membership is derived from the API items passed via
  // `useGetWatchlist` — case-insensitive on `ticker_code`,
  // matching `<AddStockDialog />`'s `isIn` helper.
  const inWatchlist = useMemo(
    () => items.some((i) => i.ticker_code === normalized),
    [items, normalized],
  );
  const isAtLimit = items.length >= WATCHLIST_LIMIT;
  const isMutating = isAdding || isRemoving;

  // Blocked = not yet tracked AND the user is already at the
  // cap. Tracked rows are always allowed to remove (it lowers
  // the count). Tooltip + aria-label both surface the same
  // reason so screen-reader users get the same feedback.
  const blockedByLimit = !inWatchlist && isAtLimit;
  const disabled = isLoadingList || isMutating || blockedByLimit;
  const limitTooltip = `Watchlist penuh (${items.length}/${WATCHLIST_LIMIT})`;

  const handleClick = async () => {
    if (!user) {
      // Guest path (covers both `user === null` and the
      // pre-hydration `user === undefined` window — the
      // dialog's handler also gates on `!user`, so a click
      // mid-hydration is a safe no-op for logged-in users).
      window.dispatchEvent(
        new CustomEvent(GUEST_LOGIN_DIALOG_OPEN_EVENT),
      );
      return;
    }
    if (inWatchlist) {
      // Remove path — always allowed at any cap (removing
      // lowers the count). `watchlist_remove` is fired by the
      // hook on success only; do NOT re-fire here or the GA
      // event double-counts.
      const { ok } = await remove(kode);
      showToast(
        ok
          ? `✕ ${kode} dihapus dari watchlist`
          : `⚠ Gagal hapus ${kode}`,
        "info",
      );
      return;
    }
    if (isAtLimit) {
      // Add path blocked — should be unreachable via UI (the
      // button is disabled), but a stale `items` (e.g. a
      // remove mid-flight) can still land here. Surface the
      // same explanation the tooltip shows so the feedback is
      // consistent either way.
      track(EVENTS.watchlist_add_blocked_at_limit, {
        limit: WATCHLIST_LIMIT,
        current_count: items.length,
        surface,
      });
      showToast(
        `⚠ Watchlist penuh (${items.length}/${WATCHLIST_LIMIT}). Hapus salah satu dulu.`,
        "info",
      );
      return;
    }
    // New row goes to the end of the user's list — `order`
    // matches the AddStockDialog contract (`length + 1`
    // places the row at the bottom of the list).
    const res = await add(kode, items.length + 1);
    if (res !== null) {
      track(EVENTS.watchlist_add, { ticker: kode, surface });
      showToast(`✓ ${kode} ditambahkan ke watchlist`, "save");
    } else {
      showToast(`⚠ Gagal menambahkan ${kode}`, "info");
    }
  };

  // Tooltip / aria-label share the same text so mouse-hover
  // and screen readers deliver the same feedback.
  const tooltip = blockedByLimit
    ? limitTooltip
    : inWatchlist
      ? `Hapus ${kode} dari watchlist`
      : `Tambah ${kode} ke watchlist`;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={tooltip}
      aria-label={tooltip}
      className={cn(
        // Mirror <ShareButton /> compact variant: 28px square,
        // same border radius, same transition. Width matches
        // the share button so the two sit flush in the row.
        "inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
        inWatchlist
          ? // "On" state — brand accent so the tracked ticker
            // reads as deliberate state, not just a hover.
            "border-brand/40 bg-brand/10 text-brand hover:border-brand hover:bg-brand/20"
          : // Default — matches ShareButton's `dark` tone.
            "border-border bg-bg-tertiary text-text-secondary hover:border-border-strong hover:text-text-primary",
        disabled && "opacity-60",
      )}
    >
      {isMutating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : inWatchlist ? (
        <BookmarkCheck className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Bookmark className="h-3.5 w-3.5" aria-hidden />
      )}
    </button>
  );
}
