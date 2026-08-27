"use client";

/**
 * `/profile/whatsapp/` — Kirim Berita ke WhatsApp tab. Thin
 * orchestrator: composes the phone, verification, and broadcast
 * widgets from their form hooks. Wire-format invariants
 * (`notified_* = false` when the toggle is off, prefix
 * normalisation before comparing) live in the hooks, not here.
 */

import { useCallback } from "react";

import { useBroadcastSettingsForm } from "@/lib/hooks/useBroadcastSettingsForm";
import { useGetUserInformation } from "@/lib/hooks/useGetUserInformation";
import { usePhoneForm } from "@/lib/hooks/usePhoneForm";

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
  // Single source of truth for "is this user's number verified".
  // Used both to gate `VerificationCard` rendering and to disable
  // the broadcast toggle — the OTP flow flips it via the user-
  // info cache invalidation → refetch chain.
  const isVerified = Boolean(phone.verifiedAt);

  // Defense-in-depth on top of `NotificationToggleCard`'s own
  // `disabled` UI: the page refuses to mutate state if the
  // verification gate isn't open, in case any future child ever
  // fires `onToggle` while the button is rendered disabled.
  const handleToggle = useCallback(() => {
    if (!isVerified) return;
    broadcast.setEnabled(!broadcast.enabled);
  }, [isVerified, broadcast]);

  return (
    <div className="flex flex-col gap-4">
      <WhatsappPageHeader verifiedAt={phone.verifiedAt} />
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
          refetches → `phone.verifiedAt` becomes truthy. */}
      {!isVerified && (
        <VerificationCard phoneNumber={user?.phoneNumber ?? null} />
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
