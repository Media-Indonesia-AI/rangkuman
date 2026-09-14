"use client";

import { KeyRound, Mail, Sparkles, User as UserIcon } from "lucide-react";
import type { User } from "@/lib/api";
import { EmailVerificationBadge } from "./EmailVerificationBadge";
import { InfoRow } from "./InfoRow";

interface InfoTableProps {
  user: User;
  /** Pre-formatted Indonesian date string for the "Member
   *  sejak" row — derived in the page from
   *  `loggedInAt ?? createdAt`. */
  joinedAt: string;
}

/** Five-row info table on the Akun section: Nama / Email /
 *  Username / Provider / Member sejak. All rows are read-only
 *  display today; the Email row additionally renders an
 *  `<EmailVerificationBadge />` in its right adornment slot
 *  and uses mono type for the value. */
export function InfoTable({ user, joinedAt }: InfoTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
      <InfoRow label="Nama" icon={UserIcon} value={user.name} />
      <InfoRow
        label="Email"
        icon={Mail}
        value={user.email}
        mono
        rightAdornment={
          <EmailVerificationBadge verified={Boolean(user.isEmailVerified)} />
        }
      />
      <InfoRow label="Username" icon={UserIcon} value={user.username} />
      <InfoRow
        label="Provider"
        icon={KeyRound}
        value={user.provider === "google" ? "Google" : "Email"}
      />
      <InfoRow label="Member sejak" icon={Sparkles} value={joinedAt} />
    </section>
  );
}
