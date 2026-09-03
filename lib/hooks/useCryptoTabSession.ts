"use client";

/**
 * Sub-tab session for `/crypto`.
 *
 * Two concerns bundled into one hook because they share the same
 * `subTab` state and would otherwise tangle the page:
 *
 *   1. **localStorage persistence** — read on mount, write on
 *      change. Lands the user back on their last pillar
 *      (Recap vs Pasar) after reload or back-navigation.
 *   2. **Tab-view tracking** — fires the `crypto_tab_*_view`
 *      GA4 event with a `source: "initial" | "switch"`
 *      discriminator so the report can split "which pillar did
 *      the visitor land on" from "which pillar did they switch
 *      to mid-session". (The URL doesn't change on tab switches
 *      — it's client-side state — so the global `page_view`
 *      tracker misses them.)
 *
 * Returns `[subTab, setSubTab]`:
 *   - `subTab` is `null` only during the pre-hydration render, so
 *     the page can render a static chrome shell (no tab UI, no
 *     tab content) until localStorage resolves. Avoids flashing
 *     the default "top" content when the user's persisted choice
 *     is "pasar".
 *   - `setSubTab` accepts the resolved `CryptoSubNavValue` (the
 *     null sentinel is internal to the hook).
 *
 * Mirrors the `useSahamTabSession` shape — both own a "session"
 * (transient UI state the page needs on every visit) and return
 * `[value, setValue]` with a pre-hydration null sentinel.
 */

import { useEffect, useRef, useState } from "react";

import type { CryptoSubNavValue } from "@/components/CryptoSubNav";
import { EVENTS, track, type EventName } from "@/lib/analytics-events";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { safeGetItem, safeSetItem } from "@/lib/util/safeLocalStorage";

/** Type guard for the persisted sub-tab — ignores anything other
 *  than the two known tabs (defensive against manual localStorage
 *  edits and version skew across deploys). */
function isCryptoTab(value: unknown): value is CryptoSubNavValue {
  return value === "top" || value === "pasar";
}

/** Map each resolved tab to its GA4 event name. Kept as a
 *  `Record` so adding a tab is a one-line change and the
 *  `track()` call stays branch-free. */
const TAB_EVENT: Record<CryptoSubNavValue, EventName> = {
  top: EVENTS.crypto_tab_recap_view,
  pasar: EVENTS.crypto_tab_pasar_view,
};

export function useCryptoTabSession(): readonly [
  subTab: CryptoSubNavValue | null,
  setSubTab: (next: CryptoSubNavValue) => void,
] {
  const [subTab, setSubTab] = useState<CryptoSubNavValue | null>(null);
  // Ref (not state) so flipping it doesn't trigger a re-render —
  // nothing else in the tree reads it.
  const isFirstRender = useRef(true);

  // Hydrate from localStorage on mount. Pre-hydration renders see
  // `subTab === null` so they skip the tab UI entirely.
  useEffect(() => {
    const raw = safeGetItem(STORAGE_KEYS.cryptoTab);
    setSubTab(isCryptoTab(raw) ? raw : "top");
  }, []);

  // Persist on change. The null-guard keeps the empty `useState`
  // value (pre-hydration) from clobbering the user's saved tab on
  // the very first effect tick.
  useEffect(() => {
    if (subTab === null) return;
    safeSetItem(STORAGE_KEYS.cryptoTab, subTab);
  }, [subTab]);

  // GA4 tab-view tracking with `source: "initial" | "switch"`.
  useEffect(() => {
    if (subTab === null) return;
    track(TAB_EVENT[subTab], {
      source: isFirstRender.current ? "initial" : "switch",
    });
    isFirstRender.current = false;
  }, [subTab]);

  return [subTab, setSubTab] as const;
}
