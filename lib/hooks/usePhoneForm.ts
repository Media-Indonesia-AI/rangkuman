"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useGetUserInformation } from "@/lib/hooks/useGetUserInformation";
import { useUpdatePhone } from "@/lib/hooks/useUpdatePhone";
import { track, EVENTS } from "@/lib/analytics-events";
import {
  normalizeLocalPhone,
  validateIndonesianPhone,
} from "@/components/profile/whatsapp/constants";

/**
 * Form-state hook for the WhatsApp phone-number card.
 *
 * Wraps the user-info GET + phone-update PUT pair and exposes a
 * UI-shaped surface: local `phone` string, the dirty check
 * against the saved active number, and a `save()` that delegates
 * to `useUpdatePhone`. The page just spreads the result into
 * `<PhoneNumberCard />`.
 *
 * The `phoneDirty` gate compares both sides through
 * `normalizeLocalPhone` so `+62XXXXXXXXXX`, `62XXXXXXXXXX`,
 * `0XXXXXXXXXX`, and bare `XXXXXXXXXX` all match the same
 * canonical local digits. The user can paste or type the number
 * in any of those forms and the gate still flips correctly.
 *
 * The save handler delegates the actual `POST users/me/phone/`
 * call to `useUpdatePhone` — the hook owns the loading / error
 * state and the user-info cache invalidation. On success the
 * subscriber re-fires `useGetUserInformation`, `user.phoneNumber`
 * re-fetches, `savedPhone` re-derives to match the local field,
 * and `phoneDirty` flips back to `false` on the next render.
 */

interface UsePhoneFormResult {
  /** Local phone input string (digits only — the card strips
   *  non-digits on type). */
  phone: string;
  setPhone: (next: string) => void;
  /** Bind to the card's `showSave` prop. `true` only when the
   *  local field differs from the saved active number AND
   *  passes validation — i.e. there's actually something to
   *  flush. The card uses this to conditionally render the
   *  inline `Perbarui` button (mirrors the broadcast-settings
   *  button pattern at the page level): the button is hidden
   *  until it's actionable, rather than rendered disabled. */
  showSave: boolean;
  /** In-flight flag — bind to the card's `isSaving` prop so the
   *  inline button label flips to "Memperbarui…". */
  isSaving: boolean;
  /** Inline error to render below the card on save failure. */
  saveError: string | null;
  /** Click handler — bind to the card's `onSave` prop. */
  onSave: () => Promise<{ ok: boolean }>;
  /** ISO timestamp from `User.phoneNumberVerifiedAt`, forwarded
   *  to the card so it can render the verified badge. The card
   *  treats `null` / `undefined` as "no badge" — passing the
   *  raw value (not a precomputed boolean) keeps the badge able
   *  to surface the actual verification timestamp on hover via
   *  its `title` tooltip, and stays consistent with the rest of
   *  the user-info surface where the wire shape is the source
   *  of truth. */
  verifiedAt: string | null;
}

export function usePhoneForm(): UsePhoneFormResult {
  const { data: user } = useGetUserInformation();
  const {
    isLoading: isSaving,
    error: saveError,
    update: savePhone,
  } = useUpdatePhone();

  const [phone, setPhone] = useState("");

  // Saved baseline. Wire is whatever the backend hands back
  // (E.164 `+62XXXXXXXXXX`); both sides feed through
  // `normalizeLocalPhone` so the comparison is form-agnostic.
  const savedPhone = normalizeLocalPhone(user?.phoneNumber ?? "");

  // One-shot hydration — mirror `user.phoneNumber` into the
  // local field the first time the GET resolves. The ref guard
  // prevents a later `useGetUserInformation` re-fetch (after the
  // phone-update endpoint invalidates the cache) from bouncing
  // the user's edit.
  const phoneHydratedRef = useRef(false);
  useEffect(() => {
    if (!user || phoneHydratedRef.current) return;
    setPhone(savedPhone);
    phoneHydratedRef.current = true;
  }, [user, savedPhone]);

  // `phoneDirty` is `true` only when (a) the user-info GET has
  // resolved (so we actually have a baseline) AND (b) the local
  // field, normalised, differs from the saved number. The
  // `user != null` guard prevents the button from flashing
  // enabled during first paint when both sides would compare as
  // empty strings.
  const phoneDirty = user != null && normalizeLocalPhone(phone) !== savedPhone;
  // Validity gate — the inline Perbarui is only shown when the
  // typed number passes the Indonesian-mobile contract
  // (9–12 digits, leading `8`). Same helper the card uses for
  // its red helper text, so the gate and the field stay in sync.
  // An invalid input can't be saved even if it differs from the
  // saved baseline, so we AND the two conditions in `showSave`
  // below — the card conditionally renders the button only when
  // both hold.
  const phoneValid = validateIndonesianPhone(phone).ok;

  const onSave = useCallback(async (): Promise<{ ok: boolean }> => {
    const result = await savePhone({ phone_number: phone });
    if (result.ok) {
      // We deliberately don't log the phone number itself —
      // even a hash-truncated phone is PII. `has_country_code`
      // is the only product-relevant question we ask here:
      // do users tend to enter numbers with the `+62` prefix
      // (intentional) versus the bare local form (auto-
      // normalised server-side)? The shape flag answers it
      // without identifying the user.
      const trimmed = phone.trim();
      const hasCountryCode = trimmed.startsWith("+") || trimmed.startsWith("62");
      track(EVENTS.phone_number_updated, { has_country_code: hasCountryCode });
    }
    return { ok: result.ok };
  }, [phone, savePhone]);

  return {
    phone,
    setPhone,
    showSave: phoneDirty && phoneValid,
    isSaving,
    saveError,
    onSave,
    // Mirror `user.phoneNumberVerifiedAt` straight through. The
    // badge widget renders `null` when this is falsy, so the
    // card doesn't need to branch on a separate `isVerified`
    // boolean. A `null` here means the user has a number on
    // file but hasn't completed OTP, or has no number at all —
    // either way, no badge.
    verifiedAt: user?.phoneNumberVerifiedAt ?? null,
  };
}
