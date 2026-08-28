"use client";

/**
 * `/profile/whatsapp/` — Kirim Berita ke WhatsApp tab. Thin
 * orchestrator: composes the phone, verification, and broadcast
 * widgets from their form hooks. Wire-format invariants
 * (`notified_* = false` when the toggle is off, prefix
 * normalisation before comparing) live in the hooks, not here.
 */

import { useCallback } from "react";
import { Wallet } from "lucide-react";

import { useBroadcastSettingsForm } from "@/lib/hooks/useBroadcastSettingsForm";
import { useGetUserInformation } from "@/lib/hooks/useGetUserInformation";
import { useGetWallet } from "@/lib/hooks/useGetWallet";
import { usePhoneForm } from "@/lib/hooks/usePhoneForm";

import { track, EVENTS } from "@/lib/analytics-events";

import { Shimmer } from "@/components/Shimmer";
import { FrequencyCard } from "@/components/profile/whatsapp/FrequencyCard";
import { MessagePreviewCard } from "@/components/profile/whatsapp/MessagePreviewCard";
import { NotificationToggleCard } from "@/components/profile/whatsapp/NotificationToggleCard";
import { PerbaruiButton } from "@/components/profile/whatsapp/PerbaruiButton";
import { PhoneNumberCard } from "@/components/profile/whatsapp/PhoneNumberCard";
import { VerificationCard } from "@/components/profile/whatsapp/VerificationCard";
import { WhatsappPageHeader } from "@/components/profile/whatsapp/WhatsappPageHeader";

export default function WhatsappPage() {
  const phone = usePhoneForm();
  const broadcast = useBroadcastSettingsForm();
  // Read the saved wire `phoneNumber` directly so the
  // `VerificationCard` can show where the OTP was sent
  // ("dikirim ke +62…"). The OTP API itself resolves the
  // destination from the active user's record — we just need
  // it for the helper text.
  const { data: user } = useGetUserInformation();
  // Live coin balance — surfaced on this page as contextual
  // account info. Sourced from `GET wallet` (separate from
  // `users/me`) because the wallet endpoint also owns the
  // expiry/lot data the top-up page renders. The balance
  // itself is just the aggregate of remaining lots, so this
  // single hook call is enough for the display here.
  const { data: wallet, isLoading: isWalletLoading } = useGetWallet();
  // Single source of truth for "is this user's number verified".
  // Used both to gate `VerificationCard` rendering and to disable
  // the broadcast toggle — the OTP flow flips it via the user-
  // info cache invalidation → refetch chain.
  const isVerified = Boolean(phone.verifiedAt);
  // The OTP API sends to the user's saved number on file. If the
  // user hasn't saved one yet (or the field landed as `null` / a
  // whitespace-only string), there's nothing to verify — the
  // `<VerificationCard />` would just show a dead CTA, so we
  // collapse it. The `<PhoneNumberCard />` above is where the
  // number actually gets set; once it lands and is saved, this
  // gate re-opens and the card mounts on the next render.
  const savedPhoneNumber = user?.phoneNumber?.trim() ?? null;
  const hasSavedPhoneNumber = Boolean(savedPhoneNumber);

  // Defense-in-depth on top of `NotificationToggleCard`'s own
  // `disabled` UI: the page refuses to mutate state if the
  // verification gate isn't open, in case any future child ever
  // fires `onToggle` while the button is rendered disabled.
  const handleToggle = useCallback(() => {
    if (!isVerified) return;
    // The toggle flip is INTENT — `broadcast_settings_saved` is
    // CONVERSION (fired from `useBroadcastSettingsForm.save`).
    // Splitting them lets GA read the drop-off between toggle
    // and "Perbarui" commit.
    track(EVENTS.broadcast_toggled, { enabled: !broadcast.enabled });
    broadcast.setEnabled(!broadcast.enabled);
  }, [isVerified, broadcast]);

  return (
    <div className="flex flex-col gap-4">
      <WhatsappPageHeader verifiedAt={phone.verifiedAt} />
      {/* Koin balance — read-only display. Stays informational
          (no "Top up" CTA) because this page's primary purpose is
          WhatsApp notification setup, not wallet management;
          the top-up page owns the full CoinBalanceCard with
          expiring lots. Renders "0 koin" while the wallet fetch
          is in flight or after an error so a transient network
          failure doesn't leave an empty slot. */}
      <section
        className="flex items-center gap-3 rounded-lg border border-border bg-bg-secondary p-4"
        aria-label="Saldo koin saat ini"
      >
        <span
          aria-hidden
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"
        >
          <Wallet className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-widest text-text-muted">
            Koin saat ini
          </p>
          {isWalletLoading ? (
            <Shimmer aria-busy="true" className="mt-1 h-6 w-24" />
          ) : (
            <p
              className="mt-0.5 font-mono text-[28px] font-bold tabular-nums text-text-primary"
              aria-label={`${wallet?.balance ?? 0} koin`}
            >
              {(wallet?.balance ?? 0).toLocaleString("id-ID")}
              <span className="ml-1 font-mono text-[12px] font-medium text-text-muted">
                koin
              </span>
            </p>
          )}
        </div>
      </section>
      <PhoneNumberCard
        phone={phone.phone}
        onPhoneChange={phone.setPhone}
        showSave={phone.showSave}
        isSaving={phone.isSaving}
        error={phone.saveError}
        onSave={phone.onSave}
      />
      {/* Self-unmounts once `verifiedAt` flips: `useVerifyPhone`
          invalidates the user-info cache on success → hook
          refetches → `phone.verifiedAt` becomes truthy. Also
          hidden until a phone number is actually saved on file —
          there's nothing to verify without a candidate number. */}
      {!isVerified && hasSavedPhoneNumber && (
        <VerificationCard phoneNumber={savedPhoneNumber} />
      )}
      <NotificationToggleCard
        enabled={broadcast.enabled}
        disabled={!isVerified}
        onToggle={handleToggle}
      />
      {broadcast.enabled && (
        <FrequencyCard
          frequencies={broadcast.frequencies}
          onToggle={broadcast.toggleFrequency}
        />
      )}
      {/* `isReady` hides the save button during first paint:
          before the GET resolves, baselines match placeholder
          local state and `isDirty` is falsely `false`. */}
      {broadcast.isReady && broadcast.isDirty && (
        <PerbaruiButton
          onClick={broadcast.save}
          isSaving={broadcast.isSaving}
          error={broadcast.saveError}
        />
      )}
      <MessagePreviewCard />
    </div>
  );
}
