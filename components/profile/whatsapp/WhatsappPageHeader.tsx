"use client";

/**
 * Header card for the WhatsApp-profile tab. Title + subtitle
 * render the page's identity; the rest of the page stacks cards
 * below this on a `flex-col` with `gap-4`. The Sparkles icon and
 * brand-coloured sizing keep the visual rhythm consistent with
 * the other profile tabs.
 *
 * The title row is `flex justify-between` so the verified status
 * chip can anchor to the right edge. The badge represents
 * page-level integration health — it's a two-state chip (green
 * `VERIFIED` when set, muted `BELUM DIVERIFIKASI` when not), so
 * the right slot is always populated. The user always knows
 * their integration status at a glance, above the input card,
 * rather than buried next to the field.
 */

import { Sparkles } from "lucide-react";

import { VerifiedBadge } from "@/components/profile/whatsapp/VerifiedBadge";

export function WhatsappPageHeader({
  verifiedAt,
}: {
  /** ISO timestamp from `User.phoneNumberVerifiedAt`. The chip
   *  always renders — green `VERIFIED` when this is set, muted
   *  `BELUM DIVERIFIKASI` when `null` / `undefined`. The user
   *  sees their integration status continuously; the chip never
   *  disappears. */
  verifiedAt?: string | null;
}) {
  return (
    <header className="border-b border-border-strong pb-3">
      <div className="mb-1 flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
          <h1 className="text-[22px] font-bold leading-tight tracking-tight text-text-primary sm:text-[26px]">
            WhatsApp
          </h1>
        </div>
        {/* Right-anchored status chip — always present so the
            user can tell at a glance whether their number is
            verified. The chip is small and the header has
            plenty of horizontal room, so it never pushes the
            title to wrap on viewports down to ~320px (the
            smallest we design for). */}
        <VerifiedBadge verifiedAt={verifiedAt} />
      </div>
      <p className="mt-1 text-[12.5px] leading-[1.55] text-text-muted">
        Aktifin notifikasi WhatsApp biar gak ketinggalan cerita
        penting.
      </p>
    </header>
  );
}