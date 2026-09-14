"use client";

/** Loading-state placeholder shown inside the suggestions panel
 *  while the search request is in flight. Kept as its own widget
 *  so the four panel-body branches all live as siblings — each
 *  branch's complexity is then visible at a glance in the panel's
 *  dispatch block. */
export function LoadingState() {
  return (
    <div className="px-3 py-6 text-center">
      <p className="font-mono text-[11px] text-text-muted">Mencari saham…</p>
    </div>
  );
}
