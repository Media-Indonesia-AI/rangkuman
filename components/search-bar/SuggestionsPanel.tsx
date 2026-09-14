"use client";

import { LoginPromptOverlay } from "@/components/LoginPromptOverlay";
import { EmptySearchState } from "./EmptySearchState";
import { LoadingState } from "./LoadingState";
import { SuggestionsList } from "./SuggestionsList";

interface SuggestionsPanelProps {
  query: string;
  isLoading: boolean;
  error: Error | null;
  /** True when the request returned `401` and the user is
   *  logged out. The panel swaps its body for the login
   *  prompt overlay in that case — the suggestions list,
   *  loading spinner, and "no results" branch are all
   *  meaningless once the endpoint is known to be
   *  auth-gated. */
  isUnauthorized: boolean;
  results: { href: string; label: string; hint: string }[];
  activeIdx: number;
  onPick: (item: { href: string; label: string; hint: string }) => void;
  onHover: (idx: number) => void;
  onSeeAll: () => void;
  onClose: () => void;
}

/** Dropdown that appears under the input while the user is
 *  actively searching. Dispatches one of four body states in
 *  priority order:
 *    1. `401` + logged out → login prompt overlay
 *    2. loading            → spinner message
 *    3. error / no results → "no results" with "see all"
 *    4. otherwise          → suggestion rows */
export function SuggestionsPanel({
  query,
  isLoading,
  error,
  isUnauthorized,
  results,
  activeIdx,
  onPick,
  onHover,
  onSeeAll,
  onClose,
}: SuggestionsPanelProps) {
  return (
    <div
      id="search-suggestions"
      role="listbox"
      className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[420px] overflow-y-auto rounded-lg border border-border bg-bg-secondary p-1.5 shadow-2xl"
    >
      {isUnauthorized ? (
        // Wrap the overlay in a `relative` container with a
        // `min-h` so the panel has layout content. The
        // overlay itself is `absolute inset-0` (contributes
        // no height of its own), so without the wrapper the
        // panel would collapse to its `p-1.5` padding and
        // the prompt would be invisible. The `relative` on
        // the wrapper also re-establishes the containing
        // block the overlay needs to fill itself against.
        <div className="relative min-h-[140px]">
          <LoginPromptOverlay title="Login untuk mencari saham" />
        </div>
      ) : isLoading ? (
        <LoadingState />
      ) : results.length === 0 || error ? (
        <EmptySearchState
          query={query}
          error={error}
          onSeeAll={onSeeAll}
          onClose={onClose}
        />
      ) : (
        <SuggestionsList
          results={results}
          activeIdx={activeIdx}
          onPick={onPick}
          onHover={onHover}
        />
      )}
    </div>
  );
}
