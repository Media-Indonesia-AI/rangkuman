import { LatestHeadlines } from "./latest-headlines";

/**
 * Sidebar — currently just hosts the "Latest Headlines" widget.
 *
 * Kept as a server component so it doesn't pull `useState`/`useEffect`
 * into the route bundle. The data fetch lives inside the
 * `<LatestHeadlines />` client island, which is what owns the
 * `useHeadlines` hook.
 */
export function Sidebar() {
  return (
    <aside className="space-y-4" aria-label="Sidebar">
      <LatestHeadlines />
    </aside>
  );
}