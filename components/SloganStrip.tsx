/**
 * SloganStrip — the brand tagline, presented as a wide centered bar
 * that appears above the footer on every page. Designed for memorability:
 * - Centered, mono uppercase, wide tracking
 * - Decorative line on both sides (so it reads as a "motto")
 * - Subtle accent color on the tagline text
 */
export function SloganStrip() {
  return (
    <div
      className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6"
      aria-hidden
    >
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <span
          aria-hidden
          className="h-px flex-1 bg-gradient-to-r from-transparent to-border-strong"
        />
        <span
          className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] sm:text-[12px] sm:tracking-[0.22em]"
          style={{ color: "var(--logo-accent)" }}
        >
          Baca lebih sedikit, tahu lebih banyak
        </span>
        <span
          aria-hidden
          className="h-px flex-1 bg-gradient-to-l from-transparent to-border-strong"
        />
      </div>
    </div>
  );
}
