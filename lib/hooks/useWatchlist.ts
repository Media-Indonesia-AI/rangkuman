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

/** Hook that gives reactive access to the watchlist. */
export function useWatchlist() {
  const [snapshot, setSnapshot] = useState(getWatchlist);

  useEffect(() => {
    setSnapshot(getWatchlist());
    const refresh = () => setSnapshot(getWatchlist());
    const off = subscribe(refresh);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "beritainvestor:watchlist" || e.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("beritainvestor:storage", refresh as EventListener);
    return () => {
      off();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("beritainvestor:storage", refresh as EventListener);
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
      if (e.key === "beritainvestor:watchlist" || e.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("beritainvestor:storage", refresh as EventListener);
    return () => {
      off();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("beritainvestor:storage", refresh as EventListener);
    };
  }, [kode]);
  return inList;
}
