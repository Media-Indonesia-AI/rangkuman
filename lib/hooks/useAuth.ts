"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, subscribe, type MockUser } from "@/lib/auth";

/** React hook for the current mock user. Returns null while loading. */
export function useCurrentUser(): MockUser | null | undefined {
  const [user, setUser] = useState<MockUser | null | undefined>(undefined);

  useEffect(() => {
    setUser(getCurrentUser());
    const refresh = () => setUser(getCurrentUser());
    refresh();

    const off = subscribe(refresh);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "beritainvestor:user" || e.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("beritainvestor:storage", refresh as EventListener);

    return () => {
      off();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("beritainvestor:storage", refresh as EventListener);
    };
  }, []);

  return user;
}
