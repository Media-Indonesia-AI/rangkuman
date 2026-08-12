"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getWatchlist,
  watchlistAdd,
  watchlistRemove,
  watchlistToggle,
  isInWatchlist as isInWatchlistRaw,
  WATCHLIST_LIMIT,
  subscribe,
} from "@/lib/auth";
import { STORAGE_EVENT, STORAGE_KEYS } from "@/lib/storageKeys";

/** Hook that gives reactive access to the watchlist. */
export function useWatchlist() {
  const [snapshot, setSnapshot] = useState(getWatchlist);

  useEffect(() => {
    setSnapshot(getWatchlist());
    const refresh = () => setSnapshot(getWatchlist());
    const off = subscribe(refresh);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.watchlist || e.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(STORAGE_EVENT, refresh as EventListener);
    return () => {
      off();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(STORAGE_EVENT, refresh as EventListener);
    };
  }, []);

  const codes = snapshot.codes;
  const isFull = codes.length >= WATCHLIST_LIMIT;
  const isIn = useCallback((kode: string) => codes.includes(kode.toUpperCase()), [codes]);

  return {
    codes,
    isFull,
    isIn,
    add: (kode: string) => watchlistAdd(kode),
    remove: (kode: string) => watchlistRemove(kode),
    toggle: (kode: string) => watchlistToggle(kode),
  };
}

/** Convenience boolean for a single ticker. */
export function useIsInWatchlist(kode: string): boolean {
  const [inList, setInList] = useState(false);
  useEffect(() => {
    setInList(isInWatchlistRaw(kode));
    const refresh = () => setInList(isInWatchlistRaw(kode));
    const off = subscribe(refresh);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.watchlist || e.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(STORAGE_EVENT, refresh as EventListener);
    return () => {
      off();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(STORAGE_EVENT, refresh as EventListener);
    };
  }, [kode]);
  return inList;
}
