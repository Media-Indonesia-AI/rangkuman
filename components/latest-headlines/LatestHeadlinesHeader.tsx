import { Clock } from "lucide-react";

/**
 * Header strip of the "Latest Headlines" widget — brand `Clock`
 * icon + section title. Single row, no right-side counter (the
 * timeline is now scrollable so the rendered row count is
 * unbounded and isn't useful to surface here).
 */
export function LatestHeadlinesHeader() {
  return (
    <header className="flex items-center border-b border-border bg-bg-tertiary px-3 py-2">
      <div className="flex items-center gap-1.5">
        <Clock className="h-3 w-3 text-brand" aria-hidden />
        <h3 className="label">Latest Headlines</h3>
      </div>
    </header>
  );
}
