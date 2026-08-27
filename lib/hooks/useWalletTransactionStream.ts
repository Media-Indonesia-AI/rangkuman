"use client";

import { useEffect, useRef } from "react";
import { showToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/api/client";
import { getWalletTopupStreamPath } from "@/lib/api/wallet";
import { invalidateWallet } from "@/lib/api/cache/wallet";
import { invalidateTransactionHistory } from "@/lib/api/cache/wallet-transactions";
import { track, EVENTS } from "@/lib/analytics-events";

type Status = "success" | "expired" | "failed" | "pending";

const TOAST: Record<
  Exclude<Status, "pending">,
  { message: string; variant: "success" | "info" }
> = {
  success: {
    message: "Top-up berhasil. Saldo telah diperbarui.",
    variant: "success",
  },
  expired: {
    message: "Top-up kadaluarsa. Silakan buat permintaan baru.",
    variant: "info",
  },
  failed: {
    message: "Top-up gagal. Silakan coba lagi.",
    variant: "info",
  },
};

/**
 * Subscribe to the upstream wallet top-up SSE stream for the
 * duration a pending invoice is on screen.
 *
 * Opens a single `EventSource` keyed by `payment_ref` and reacts
 * to `message` events from the backend. The upstream sends
 * default events (no `event: <name>` line, just `id: <n>` and
 * `data: <json>`), so the browser dispatches them as `message`
 * - listening for a custom name like `payment-status-changed`
 * would never fire. On a terminal status (`success` /
 * `expired` / `failed`) it:
 *
 *   - shows a `Toast` with the variant from `TOAST[status]`,
 *   - drops the wallet + transaction-history caches so the
 *     next read hits the wire,
 *   - calls `onCloseOut?.()` so the parent can refresh
 *     wallet + history and clear the active payment
 *     transaction (which unmounts the QR card),
 *   - closes the `EventSource` directly so the browser stops
 *     trying to reconnect after a terminal event.
 *
 * The connection is already scoped to one `payment_ref` via the
 * path segment, so the backend doesn't echo `payment_ref` back
 * in the payload - we trust the subscription.
 *
 * Silently no-ops on an unreachable backend and `pending`
 * events. The browser's built-in reconnect-with-backoff handles
 * transient outages before close-out - there is no `onerror`
 * handler so we don't spam toasts or crash the QR card when
 * the proxy is down. The hook closes its `EventSource` on
 * unmount and on `payment_ref` change so React 18 strict-mode
 * double-mount can't leak two connections.
 *
 * @param paymentRef  The invoice's `payment_ref`. Falsy values
 *                    skip the connection entirely (parent has
 *                    no card to monitor).
 * @param onCloseOut  Optional callback fired once on the first
 *                    terminal-status event. Parent uses this
 *                    to refresh wallet + history and to clear
 *                    the displayed payment so the QR card
 *                    unmounts.
 */
export function useWalletTransactionStream(
  paymentRef: string | null | undefined,
  onCloseOut?: () => void,
): void {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!paymentRef) return;

    // No auth on the stream - the upstream identifies the
    // invoice from the `payment_ref` path segment alone. Build
    // the URL via the shared helper so endpoint paths live
    // next to the rest of the wallet API in `lib/api/wallet.ts`.
    const url = `${API_BASE_URL}${getWalletTopupStreamPath(paymentRef)}`;
    const es = new EventSource(url, { withCredentials: false });
    esRef.current = es;

    es.addEventListener("message", (ev: MessageEvent) => {
      let payload: { status?: Status };
      try {
        payload = JSON.parse(ev.data) as { status?: Status };
      } catch {
        return;
      }
      if (payload.status === "pending" || !payload.status) return;

      const entry = TOAST[payload.status];
      if (entry) showToast(entry.message, entry.variant);

      // Terminal-status funnel events. The `payment_ref` is the
      // only join key with `topup_start`; the stream is already
      // scoped per invoice so we trust the subscription. Fire
      // these BEFORE the cache invalidations so they don't get
      // flushed by an unmount that the invalidation could
      // trigger downstream.
      if (payload.status === "success") {
        track(EVENTS.topup_success, { payment_ref: paymentRef });
      } else if (payload.status === "expired") {
        track(EVENTS.topup_expired, { payment_ref: paymentRef });
      } else if (payload.status === "failed") {
        track(EVENTS.topup_failed, { payment_ref: paymentRef });
      }

      invalidateWallet();
      invalidateTransactionHistory(10, 0);
      // Close out: hand off to the parent (refresh wallet +
      // history, clear the active payment so the QR card
      // unmounts) and stop the stream so the browser stops
      // trying to reconnect. The dep-change cleanup will
      // re-run shortly when `paymentRef` flips to null and
      // call `es.close()` again - that's idempotent and safe.
      onCloseOut?.();
      es.close();
    });

    // No `onerror` handler - silent on transient outages so
    // the browser's built-in reconnect-with-backoff kicks in
    // without spamming toasts or crashing the QR card. Closed
    // connections (readyState === CLOSED, e.g. after a 401)
    // are left alone; the parent will re-render without a card
    // eventually.

    return () => {
      esRef.current = null;
      es.close();
    };
  }, [paymentRef, onCloseOut]);
}
