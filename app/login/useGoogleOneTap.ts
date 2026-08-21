"use client";

import { useCallback, useEffect, useState } from "react";
import type { PromptMomentNotification } from "@react-oauth/google";
import {
  dismissGoogleOneTap,
  isGoogleOneTapDismissed,
} from "@/lib/auth";
import { shouldPersistOneTapDismissal } from "./googleOneTap";

/**
 * State + handler pair for the Google One Tap dismissal flow on
 * `/login`.
 *
 * Returns:
 *
 *   - `oneTapDismissed` — `true` when the user previously
 *     dismissed the prompt (within the 30-day TTL window). Wire
 *     this to `<GoogleLogin useOneTap={!oneTapDismissed && !user} />`
 *     so the prompt stays hidden for repeat visits.
 *   - `onPromptMomentNotification` — pass to
 *     `<GoogleLogin promptMomentNotification={…} />`. The handler
 *     filters dismiss reasons via
 *     `shouldPersistOneTapDismissal()` (see `./googleOneTap.ts`)
 *     and writes a 30-day opt-out timestamp only on genuine
 *     opt-outs.
 *
 * Hydration is handled by an effect that re-reads the persisted
 * flag on mount — the SSR pass returns `false` (the safe default,
 * since we never want to flash a hidden prompt) and the client
 * corrects it after hydration. The `<GoogleLogin>` library's
 * internal effect re-runs when `useOneTap` flips, so this
 * resync flips it the right way on the next render.
 */
export function useGoogleOneTap(): {
  oneTapDismissed: boolean;
  onPromptMomentNotification: (n: PromptMomentNotification) => void;
} {
  const [oneTapDismissed, setOneTapDismissed] = useState(false);

  // Re-sync from localStorage on mount. See `useCurrentUser`
  // for the same hydration pattern.
  useEffect(() => {
    setOneTapDismissed(isGoogleOneTapDismissed());
  }, []);

  const onPromptMomentNotification = useCallback(
    (notification: PromptMomentNotification) => {
      if (!shouldPersistOneTapDismissal(notification)) return;
      dismissGoogleOneTap();
      setOneTapDismissed(true);
    },
    [],
  );

  return { oneTapDismissed, onPromptMomentNotification };
}
