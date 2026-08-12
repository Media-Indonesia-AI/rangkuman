"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, subscribe, type MockUser } from "@/lib/auth";
import { STORAGE_EVENT, STORAGE_KEYS } from "@/lib/storageKeys";

/** React hook for the current mock user. Returns null while loading. */
export function useCurrentUser(): MockUser | null | undefined {
  const [user, setUser] = useState<MockUser | null | undefined>(undefined);

  useEffect(() => {
    setUser(getCurrentUser());
    const refresh = () => setUser(getCurrentUser());
    refresh();

    const off = subscribe(refresh);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.user || e.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(STORAGE_EVENT, refresh as EventListener);

    return () => {
      off();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(STORAGE_EVENT, refresh as EventListener);
    };
  }, []);

  return user;
}
