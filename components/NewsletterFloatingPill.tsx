"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Mail, X } from "lucide-react";
import { isPillDismissed, dismissPill } from "@/lib/newsletter";
import { cn } from "@/lib/utils";

interface NewsletterFloatingPillProps {
  className?: string;
}

/** Pill navigates here when clicked. Kept as a constant so the
 *  hide-while-here check and the push target can never drift. */
const WHATSAPP_PATH = "/profile/whatsapp/";

/**
 * Floating "Kirim Berita ke WhatsApp" pill. Stays in the bottom-right
 * corner. Click → navigates to `/profile/whatsapp/`. Hidden while
 * already on that page so it doesn't suggest the action the user is
 * already on. Dismissible; remember the dismiss for 24h so it doesn't
 * reappear immediately.
 */
export function NewsletterFloatingPill({ className }: NewsletterFloatingPillProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // Hide while the user is already on the destination page. Pathname
  // is technically `string | null`; treat null as "not on the page".
  const onWhatsapp = pathname?.startsWith(WHATSAPP_PATH) ?? false;

  useEffect(() => {
    if (onWhatsapp) {
      setVisible(false);
      return;
    }
    // Don't show if already dismissed within 24h
    if (isPillDismissed()) return;
    setVisible(true);
  }, [onWhatsapp]);

  if (!visible) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissPill();
    setVisible(false);
  };

  return (
    <button
      type="button"
      onClick={() => router.push(WHATSAPP_PATH)}
      className={cn(
        "group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full border border-border bg-bg-secondary py-2 pl-2 pr-3 text-[12.5px] font-semibold text-text-primary shadow-2xl transition-all hover:border-brand hover:bg-bg-tertiary",
        "animate-fade-up",
        className,
      )}
      aria-label="Buka menu WhatsApp"
    >
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand">
        <Mail className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span className="pr-1">Kirim Berita ke WhatsApp</span>
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
  );
}