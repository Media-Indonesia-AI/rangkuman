"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { loadHeadlineById } from "@/lib/api/cache";
import type { HeadlineDetail } from "@/lib/api";

interface UseHeadlineIdResult {
  /** The headline ID read from the route's `[id]` segment. Stays
   *  stable across re-renders unless the route changes (e.g. the
   *  user navigates from `/story/A` to `/story/B`). Empty string
   *  when the route doesn't expose an `id` segment. */
  headlineId: string;
  /** The fetched headline detail (parent headline + related
   *  stories). `null` while loading, on error, or when the id is
   *  blank. Once set, the same `HeadlineDetail` instance is held
   *  until the id changes (or the component unmounts). */
  detail: HeadlineDetail | null;
  /** True while the headline fetch is in flight. Flips to `false`
   *  once the request settles either way — success or failure —
   *  so the consumer can drop its shimmer and render either the
   *  populated hero or the empty state. */
  isLoading: boolean;
}

/**
 * Headline-scoped data hook for `/story/[id]`-style routes.
 *
 * Reads the headline ID from the current route's `[id]` segment
 * via `useParams<{ id: string }>`, then calls
 * `loadHeadlineById(headlineId)` once. Owns its own state + a
 * cancel-on-unmount `useEffect` so navigating from `/story/A` to
 * `/story/B` resets `detail` to `null` before the new fetch
 * resolves (no flash of the previous headline's data alongside the
 * new loading state).
 *
 * The fetch is suppressed when the route has no `id` segment —
 * `loadHeadlineById` would otherwise issue a `headlines/` request
 * with an empty id and 404. Returning `headlineId: ""` + `detail:
 * null` + `isLoading: false` lets the consumer render its empty
 * state directly without an extra null-check, mirroring the
 * "blank id means skip" convention used by `useMultiStories` and
 * `useListStory`.
 *
 * On error the hook returns the same `{ headlineId, detail: null,
 * isLoading: false }` shape so consumers can fall back to their
 * empty state. The error itself isn't surfaced — the request-level
 * cache (`loadHeadlineById`) handles dedup, and the headline
 * detail UI doesn't have anything to render on a 404 beyond the
 * empty state anyway. If a future consumer needs the error
 * (e.g. for a retry button), extend the result with an `error`
 * field.
 *
 * Concurrency: `loadHeadlineById`'s built-in request-level cache
 * dedups simultaneous calls for the same id, so two mounts of the
 * hook on the same headline (e.g. a future layout + a widget) share
 * one network round-trip.
 */
export function useHeadlineId(): UseHeadlineIdResult {
  const params = useParams<{ id: string }>();
  const headlineId = params?.id ?? "";

  const [detail, setDetail] = useState<HeadlineDetail | null>(null);
  const [isLoading, setIsLoading] = useState(headlineId !== "");

  useEffect(() => {
    // No id — no fetch. Render the empty state immediately.
    if (headlineId === "") {
      setDetail(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    // Reset on id change so a fast route swap doesn't briefly
    // show the previous headline alongside the new loading state.
    setDetail(null);
    setIsLoading(true);

    void loadHeadlineById(headlineId)
      .then((res) => {
        if (!cancelled) setDetail(res);
      })
      .catch(() => {
        // Swallow — the consumer falls back to its empty state
        // via `detail === null && !isLoading`.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [headlineId]);

  return { headlineId, detail, isLoading };
}
