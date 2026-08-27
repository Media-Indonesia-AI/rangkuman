"use client";

import { CheckCircle2, KeyRound, Mail, Pencil, Sparkles, User as UserIcon, type LucideIcon } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";
import { formatTanggalIndonesia } from "@/lib/util/formatDate";
import { track, EVENTS } from "@/lib/analytics-events";

/**
 * `/profile/` — Akun tab. Read-only summary of the signed-in user:
 * name, email, username, provider, member-since. Each row has a
 * pencil affordance that opens a "Coming soon" toast (no edit API
 * yet — wired up so the affordance exists, but the action is a
 * stub). The "Ganti password" button below the table fires the
 * same "Coming soon" toast.
 *
 * The section is rendered into the layout's right pane (the
 * `<ProfileLayout />` owns the auth gate, the sidebar, and the
 * tab title). This file only owns the section content.
 */
export default function ProfilePage() {
  const user = useCurrentUser();
  // The layout already gates on `user === null | undefined`, so
  // by the time we render here `user` is the populated session
  // object. The non-null assertion signals "the layout owns this
  // gate" to future readers and lets the JSX stay terse.
  if (!user) return null;

  const initial = (user.name.trim().charAt(0) || "?").toUpperCase();
  // `loggedInAt` is a client-only session field populated by
  // `loginWithIdentifier` / `loginWithGoogle` / `registerUser` —
  // guaranteed to be present on a session that came from any of
  // those flows. Fallback to `createdAt` (server-side) covers the
  // edge case where the session is somehow missing the field.
  const joinedAt = formatTanggalIndonesia(
    (user.loggedInAt ?? user.createdAt).slice(0, 10),
  );

  const handleNotImplemented = (surface: string) => () => {
    if (typeof window === "undefined") return;
    // One event for all "Coming soon" affordances on the Akun
    // tab. `surface` distinguishes which field the user tried
    // to edit so GA can group the demand signal: `name` /
    // `email` / `username` / `password`. The handler is a
    // factory so each InfoRow binds a different surface
    // string without re-reading the DOM.
    track(EVENTS.feature_not_implemented, { surface });
    window.dispatchEvent(
      new CustomEvent("berita-investor:toast", {
        detail: "Coming soon — lagi digarap.",
      }),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header strip — same eyebrow + title + subheader pattern
          the rest of the profile sections use. */}
      <header className="border-b border-border-strong pb-3">
        <div className="mb-1 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
          <span className="label text-text-secondary">Akun</span>
        </div>
        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-text-primary sm:text-[26px]">
          Informasi akun
        </h1>
        <p className="mt-1 text-[12.5px] leading-[1.55] text-text-muted">
          Detail akun di Rangkuman. Edit profil bakal tersedia segera.
        </p>
      </header>

      {/* Avatar + name card — large visual to greet the user by
          name on this tab. Mirrors the avatar bubble convention
          used in the sidebar / Navbar but at a larger size. */}
      <section className="flex items-center gap-3 rounded-lg border border-border bg-bg-secondary p-4">
        <span
          aria-hidden
          className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand/20 text-[20px] font-bold text-brand"
        >
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-text-primary">
            {user.name}
          </p>
          <p className="truncate text-[12px] text-text-muted">{user.email}</p>
        </div>
      </section>

      {/* Info table — same `dl` / `dt` / `dd` layout as
          <StockAboutPanel /> so the visual vocabulary is
          consistent across the app. Each row has a pencil
          affordance that opens a "Coming soon" toast. */}
      <section className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
        <InfoRow
          label="Nama"
          icon={UserIcon}
          value={user.name}
          onEdit={handleNotImplemented("name")}
        />
        <InfoRow
          label="Email"
          icon={Mail}
          value={user.email}
          rightAdornment={
            user.isEmailVerified ? (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-bullish-line bg-bullish-soft px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-bullish">
                <CheckCircle2 className="h-2.5 w-2.5" aria-hidden />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-muted">
                Belum verified
              </span>
            )
          }
          onEdit={handleNotImplemented("email")}
        />
        <InfoRow
          label="Username"
          icon={UserIcon}
          value={user.username}
          onEdit={handleNotImplemented("username")}
        />
        <InfoRow
          label="Provider"
          icon={KeyRound}
          value={user.provider === "google" ? "Google" : "Email"}
          noEdit
        />
        <InfoRow
          label="Member sejak"
          icon={Sparkles}
          value={joinedAt}
          noEdit
        />
      </section>

      {/* Ganti password — separate action row below the info table.
          Disabled "Coming soon" affordance so the user knows the
          entry point exists even though the API doesn't yet. */}
      <section className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-bg-secondary p-3.5">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-text-primary">
            Ganti password
          </p>
          <p className="mt-0.5 text-[11.5px] text-text-muted">
            Update password lo. Butuh konfirmasi password lama dulu.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNotImplemented("password")}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-bg-card px-3.5 text-[12.5px] font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
        >
          <KeyRound className="h-3.5 w-3.5" aria-hidden />
          Ganti password
        </button>
      </section>

      {/* ID badge — bottom of the section. Useful for support
          inquiries ("here's my user ID"). */}
      {user.id && (
        <p className="font-mono text-[10.5px] text-text-faint">
          User ID: <span className="text-text-muted">{user.id}</span>
        </p>
      )}
    </div>
  );
}

interface InfoRowProps {
  label: string;
  icon: LucideIcon;
  value: string;
  /** Optional right-side adornment (e.g. "Verified" badge). */
  rightAdornment?: React.ReactNode;
  /** When `true`, hides the pencil affordance. Used for read-only
   *  fields like "Provider" and "Member sejak". */
  noEdit?: boolean;
  /** Click handler for the pencil affordance. */
  onEdit?: () => void;
}

/** Single row in the Akun info table. Same borderless
 *  divider-separated layout as `<StockAboutPanel />` so the
 *  visual rhythm is consistent across the app. */
function InfoRow({
  label,
  icon: Icon,
  value,
  rightAdornment,
  noEdit,
  onEdit,
}: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-3.5 py-2.5 last:border-b-0">
      <Icon className="h-3.5 w-3.5 shrink-0 text-text-faint" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-text-muted">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 truncate text-[13px] text-text-primary",
            label === "Email" && "font-mono",
          )}
        >
          {value}
        </p>
      </div>
      {rightAdornment}
      {!noEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${label}`}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-faint transition-colors hover:bg-bg-tertiary hover:text-text-primary"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}
