"use client";

/**
 * Sub-tab session for `/saham`.
 *
 * Two concerns bundled into one hook because they share the same
 * `subTab` state and would otherwise tangle the page:
 *
 *   1. **localStorage persistence** — read on mount, write on
 *      change. Lands the user back on their last tab after reload
 *      or back-navigation.
 *   2. **Tab-view tracking** — fires the `saham_tab_*_view` GA4
 *      event with a `source: "initial" | "switch"` discriminator
 *      so the report can split "which tab did the visitor land
 *      on" from "which tab did they switch to mid-session".
 *      (The URL doesn't change on tab switches — it's client-side
 *      state — so the global `page_view` tracker misses them.)
 *
 * Returns `[subTab, setSubTab]`:
 *   - `subTab` is `null` only during the pre-hydration render, so
 *     the page can render a static chrome shell (no tab UI, no
 *     tab content) until localStorage resolves. Avoids flashing
 *     the default "recap" content when the user's persisted
 *     choice is "sektor".
 *   - `setSubTab` accepts the resolved `SahamTab` (the null
 *     sentinel is internal to the hook).
 *
 * Mirrors the `useRecapDateSession` shape — both own a "session"
 * (transient UI state the page needs on every visit) and return
 * `[value, setValue]` with a pre-hydration null sentinel.
 */

import { useEffect, useRef, useState } from "react";

import type { SahamTab } from "@/components/saham/SahamSubTabs";
import { EVENTS, track, type EventName } from "@/lib/analytics-events";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { safeGetItem, safeSetItem } from "@/lib/util/safeLocalStorage";

/** Type guard for the persisted sub-tab — ignores anything other
 *  than the two known tabs (defensive against manual localStorage
 *  edits and version skew across deploys). */
function isSahamTab(value: unknown): value is SahamTab {
  return value === "recap" || value === "sektor";
}

const TAB_EVENT: Record<SahamTab, EventName> = {
  recap: EVENTS.saham_tab_recap_view,
  sektor: EVENTS.saham_tab_sektor_view,
};

export function useSahamTabSession(): readonly [
  subTab: SahamTab | null,
  setSubTab: (next: SahamTab) => void,
] {
  const [subTab, setSubTab] = useState<SahamTab | null>(null);
  // Ref (not state) so flipping it doesn't trigger a re-render —
  // nothing else in the tree reads it.
  const isFirstRender = useRef(true);

  // Hydrate from localStorage on mount. Pre-hydration renders see
  // `subTab === null` so they skip the tab UI entirely.
  useEffect(() => {
    const raw = safeGetItem(STORAGE_KEYS.sahamTab);
    setSubTab(isSahamTab(raw) ? raw : "recap");
  }, []);

  // Persist on change. The null-guard keeps the empty `useState`
  // value (pre-hydration) from clobbering the user's saved tab on
  // the very first effect tick.
  useEffect(() => {
    if (subTab === null) return;
    safeSetItem(STORAGE_KEYS.sahamTab, subTab);
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
