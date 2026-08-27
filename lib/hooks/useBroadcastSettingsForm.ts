"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { BroadcastSettings } from "@/lib/api";
import { useGetBroadcastSettings } from "@/lib/hooks/useGetBroadcastSettings";
import { useUpdateBroadcastSettings } from "@/lib/hooks/useUpdateBroadcastSettings";
import { track, EVENTS } from "@/lib/analytics-events";
import {
  frequenciesFromSettings,
  setsContainSameItems,
  type FrequencyId,
} from "@/components/profile/whatsapp/constants";

/**
 * Form-state hook for the broadcast-settings section of the
 * WhatsApp tab. Wraps the GET/PUT pair (`useGetBroadcastSettings`
 * + `useUpdateBroadcastSettings`) and exposes a UI-shaped
 * surface: local `enabled` + `frequencies` state, the
 * toggle-frequency helper, a single `isDirty` boolean that fires
 * when either field drifts from the saved baseline, and a
 * `save()` that builds the wire body and triggers the route
 * refresh on success.
 *
 * Why a hook (vs. inlining the state in the page):
 *   - The hydration effect + PUT-mirroring effect are pure
 *     bookkeeping that has nothing to say about the widgets
 *     themselves.
 *   - `isDirty` is the only signal the page's render needs —
 *     it doesn't care whether the drift is in the toggle or
 *     the frequency set, just that the save button should
 *     surface.
 *   - The wire body rule (when `is_enabled` is `false`, force
 *     all `notified_*` flags to `false`) is an invariant the
 *     UI shouldn't have to repeat.
 */

interface UseBroadcastSettingsFormResult {
  /** Master toggle — user-facing on/off state. */
  enabled: boolean;
  setEnabled: (next: boolean) => void;
  /** Selected time-of-day slots. Preserved across toggle off/on
   *  round trips; only the wire body is forced clean. */
  frequencies: Set<FrequencyId>;
  /** Toggle a single slot. Always returns a fresh `Set` so React
   *  re-renders the checkbox group. */
  toggleFrequency: (id: FrequencyId) => void;
  /** `true` when the local state has drifted from the saved
   *  baseline. Drives the save-button gate on the page. */
  isDirty: boolean;
  /** Save the current local state to the backend. Resolves with
   *  `{ ok }` so the page can branch without a try/catch. */
  save: () => Promise<{ ok: boolean }>;
  /** Whether the GET has resolved at least once. The page uses
   *  this to suppress the save button during first paint, when
   *  the baselines would compare against placeholder local state. */
  isReady: boolean;
  /** Inline error to render under the save button when the PUT
   *  fails. The hook extracts `ApiError.message`. */
  saveError: string | null;
  /** In-flight flag — page binds it to the save button's
   *  `disabled` + "Memperbarui…" label. */
  isSaving: boolean;
}

export function useBroadcastSettingsForm(): UseBroadcastSettingsFormResult {
  // `router.refresh()` re-runs the route's RSC payload — used
  // below as the post-save trigger so layout-level server data
  // that keys off broadcast settings picks up the new state.
  const router = useRouter();

  const { data: settings } = useGetBroadcastSettings();
  const {
    data: savedData,
    update: saveBroadcastSettings,
    isLoading: isSaving,
    error: saveError,
  } = useUpdateBroadcastSettings();

  // Local UI state. Seeds are intentionally `false` / empty —
  // the hydration effect below mirrors the saved row once the
  // GET resolves.
  const [enabled, setEnabled] = useState(false);
  const [frequencies, setFrequencies] = useState<Set<FrequencyId>>(
    () => new Set<FrequencyId>(),
  );

  // One-shot hydration — mirror `is_enabled` + per-slot opt-ins
  // when the GET first resolves. The ref guard prevents strict-
  // mode double-mount and post-save refreshes from re-seeding
  // the user's edits (the cached payload matches what they just
  // submitted, so a re-seed would bounce their values).
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!settings || hydratedRef.current) return;
    setEnabled(settings.is_enabled);
    setFrequencies(frequenciesFromSettings(settings));
    hydratedRef.current = true;
  }, [settings]);

  // Mirror the PUT response (`savedData`) into local state so the
  // UI reflects what the server actually persisted, faster than
  // waiting for the cache-invalidation → GET round-trip. Runs
  // only when `savedData` changes, so user edits after a failed
  // save (where `savedData` is `null`) are unaffected.
  useEffect(() => {
    if (!savedData) return;
    setEnabled(savedData.is_enabled);
    setFrequencies(frequenciesFromSettings(savedData));
  }, [savedData]);

  // Saved baselines — derived directly from the API response so
  // there's no separate local mirror. Before `settings` resolves
  // both fall back to placeholder values that match the local
  // seeds, keeping `isDirty` `false` during first paint.
  const savedEnabled = settings?.is_enabled ?? false;
  const savedFrequencies = useMemo<Set<FrequencyId>>(() => {
    if (!settings) return new Set<FrequencyId>();
    return frequenciesFromSettings(settings);
  }, [settings]);

  // Drift signals. Both must be `true` for `isDirty` to be
  // `false` — either divergence alone is enough to surface the
  // save button.
  const toggleMatchesSaved = enabled === savedEnabled;
  const frequenciesMatchSaved = setsContainSameItems(
    frequencies,
    savedFrequencies,
  );
  const isDirty = settings != null && (!toggleMatchesSaved || !frequenciesMatchSaved);

  const toggleFrequency = useCallback((id: FrequencyId) => {
    setFrequencies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const save = useCallback(async (): Promise<{ ok: boolean }> => {
    // Wire body rule: when `is_enabled` is `false`, force all
    // three `notified_*` flags to `false` regardless of what's
    // in the local `frequencies` set. The set is preserved on
    // the client (so a toggle-off + toggle-on round trip keeps
    // the user's selection), but on the wire we always send a
    // coherent "off + nothing" payload. Keeps the backend row
    // unambiguous.
    const result = await saveBroadcastSettings({
      is_enabled: enabled,
      notified_morning: enabled && frequencies.has("pagi"),
      notified_afternoon: enabled && frequencies.has("siang"),
      notified_evening: enabled && frequencies.has("sore"),
    });
    if (result.ok) {
      // Capture what the user actually committed BEFORE the
      // route refresh invalidates local state. Tag the most
      // common slot if exactly one is selected — when multiple
      // slots are on, surface as `multi`.
      const selectedSlots = [
        frequencies.has("pagi") ? "pagi" : null,
        frequencies.has("siang") ? "siang" : null,
        frequencies.has("sore") ? "sore" : null,
      ].filter(Boolean) as FrequencyId[];
      const frequencyTag =
        selectedSlots.length === 1 ? selectedSlots[0] : "multi";
      track(EVENTS.broadcast_settings_saved, {
        enabled,
        frequency: frequencyTag,
      });
      // Refresh the route on success only — re-runs the route's
      // RSC payload so layout-level server data that keys off
      // broadcast settings picks up the new state. Skipped on
      // failure so the user can retry without losing their edits;
      // `saveError` is rendered inline.
      router.refresh();
    }
    return { ok: result.ok };
  }, [enabled, frequencies, router, saveBroadcastSettings]);

  return {
    enabled,
    setEnabled,
    frequencies,
    toggleFrequency,
    isDirty,
    save,
    isReady: settings != null,
    saveError,
    isSaving,
  };
}

// Re-export so consumers can keep typing through this module if
// they prefer — `BroadcastSettings` itself isn't returned by the
// hook (the hook owns the local projection), but the type is
// referenced in JSDoc and in widget prop signatures downstream.
export type { BroadcastSettings };
