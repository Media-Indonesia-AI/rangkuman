"use client";

/**
 * Two-state status badge for the WhatsApp phone-number card.
 * Mirrors the established profile-badge pattern at
 * `ProfilePage.tsx` (the email-verified row): the chip always
 * renders so the user can tell their integration status at a
 * glance — never `null`. Visual states:
 *
 *   - **Verified** — `user.phoneNumberVerifiedAt` is a truthy
 *     ISO timestamp. Green palette (`text-bullish` /
 *     `bg-bullish-soft` / `border-bullish-line`) + `CheckCircle2`
 *     icon + uppercase `VERIFIED` label. Identical to the
 *     email-verified chip on the profile page so the two
 *     surfaces read as one family.
 *   - **Not yet verified** — `phoneNumberVerifiedAt` is
 *     `null` / `undefined`. Muted palette (`text-text-muted` /
 *     `bg-bg-tertiary` / `border-border`) + uppercase
 *     `BELUM DIVERIFIKASI` label + no icon. Matches the
 *     `Belum verified` chip on the email row.
 *
 * The verified state's ISO timestamp is exposed via `title` for
 * a native hover tooltip — no per-row layout space committed to
 * a formatted date. The not-verified state has no tooltip.
 *
 * Stateless and pure — no hooks, no effects. The page decides
 * what `verifiedAt` is (driven by `useGetUserInformation` →
 * `user.phoneNumberVerifiedAt`) and passes the value down.
 */

import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function VerifiedBadge({
  verifiedAt,
  className,
}: {
  /** ISO timestamp from `User.phoneNumberVerifiedAt`. When
   *  truthy, renders the green verified chip; when `null` /
   *  `undefined`, renders the muted pending chip. */
  verifiedAt?: string | null;
  /** Optional className passthrough so the parent can
   *  fine-tune layout (e.g. push the chip to the right edge
   *  of a flex row). */
  className?: string;
}) {
  const isVerified = Boolean(verifiedAt);

  return (
    <span
      title={
        isVerified
          ? // Native tooltip — surfaces the raw ISO timestamp
            // without committing layout space to a formatted
            // date. Browsers render it as a small popover on
            // hover/focus.
            `Diverifikasi pada ${verifiedAt}`
          : undefined
      }
      aria-label={isVerified ? "Nomor WhatsApp terverifikasi" : "Nomor WhatsApp belum diverifikasi"}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest",
        isVerified
          ? // Green / bullish — identical palette to the
            // email-verified chip on the profile page.
            "border-bullish-line bg-bullish-soft text-bullish"
          : // Muted / neutral — no icon, no green, just a
            // passive status marker so the slot is never
            // empty. Same palette as the "Belum verified"
            // email chip.
            "border-border bg-bg-tertiary text-text-muted",
        className,
      )}
    >
      {isVerified && <CheckCircle2 className="h-2.5 w-2.5" aria-hidden />}
      {isVerified ? "Verified" : "Belum diverifikasi"}
    </span>
  );
}
