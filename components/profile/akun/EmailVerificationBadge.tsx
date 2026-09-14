"use client";

import { CheckCircle2 } from "lucide-react";

interface EmailVerificationBadgeProps {
  /** Whether the user's email has been verified. Drives the
   *  green verified chip vs. the muted pending chip. */
  verified: boolean;
}

/** Email-verified status pill rendered in the right adornment
 *  slot of the Email info row. Same palette / typography family
 *  as `<VerifiedBadge />` in `components/profile/whatsapp/` —
 *  the two surfaces read as one badge family across the profile
 *  route.
 *
 *  The chip always renders — there's no `null` branch — so the
 *  slot is never empty and the user can tell their verification
 *  status at a glance. */
export function EmailVerificationBadge({ verified }: EmailVerificationBadgeProps) {
  return verified ? (
    <span className="inline-flex items-center gap-0.5 rounded-full border border-bullish-line bg-bullish-soft px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-bullish">
      <CheckCircle2 className="h-2.5 w-2.5" aria-hidden />
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-muted">
      Belum verified
    </span>
  );
}
