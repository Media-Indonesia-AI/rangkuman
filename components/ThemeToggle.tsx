"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { safeSetItem } from "@/lib/util/safeLocalStorage";

// Local alias — the canonical key lives in `lib/storageKeys.ts`
// alongside every other storage concern.
const STORAGE_KEY = STORAGE_KEYS.theme;

type Theme = "light" | "dark";

/** Tiny theme toggle button. Persists choice in localStorage. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    safeSetItem(STORAGE_KEY, next);
  };

  // Avoid hydration flicker — render placeholder until mounted
  if (theme === null) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-secondary"
        disabled
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Aktifkan light mode" : "Aktifkan dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-secondary text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary",
      )}
    >
      {theme === "dark" ? (
        <Sun className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Moon className="h-3.5 w-3.5" aria-hidden />
      )}
    </button>
  );
}
