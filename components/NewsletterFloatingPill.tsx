"use client";

import { useState, useEffect } from "react";
import { Mail, X } from "lucide-react";
import { isPillDismissed, dismissPill } from "@/lib/newsletter";
import { NewsletterModal } from "@/components/NewsletterModal";
import { cn } from "@/lib/utils";

interface NewsletterFloatingPillProps {
  className?: string;
}

/**
 * Floating "Subscribe to Recap Pagi" pill. Stays in the bottom-right corner.
 * Shows immediately. Dismissible; remember the dismiss for 24h so it doesn't
 * reappear immediately.
 */
export function NewsletterFloatingPill({ className }: NewsletterFloatingPillProps) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed within 24h
    if (isPillDismissed()) return;
    setVisible(true);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissPill();
    setVisible(false);
  };

  if (!visible && !open) return null;

  return (
    <>
      {/* Pill (only when not opening modal) */}
      {visible && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full border border-border bg-bg-secondary py-2 pl-2 pr-3 text-[12.5px] font-semibold text-text-primary shadow-2xl transition-all hover:border-brand hover:bg-bg-tertiary",
            "animate-fade-up",
            className,
          )}
          aria-label="Buka newsletter signup"
        >
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand">
            <Mail className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="pr-1">Langganan Berita Gratis</span>
          <span
            role="button"
            tabIndex={0}
            onClick={handleDismiss}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleDismiss(e as unknown as React.MouseEvent);
              }
            }}
            aria-label="Tutup"
            className="-mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-text-faint transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            <X className="h-3 w-3" aria-hidden />
          </span>
        </button>
      )}

      <NewsletterModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
