"use client";

import { useCurrentUser } from "@/lib/hooks/useAuth";
import { formatTanggalIndonesia } from "@/lib/util/formatDate";
import { AkunPageHeader } from "@/components/profile/akun/AkunPageHeader";
import { IdentityCard } from "@/components/profile/akun/IdentityCard";
import { InfoTable } from "@/components/profile/akun/InfoTable";
import { IdBadge } from "@/components/profile/akun/IdBadge";

/** `/profile/` — Akun tab. Read-only summary of the signed-in
 *  user: name, email, username, provider, member-since. Each
 *  visible piece lives in a focused widget under
 *  `components/profile/akun/`; this file only owns the section
 *  composition (null gate, `joinedAt` derivation, JSX). */
export default function ProfilePage() {
  const user = useCurrentUser();
  // The layout already gates on `user === null | undefined`, so
  // by the time we render here `user` is the populated session
  // object. The null check is a defence-in-depth no-op for the
  // logged-out path and lets the JSX stay terse.
  if (!user) return null;

  // `loggedInAt` is a client-only session field populated by
  // `loginWithIdentifier` / `loginWithGoogle` / `registerUser` —
  // guaranteed on a session from any of those flows. Fallback
  // to `createdAt` (server-side) covers the edge case where the
  // session is somehow missing the field.
  const joinedAt = formatTanggalIndonesia(
    (user.loggedInAt ?? user.createdAt).slice(0, 10),
  );

  return (
    <div className="flex flex-col gap-4">
      <AkunPageHeader
        eyebrow="Akun"
        title="Informasi akun"
        subheader="Detail akun di Rangkuman. Edit profil bakal tersedia segera."
      />

      <IdentityCard name={user.name} email={user.email} />

      <InfoTable user={user} joinedAt={joinedAt} />

      {user.id && <IdBadge id={user.id} />}
    </div>
  );
}
