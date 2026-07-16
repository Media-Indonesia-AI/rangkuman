/**
 * Defensive empty-state shell shown when the slug doesn't match
 * any sector in the live response.
 *
 * Normally unreachable — the orchestrator calls `notFound()` from
 * `next/navigation`, which throws a `NEXT_NOT_FOUND` error that
 * the nearest `not-found.tsx` boundary catches. This component is
 * the TypeScript fallback so the compiler can see a render after
 * the `if (!sektor) notFound();` narrow.
 *
 * Kept as a real (rather than `void`-casted) component in case a
 * future refactor removes the early-return guard and falls back to
 * rendering the empty shell instead of throwing.
 */
export function SektorDetailEmpty() {
  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
      <h1 className="sr-only">Sektor tidak ditemukan</h1>
      <div className="rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-10 text-center">
        <p className="text-[13px] text-text-muted">
          Sektor ini belum tersedia.
        </p>
      </div>
    </main>
  );
}