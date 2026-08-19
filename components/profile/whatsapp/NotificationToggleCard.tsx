"use client";

/**
 * Master "aktifkan notifikasi" toggle card. Controlled component —
 * the page owns the `enabled` boolean and decides what the click
 * does; the widget only renders the visual switch.
 *
 * Off-by-default so the user has to opt-in. The toggle is the
 * single source-of-truth signal that something has fundamentally
 * changed (the Perbarui button gates on `enabled !== savedEnabled`),
 * even though the frequency-card state may drift independently.
 */

import { ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationToggleCard({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-secondary p-4">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-text-primary">
          Aktifkan Pengiriman Berita Ke Whatsapp
        </p>
        <p className="mt-0.5 text-[11.5px] text-text-muted">
          Kirim ringkasan cerita langsung ke WhatsApp.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Aktifkan notifikasi WhatsApp"
        onClick={onToggle}
        className={cn(
          "inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors",
          enabled ? "bg-brand" : "bg-bg-tertiary",
        )}
      >
        {enabled ? (
          <ToggleRight className="h-6 w-6 text-bg-primary" aria-hidden />
        ) : (
          <ToggleLeft className="h-6 w-6 text-text-faint" aria-hidden />
        )}
      </button>
    </section>
  );
}