"use client";

import { useEffect, useState, useCallback } from "react";
import { getSaved, isSaved, toggleSaved, type SavedItemKind, type SavedItem } from "@/lib/saved";
import { SAVED_EVENT, STORAGE_KEYS } from "@/lib/storageKeys";

/**
 * React hook for saved items. Listens for the custom
 * `berita-investor:saved-changed` event (canonical name exported
 * from `lib/storageKeys.ts`) so any mutation anywhere in the tree
 * updates the badge/count without requiring a full re-render of
 * consumers.
 */
export function useSaved() {
  const [items, setItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    setItems(getSaved());
    const refresh = () => setItems(getSaved());
    const onCustom = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.saved) refresh();
    };
    window.addEventListener(SAVED_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(SAVED_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const check = useCallback((id: string) => isSaved(id), []);

  const toggle = useCallback(
    (id: string, kind: SavedItemKind, publishedAt: string) => {
      const nowSaved = toggleSaved(id, kind, publishedAt);
      setItems(getSaved());
      return nowSaved;
    },
    [],
  );

  return { items, count: items.length, check, toggle };
}
