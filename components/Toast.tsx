"use client";

import { useEffect, useState } from "react";
import { Check, BookmarkCheck, Bookmark, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastState {
  id: number;
  message: string;
  variant: "info" | "success" | "save";
}

let counter = 0;
const listeners = new Set<(t: ToastState) => void>();

/** Fire a global toast from anywhere in the app. */
export function showToast(message: string, variant: ToastState["variant"] = "info") {
  const t: ToastState = { id: ++counter, message, variant };
  listeners.forEach((fn) => fn(t));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    const add = (t: ToastState) => {
      setToasts((prev) => [...prev, t]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 2200);
    };
    listeners.add(add);
    return () => {
      listeners.delete(add);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-3 sm:bottom-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-center gap-2 rounded-md border bg-bg-primary px-3 py-2 text-[12.5px] text-text-primary shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-bottom-2",
            t.variant === "save"
              ? "border-brand/40"
              : t.variant === "success"
                ? "border-bullish/40"
                : "border-border-strong",
          )}
        >
          {t.variant === "save" ? (
            <BookmarkCheck className="h-3.5 w-3.5 text-brand" aria-hidden />
          ) : t.variant === "success" ? (
            <Check className="h-3.5 w-3.5 text-bullish" aria-hidden />
          ) : (
            <X className="h-3.5 w-3.5 text-text-muted" aria-hidden />
          )}
          <span className="font-medium">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
