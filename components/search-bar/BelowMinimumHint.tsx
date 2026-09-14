"use client";

interface BelowMinimumHintProps {
  /** Minimum number of characters required before the search
   *  becomes meaningful — rendered verbatim into the message
   *  so a future threshold change auto-updates the copy. */
  minLength: number;
}

/** Shown inside the suggestions panel when the user has typed
 *  something but the query is still under the minimum length.
 *  Lives in the same visual slot as the search results so the
 *  user's mental model — "the panel is where feedback lives" —
 *  holds regardless of the input's validity state.
 *
 *  No `lihat semua` link here: navigating to a query that's
 *  known to be under-threshold would just bounce the user to a
 *  results page that doesn't know what to do with it. */
export function BelowMinimumHint({ minLength }: BelowMinimumHintProps) {
  return (
    <div className="px-3 py-6 text-center">
      <p className="text-[12px] text-bearish">
        Ketik minimal {minLength} karakter untuk mencari.
      </p>
    </div>
  );
}
