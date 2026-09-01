"use client";

/**
 * Sub-tab session for `/crypto`.
 *
 * Mirrors the `useSahamTabSession` shape — owns a single
 * `subTab` value that:
 *
 *   1. **Persists across refresh** via localStorage so a reload
 *      or back-navigation lands the user on their last pillar
 *      (Recap vs Pasar) instead of always defaulting to Recap.
 *   2. **Pre-hydration null sentinel** — `subTab` is `null`
 *      during the very first render (before the localStorage
 *      read resolves), so the page renders a static chrome
 *      shell with no tab UI + no tab content. Avoids flashing
 *      the default "top" / Recap content when the persisted
 *      choice is "pasar".
 *
 * No GA4 tab-view tracking yet — the `/crypto` page doesn't
 * have dedicated tab-view events registered
 * (`lib/analytics-events.ts`). Add tracking in a follow-up if
 * `/crypto` ever needs the `source: "initial" | "switch"`
 * split the `/saham` hook provides.
 */

import { useEffect, useState } from "react";

import type { CryptoSubNavValue } from "@/components/CryptoSubNav";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { safeGetItem, safeSetItem } from "@/lib/util/safeLocalStorage";

/** Type guard for the persisted sub-tab — ignores anything other
 *  than the two known tabs (defensive against manual localStorage
 *  edits and version skew across deploys). */
function isCryptoTab(value: unknown): value is CryptoSubNavValue {
  return value === "top" || value === "pasar";
}

export function useCryptoTabSession(): readonly [
  subTab: CryptoSubNavValue | null,
  setSubTab: (next: CryptoSubNavValue) => void,
] {
  const [subTab, setSubTab] = useState<CryptoSubNavValue | null>(null);

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

  return [subTab, setSubTab] as const;
}
