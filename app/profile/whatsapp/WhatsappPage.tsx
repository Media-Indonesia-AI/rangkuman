"use client";

/**
 * `/profile/whatsapp/` — Kirim Berita ke WhatsApp tab.
 *
 * Thin orchestrator. Composition only — the heavy lifting lives
 * in the two form hooks:
 *
 *   - `usePhoneForm`            — phone input + dirty check +
 *                                 save handler.
 *   - `useBroadcastSettingsForm` — toggle + frequency set +
 *                                 dirty check + save handler.
 *
 * The page binds the two hooks' outputs to the widgets and
 * decides where each save button renders. The wire-format
 * invariants (force `notified_* = false` when the toggle is
 * off, normalise phone prefixes before comparing) live inside
 * the hooks, not here.
 *
 * Visual widgets (under `@/components/profile/whatsapp/`):
 *   - `WhatsappPageHeader`     — page title + subtitle.
 *   - `PhoneNumberCard`        — input + inline `UpdateWhatsappButton`.
 *   - `NotificationToggleCard` — master on/off switch.
 *   - `FrequencyCard`          — pagi / siang / sore checkboxes.
 *   - `PerbaruiButton`         — broadcast-settings save button + inline error.
 *   - `MessagePreviewCard`     — static "Preview pesan" sample.
 */

import { useBroadcastSettingsForm } from "@/lib/hooks/useBroadcastSettingsForm";
import { usePhoneForm } from "@/lib/hooks/usePhoneForm";

import { FrequencyCard } from "@/components/profile/whatsapp/FrequencyCard";
import { MessagePreviewCard } from "@/components/profile/whatsapp/MessagePreviewCard";
import { NotificationToggleCard } from "@/components/profile/whatsapp/NotificationToggleCard";
import { PerbaruiButton } from "@/components/profile/whatsapp/PerbaruiButton";
import { PhoneNumberCard } from "@/components/profile/whatsapp/PhoneNumberCard";
import { WhatsappPageHeader } from "@/components/profile/whatsapp/WhatsappPageHeader";

export default function WhatsappPage() {
  const phone = usePhoneForm();
  const broadcast = useBroadcastSettingsForm();

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
      <NotificationToggleCard
        enabled={broadcast.enabled}
        onToggle={() => broadcast.setEnabled(!broadcast.enabled)}
      />
      {broadcast.enabled && (
        <FrequencyCard
          frequencies={broadcast.frequencies}
          onToggle={broadcast.toggleFrequency}
        />
      )}
      {/* `isReady` guards the button during first paint — before
          the GET resolves, the hook reports `isDirty: false`
          (placeholder baselines match placeholder local state)
          but `isReady: false` so the button still hides. */}
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
