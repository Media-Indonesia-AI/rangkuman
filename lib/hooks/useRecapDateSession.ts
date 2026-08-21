"use client";

/**
 * Session state for the `/saham` recap date.
 *
 * Three concerns bundled into one hook because they share the
 * same `isoDate` state and would otherwise tangle the page:
 *
 *   1. **URL hint hydration** — `?date=` is set by the
 *      StockDetailPage back link so /saham lands on the same day
 *      the user was viewing on the detail page. The hint is
 *      consumed once and stripped via `history.replaceState` so
 *      a subsequent refresh falls through to today (and to the
 *      localStorage layer for picks within an active session).
 *   2. **localStorage persistence** — picks made via the
 *      DatePicker are persisted so a refresh within the same
 *      session restores them. Only non-today values are written
 *      to keep the storage slot minimal.
 *   3. **Inactivity auto-expiry** — after `RECAP_DATE_INACTIVITY_MS`
 *      of no user activity (mousedown / keydown / touchstart /
 *      scroll / wheel), the date snaps to today and the session
 *      is cleared. A fresh session starts on any edit that lands
 *      the date on a non-today value (manual pick, new
 *      back-from-detail navigation).
 *
 * The hook returns `[effectiveDate, setDate]` — `effectiveDate`
 * is always a string (today as the pre-hydration fallback), so
 * consumers don't need their own null-coalesce. `setDate` accepts
 * a non-null string; the hook owns the null-sentinel internally
 * to gate the persistence and inactivity effects.
 */

import { useEffect, useState } from "react";

import { STORAGE_KEYS } from "@/lib/storageKeys";
import { hariIniIso } from "@/lib/util/formatDate";
import { safeGetItem, safeRemoveItem, safeSetItem } from "@/lib/util/safeLocalStorage";

const RECAP_DATE_INACTIVITY_MS = 3 * 60 * 1000;

/** Type guard for the persisted / URL value — accepts only
 *  ISO-shaped `YYYY-MM-DD` strings (anything else falls through
 *  to today). Defensive against manual localStorage edits and
 *  URL parameter tampering. */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && ISO_DATE_RE.test(value);
}

/** Activity events that count as "user is still on the page".
 *  Deliberately omitted `mousemove` — it fires on every pixel of
 *  cursor motion, which would defeat the purpose of an inactivity
 *  window. `passive: true` is set on registration so scroll /
 *  wheel hot paths are never blocked. */
const ACTIVITY_EVENTS = [
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const satisfies ReadonlyArray<keyof WindowEventMap>;

export function useRecapDateSession(): readonly [
  effectiveDate: string,
  setDate: (next: string) => void,
] {
  // `null` is the pre-hydration sentinel — the pre-hydration render
  // falls back to today via the `??` on return.
  const [date, setDate] = useState<string | null>(null);

  // Hydrate on mount: URL hint → localStorage → today. The hint
  // wins because it's the freshest signal (back-from-detail just
  // happened). The URL query is then stripped so the next refresh
  // doesn't re-honor it.
  useEffect(() => {
    const dateParam = new URLSearchParams(window.location.search).get(
      "date",
    );
    if (isIsoDate(dateParam)) {
      setDate(dateParam);
    } else {
      const raw = safeGetItem(STORAGE_KEYS.sahamRecapDate);
      setDate(isIsoDate(raw) ? raw : hariIniIso());
    }
    if (window.location.search) {
      window.history.replaceState(
        {},
        "",
        window.location.pathname + window.location.hash,
      );
    }
  }, []);

  // Persist non-today picks so a refresh-within-session restores
  // them. Today is *cleared* (not just skipped) so the slot doesn't
  // keep returning a stale past pick on the next hydration — e.g.
  // user picks 2026-08-15 (slot = "2026-08-15"), then picks today
  // and refreshes; without the clear, the next hydration would
  // read "2026-08-15" and the DatePicker would land back on that
  // past date instead of today.
  useEffect(() => {
    if (date === null) return;
    if (date === hariIniIso()) {
      safeRemoveItem(STORAGE_KEYS.sahamRecapDate);
      return;
    }
    safeSetItem(STORAGE_KEYS.sahamRecapDate, date);
  }, [date]);

  // Inactivity timer — see header for the full lifecycle.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (date === null) return;
    // No session to track when the date is already today — the
    // page either landed fresh or the previous session already
    // expired. Re-arming would either be a no-op (timer fires,
    // setDate(today) skips re-render) or waste cycles.
    if (date === hariIniIso()) return;

    let timerId: number | undefined;
    const arm = () => {
      if (timerId !== undefined) window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        setDate(hariIniIso());
        timerId = undefined;
      }, RECAP_DATE_INACTIVITY_MS);
    };
    const onActivity = () => arm();
    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, onActivity, { passive: true }),
    );
    arm();

    return () => {
      if (timerId !== undefined) window.clearTimeout(timerId);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [date]);

  return [date ?? hariIniIso(), setDate] as const;
}