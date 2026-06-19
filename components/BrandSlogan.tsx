/**
 * BrandSlogan — the brand tagline presented prominently.
 * Use at the top of the homepage, above the Sorotan section.
 *
 * Why this exists:
 * - The footer slogan is at the bottom (user might not scroll).
 * - The navbar brand tagline is hidden on smaller screens.
 * - This is the ABOVE-THE-FOLD memo lock — the user sees it on first paint.
 *
 * Design: centered, mono uppercase, decorative lines on both sides.
 */
export function BrandSlogan() {
  return (
    <div
      className="mb-4 mt-2 flex items-center justify-center gap-3 sm:gap-4"
      role="presentation"
    >
      <span
        aria-hidden
        className="h-px flex-1 bg-gradient-to-r from-transparent via-border-strong to-border-strong sm:max-w-[120px]"
      />
      <span
        className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] sm:text-[12.5px] sm:tracking-[0.25em]"
        style={{ color: "var(--logo-accent)" }}
      >
        Baca lebih sedikit, tahu lebih banyak
      </span>
      <span
        aria-hidden
        className="h-px flex-1 bg-gradient-to-l from-transparent via-border-strong to-border-strong sm:max-w-[120px]"
      />
    </div>
  );
}
