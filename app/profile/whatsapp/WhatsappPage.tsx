"use client";

/**
 * `/profile/whatsapp/` — Kirim Berita ke WhatsApp tab.
 *
 * Thin orchestrator. Owns:
 *   - The data layer (broadcast-settings GET/PUT, user-info GET
 *     for the active phone + verification state).
 *   - Local UI state (toggle, phone, frequency set) plus the
 *     hydration effects that seed them from the GET responses.
 *   - The dirty gates that decide when each save button surfaces.
 *
 * Everything visual is delegated to widgets under
 * `@/components/profile/whatsapp/`:
 *
 *   - `WhatsappPageHeader`     — page title + subtitle.
 *   - `PhoneNumberCard`        — input + inline `UpdateWhatsappButton`.
 *   - `NotificationToggleCard` — master on/off switch.
 *   - `FrequencyCard`          — pagi / siang / sore checkboxes.
 *   - `PerbaruiButton`         — broadcast-settings save button + inline error.
 *   - `MessagePreviewCard`     — static "Preview pesan" sample.
 *
 * The shared `FrequencyId` type, `frequenciesFromSettings` helper,
 * and `normalizeLocalPhone` helper live next to the widgets in
 * `constants.ts` so both the page and the widgets can reach
 * them without pulling each other in.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { useGetBroadcastSettings } from "@/lib/hooks/useGetBroadcastSettings";
import { useGetUserInformation } from "@/lib/hooks/useGetUserInformation";
import { useUpdateBroadcastSettings } from "@/lib/hooks/useUpdateBroadcastSettings";

import { FrequencyCard } from "@/components/profile/whatsapp/FrequencyCard";
import { MessagePreviewCard } from "@/components/profile/whatsapp/MessagePreviewCard";
import { NotificationToggleCard } from "@/components/profile/whatsapp/NotificationToggleCard";
import { PerbaruiButton } from "@/components/profile/whatsapp/PerbaruiButton";
import { PhoneNumberCard } from "@/components/profile/whatsapp/PhoneNumberCard";
import { WhatsappPageHeader } from "@/components/profile/whatsapp/WhatsappPageHeader";
import {
  frequenciesFromSettings,
  normalizeLocalPhone,
  type FrequencyId,
} from "@/components/profile/whatsapp/constants";

export default function WhatsappPage() {
  // `router.refresh()` re-runs the current route's server
  // components and re-fetches any RSC payload — used below as
  // the post-save "refresh the page" trigger so the user sees a
  // freshly-rendered route even if other parts of the page
  // (above the WhatsApp tab) have server-side data that depends
  // on the broadcast settings.
  const router = useRouter();

  // Pull the user's saved broadcast settings from the backend.
  // The "Perbarui" button flushes the current UI state via
  // `useUpdateBroadcastSettings`; on success the mutation hook
  // invalidates the broadcast-settings cache, which triggers a
  // re-fetch in `useGetBroadcastSettings` — `settings` updates,
  // the derived baselines below update with it, and
  // `toggleMatchesSaved` flips back to true.
  const { data: settings } = useGetBroadcastSettings();
  // Active-user GET → source for the on-file phone number that
  // seeds the input field and the baseline that drives the
  // phone-update button's `disabled` flag. The phone also drives
  // the verification badge inside `PhoneNumberCard`.
  const { data: user } = useGetUserInformation();
  // Update hook drives the broadcast-settings Perbarui button:
  // `update` is the save action invoked on click, `isSaving`
  // gates the button + label, `error` surfaces inline when the
  // PUT fails, and `data` is the server's authoritative saved
  // row returned by the PUT itself — we mirror it into local
  // state below so the UI reflects what was actually persisted,
  // not just what we submitted.
  const {
    data: savedData,
    update: saveBroadcastSettings,
    isLoading: isSaving,
    error: saveError,
  } = useUpdateBroadcastSettings();

  // Local UI state — seeds are intentionally empty / `false`
  // (no notifications assumed). The hydration effects below
  // mirror the saved rows from `settings` (broadcast) and `user`
  // (phone) once the GETs resolve, so the user sees their actual
  // saved values instead of arbitrary defaults.
  const [enabled, setEnabled] = useState(false);
  const [phone, setPhone] = useState("");
  // Set of selected time-of-day slots. The user can pick any
  // combination — e.g. {"pagi", "sore"} for morning + evening
  // briefs. `off` is implicit in the toggle above (the set is
  // preserved when the toggle is off, but no message is sent).
  const [frequencies, setFrequencies] = useState<Set<FrequencyId>>(
    () => new Set<FrequencyId>(),
  );

  // In-flight flag for the phone-update save. Kept local to the
  // page (rather than wrapped in a `useUpdatePhone` hook) because
  // it's only used here, the call is a one-shot, and the page
  // already has the read-side `useGetUserInformation` driving
  // `user.phoneNumber` so the optimistic UI doesn't need its own
  // mirror.
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneSaveError, setPhoneSaveError] = useState<string | null>(null);

  // Saved baseline for the phone field. Wire is whatever the
  // backend hands back (E.164 `+62XXXXXXXXXX`); the input strips
  // non-digits on type so the same number typed in ends up as
  // `6281234567890` in local state. Both forms normalise to
  // canonical local digits (`81234567890`) for the dirty check
  // below — see `normalizeLocalPhone` in `constants.ts`.
  const savedPhone = normalizeLocalPhone(user?.phoneNumber ?? "");

  // One-shot hydration — when the broadcast-settings GET first
  // resolves, mirror `is_enabled` + the per-slot opt-ins into
  // the local UI state. The ref guard ensures: (a) React strict
  // mode's double-mount doesn't re-seed after the user has
  // already edited, and (b) any later refreshes (e.g. after a
  // successful save, when `useUpdateBroadcastSettings` invalidates
  // the cache) leave the user's just-edited values alone — the
  // mutation hook returns the new row in `data`, so the GET
  // re-fires with the same content the user just submitted and
  // we'd otherwise bounce the local state. The button's
  // `toggleMatchesSaved` gate is the contract that makes the
  // post-save refresh safe.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!settings || hydratedRef.current) return;
    setEnabled(settings.is_enabled);
    setFrequencies(frequenciesFromSettings(settings));
    hydratedRef.current = true;
  }, [settings]);

  // Phone hydration — separate ref because the user-info GET
  // lands independently of the broadcast-settings GET. We only
  // seed once so a later `useGetUserInformation` refresh (e.g.
  // after the phone-update endpoint invalidates the cache)
  // doesn't bounce the user's edit. The local field shows the
  // active on-file number in canonical local-digit form so the
  // user sees their actual number, not a placeholder.
  const phoneHydratedRef = useRef(false);
  useEffect(() => {
    if (!user || phoneHydratedRef.current) return;
    setPhone(savedPhone);
    phoneHydratedRef.current = true;
  }, [user, savedPhone]);

  // Mirror the PUT response (`savedData`) into local state so
  // the UI reflects what the server actually persisted. This is
  // the direct "apply" path for the update hook — we trust the
  // server's response as the source of truth rather than waiting
  // for the cache-invalidation → GET round-trip to land the same
  // row through `settings`. (Both paths end up with the same
  // content; this one is just faster and explicit.) Runs only
  // when `savedData` changes, so user edits after a failed save
  // (where `savedData` is `null`) are unaffected.
  useEffect(() => {
    if (!savedData) return;
    setEnabled(savedData.is_enabled);
    setFrequencies(frequenciesFromSettings(savedData));
  }, [savedData]);

  // Saved baseline for the master toggle — derived directly from
  // the API response so there's no separate local mirror. Before
  // `settings` resolves (first render) the baseline falls back to
  // `false`, which matches the placeholder `enabled=false` local
  // state; together with the `settings != null` guard on the
  // button this keeps the button hidden until the GET lands.
  const savedEnabled = settings?.is_enabled ?? false;

  // Saved baseline for the frequency set — also derived from the
  // API response, memoised on `settings` so we don't allocate a
  // fresh `Set` on every render. Before `settings` resolves the
  // baseline falls back to an empty Set, which matches the
  // placeholder `new Set()` local seed; together with the
  // `settings != null` guard on the button this keeps the button
  // hidden during first paint even if the user has no toggle
  // change but the empty-set comparison happens to drift.
  const savedFrequencies = useMemo<Set<FrequencyId>>(() => {
    if (!settings) return new Set<FrequencyId>();
    return frequenciesFromSettings(settings);
  }, [settings]);

  // Set equality — compares two `Set` instances by content so
  // identity doesn't matter, only which slots are present. The
  // standard "size match + every element in a is in b" check.
  const sameSet = (
    a: Set<FrequencyId>,
    b: Set<FrequencyId>,
  ): boolean => {
    if (a.size !== b.size) return false;
    for (const x of a) if (!b.has(x)) return false;
    return true;
  };

  // Track whether the master toggle matches the saved baseline.
  // (Previously this was the only dirty signal — we now also
  // consider frequency drift below.)
  const toggleMatchesSaved = enabled === savedEnabled;
  // Frequency drift — same content check between local and saved
  // sets. After a successful save the subscriber re-fires the
  // GET, `settings` updates, `savedFrequencies` re-derives to
  // match `frequencies`, this flips back to `true`, and the
  // button hides.
  const frequenciesMatchSaved = sameSet(frequencies, savedFrequencies);

  // Phone dirty check — only true when (a) the user-info GET has
  // resolved (so we actually have a baseline to compare against),
  // AND (b) the local field, normalised, differs from the saved
  // active number. The `user != null` guard prevents the button
  // from flashing enabled during first paint when both sides
  // would compare as empty strings. After a successful save,
  // `invalidateUserInformation` triggers a `useGetUserInformation`
  // re-fetch, `user.phoneNumber` updates with the freshly-saved
  // row, `savedPhone` re-derives to match `phone`, and the gate
  // flips back to `false`.
  const phoneDirty = user != null && normalizeLocalPhone(phone) !== savedPhone;

  // Persist the current UI state to the backend on click. The
  // hook handles cache invalidation, error capture, and loading
  // state — we just feed it the body. No manual baseline
  // advancement: `savedData` above mirrors the new row into
  // local state, the cache invalidation triggers a GET re-fire
  // so `settings` updates, and `toggleMatchesSaved` flips back
  // to `true` on the next render, hiding the button.
  //
  // Body construction rule: when `is_enabled` is `false`, force
  // all three `notified_*` flags to `false` regardless of what's
  // in the local `frequencies` set. The set is preserved client-
  // side so the user's selection survives a toggle-off + toggle-on
  // round trip, but on the wire we always send a coherent
  // "off + nothing" payload. This keeps the backend row in an
  // unambiguous state — there's no row with `is_enabled: false`
  // but a non-empty frequency set, which would be a contract
  // violation the backend has no use for.
  const handlePerbarui = async () => {
    const result = await saveBroadcastSettings({
      is_enabled: enabled,
      notified_morning: enabled && frequencies.has("pagi"),
      notified_afternoon: enabled && frequencies.has("siang"),
      notified_evening: enabled && frequencies.has("sore"),
    });
    // Refresh the page on success only — re-runs the route's
    // server components so anything above the WhatsApp tab
    // (layout-level server data that may key off broadcast
    // settings) picks up the new state. Skipped on failure so
    // the user can retry without losing their edit context;
    // `saveError` renders inline via `PerbaruiButton`.
    if (result.ok) {
      router.refresh();
    }
  };

  // Phone save handler. Inline (no `useUpdatePhone` hook) because
  // the call is one-shot and the read-side `useGetUserInformation`
  // already owns the cache invalidation bus. On success we
  // invalidate the user-info cache so the next
  // `useGetUserInformation` re-fetch lands the freshly-saved
  // row — `user.phoneNumber` updates, `savedPhone` re-derives,
  // and the dirty gate flips back to false. On failure local
  // state stays put (the user keeps their edit) and we surface
  // the error inline via `phoneSaveError` so they can retry.
  const handleSavePhone = async () => {
    setIsSavingPhone(true);
    setPhoneSaveError(null);
    try {
      await api.updatePhone({ phoneNumber: phone });
      // Re-pull the user profile so `user.phoneNumber` reflects
      // what the server actually stored (the backend may still
      // report the on-file number as `null` until OTP verifies —
      // see `lib/api/users.ts` for the contract; the next render
      // re-derives `savedPhone` accordingly).
      router.refresh();
    } catch (err) {
      const message =
        (err as { message?: string }).message ??
        "Gagal update nomor WhatsApp";
      setPhoneSaveError(message);
    } finally {
      setIsSavingPhone(false);
    }
  };

  // Toggle one slot on/off. Always produces a fresh `Set` so the
  // reference changes per toggle and React re-renders the checkbox
  // group. (Mutating the same Set in place would skip the update.)
  const toggleFrequency = (id: FrequencyId) => {
    setFrequencies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <WhatsappPageHeader />
      <PhoneNumberCard
        phone={phone}
        onPhoneChange={setPhone}
        saveDisabled={!phoneDirty}
        isSaving={isSavingPhone}
        onSave={handleSavePhone}
      />
      {phoneSaveError && (
        <p className="font-mono text-[10.5px] text-bearish">
          ⚠ {phoneSaveError}
        </p>
      )}
      <NotificationToggleCard
        enabled={enabled}
        onToggle={() => setEnabled((v) => !v)}
      />
      {enabled && (
        <FrequencyCard
          frequencies={frequencies}
          onToggle={toggleFrequency}
        />
      )}
      {/* Perbarui — placed as a sibling of the frequency section
          so the button stays reachable when the user has just
          toggled notifications off (a valid change that also
          needs to flush). Visibility is gated on EITHER the
          toggle diverging from `settings.is_enabled`
          (`!toggleMatchesSaved`) OR any frequency-checkbox drift
          from the saved set (`!frequenciesMatchSaved`) — both
          are valid edits that need to flush; either one alone
          is enough to surface the button. The `settings == null`
          guard prevents the button from flashing on during first
          paint, when both `savedEnabled` and `savedFrequencies`
          fall back to placeholder values that would otherwise
          silently mask a real edit made while the GET was still
          in flight.

          Post-save lifecycle (button auto-hides on success):
          1. User clicks Perbarui → `handlePerbarui` calls
             `saveBroadcastSettings`, awaits the result.
          2. On success the hook's `savedData` effect runs and
             mirrors `savedData.is_enabled` + per-slot opt-ins
             into local `enabled` + `frequencies` — so local
             state matches what the server stored.
          3. Cache invalidation triggers a GET re-fire in
             `useGetBroadcastSettings` (via the subscriber bus)
             → `settings` updates with the freshly-saved row →
             `savedEnabled` and `savedFrequencies` both re-derive
             to match local state.
          4. `toggleMatchesSaved` and `frequenciesMatchSaved`
             flip back to `true` → the button unmounts.
          5. `router.refresh()` runs the route's RSC re-fetch
             in parallel; doesn't affect this gate.

          On failure the hook leaves `saveError` set so
          `PerbaruiButton` renders the inline error, and local
          state stays where the user left it — they can retry
          without losing edit context. The button stays visible
          because both diff signals are still firing. */}
      {settings != null && (!toggleMatchesSaved || !frequenciesMatchSaved) && (
        <PerbaruiButton
          onClick={handlePerbarui}
          isSaving={isSaving}
          error={saveError}
        />
      )}
      <MessagePreviewCard />
    </div>
  );
}
