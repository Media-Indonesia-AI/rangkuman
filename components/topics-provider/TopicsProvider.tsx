"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StoryFilter, StoryTopic } from "@/lib/api";
import { useTopics } from "@/lib/hooks/useTopics";

/**
 * Hoisted to module scope so the reference is stable across renders.
 * Passing `[]` inline would create a new array on every render, which
 * triggers `useTopics`' effect (whose deps include `filters`) on every
 * render — and the effect's `setData([])` then produces another new
 * reference, sending the provider into an infinite re-render loop.
 * Stable identity keeps the effect from re-firing.
 */
const EMPTY_FILTERS: StoryFilter[] = [];

interface TopicsContextValue {
  /** All topics returned by the API, oldest → newest in the order
   *  the backend returns them. Empty array while the fetch is in
   *  flight, before login, or on error — consumers must check
   *  `isLoading` if they need to distinguish "still loading" from
   *  "API empty". */
  topics: StoryTopic[];
  /** True while the topics fetch is in flight; stays `true` until
   *  the cache wrapper resolves or errors out. */
  isLoading: boolean;
}

const TopicsContext = createContext<TopicsContextValue>({
  topics: [],
  isLoading: false,
});

/**
 * Read the shared topics list. Returns `{ topics: [], isLoading:
 * false }` outside a provider, so consumers degrade to a "no
 * topics yet" fallback without an extra null check. */
export function useTopicsContext(): TopicsContextValue {
  return useContext(TopicsContext);
}

interface TopicsProviderProps {
  children: ReactNode;
}

/**
 * Layout-scoped wrapper that owns the topics fetch on behalf of
 * every page that reads from it. Mounted in `app/layout.tsx`
 * above the page tree so the network round-trip kicks off as
 * soon as the first route hydrates.
 *
 * The fetch is gated on auth — `useCurrentUser()` returns the
 * active session from `localStorage` (the same source the API
 * client uses for HTTP Basic auth) and `useTopics` is held
 * disabled until a user is present. That means:
 *
 *   - Anonymous visitors never issue a wasted `/topic` request,
 *   - a successful `loginWithIdentifier` / `loginWithGoogle` /
 *     `registerUser` mutates `localStorage`, which fires the
 *     `storage` / `beritainvestor:storage` events that
 *     `useCurrentUser()` subscribes to, which flips `enabled`
 *     to `true` and triggers the topics fetch in the same tick,
 *   - `logout()` clears the session, flipping `enabled` back to
 *     `false`, which clears the cached topics so the next user
 *     on a shared device starts fresh.
 *
 * Once topics are in the request-level cache
 * (`loadTopic()` → `inflightTopics` Map), concurrent or later
 * subscribers receive the same `Promise<TopicResponse>` without
 * a second hit on the wire.
 *
 * Mirrors the convention established by `<TopTickerRouter />`
 * and `<BfcacheRecovery />` — small client islands mounted
 * directly in the root layout so any descendant page can read
 * the same shared state without prop-drilling.
 *
 * Patterned after `<HeadlineDetailProvider />` and
 * `<HeadlineStoriesProvider />` on the stock detail page: a
 * dedicated context for a resource that's read by more than one
 * page (here, `/saham` General News Feed + `/crypto` page), so
 * both pull from one fetch instead of each issuing their own.
 */
export function TopicsProvider({ children }: TopicsProviderProps) {
  // `useCurrentUser()` returns `undefined` on first paint (still
  // hydrating from localStorage), `null` when the user is logged
  // out, and the `MockUser` object once the session has resolved.
  // We forward `enabled = user !== null && user !== undefined` to
  // `useTopics` so the fetch fires the moment a session is
  // available (post-login or post-register).
  
  const { data: topics, isLoading } = useTopics(
    10,
    0,
    EMPTY_FILTERS,
    true,
  );
  return (
    <TopicsContext.Provider value={{ topics, isLoading }}>
      {children}
    </TopicsContext.Provider>
  );
}
