"use client";

import { ArrowRight } from "lucide-react";

interface EmptySearchStateProps {
  query: string;
  error: Error | null;
  onSeeAll: () => void;
  onClose: () => void;
}

/** Shown when the search returned no results, or the request
 *  errored. Always offers a "lihat semua" link so the user can
 *  fall through to the full search page with the same query.
 *
 *  Errored requests show `error.message` directly (the upstream
 *  hook surfaces a human-readable string) instead of the "no
 *  results" copy — the two states look similar but communicate
 *  different things to the user. */
export function EmptySearchState({
  query,
  error,
  onSeeAll,
  onClose,
}: EmptySearchStateProps) {
  return (
    <div className="px-3 py-6 text-center">
      <p className="text-[12px] text-text-muted">
        {error ? (
          error.message
        ) : (
          <>
            Gak ada hasil untuk &ldquo;
            <span className="font-mono text-text-primary">{query}</span>
            &rdquo;.
          </>
        )}
      </p>
      <button
        type="button"
        onClick={() => {
          onClose();
          onSeeAll();
        }}
        className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand hover:text-brand-hover"
      >
        Lihat semua hasil pencarian
        <ArrowRight className="h-3 w-3" aria-hidden />
      </button>
    </div>
  );
}
