"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, subscribe, type User } from "@/lib/auth";
import { STORAGE_EVENT, STORAGE_KEYS } from "@/lib/storageKeys";

/** React hook for the current signed-in user (read from the
 *  localStorage session written by `loginWithIdentifier` /
 *  `loginWithGoogle` / `registerUser`). Returns `undefined` while
 *  localStorage hydration is in flight, `null` when the user is
 *  logged out, and the populated `User` object once the session
 *  has resolved. */
export function useCurrentUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);

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
