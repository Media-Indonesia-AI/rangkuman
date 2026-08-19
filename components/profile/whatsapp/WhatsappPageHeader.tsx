"use client";

/**
 * Header card for the WhatsApp-profile tab. Pure presentation —
 * no state, no props. Title + subtitle render the page's identity;
 * the rest of the page stacks cards below this on a `flex-col`
 * with `gap-4`. The Sparkles icon and brand-coloured sizing keep
 * the visual rhythm consistent with the other profile tabs.
 */

import { Sparkles } from "lucide-react";

export function WhatsappPageHeader() {
  return (
    <header className="border-b border-border-strong pb-3">
      <div className="mb-1 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-text-primary sm:text-[26px]">
          WhatsApp
        </h1>
      </div>
      <p className="mt-1 text-[12.5px] leading-[1.55] text-text-muted">
        Aktifin notifikasi WhatsApp biar gak ketinggalan cerita
        penting.
      </p>
    </header>
  );
}