import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  /** Show the full lockup (icon + wordmark) instead of just the icon. */
  full?: boolean;
  /** Subtle ring around the icon (good for footers). */
  withRing?: boolean;
}

/**
 * Rangkuman.news logo — uses the brand asset at /logo-icon.svg and /logo.svg.
 *
 * Variants:
 * - Icon only (default) — used in navbar, favicon-sized contexts.
 * - Full lockup (`full={true}`) — used in footer, login, and any hero context
 *   where the wordmark should appear next to the icon.
 *
 * Color palette (locked to brand):
 * - Navy:   #1E3A8A   (R letterform, "rangkuman")
 * - Teal:   #14B8A6   (stripes, "news", R leg detail)
 * - Orange: #F7931A   (third stripe, "." in wordmark)
 *
 * Light/dark mode handling:
 * The full SVG colors are baked in. In dark mode the navy R stays navy
 * (looks good on dark bg); the teal and orange are already accent colors
 * and remain readable. No filter/invert needed.
 */
export function Logo({
  size = 32,
  className,
  full = false,
  withRing = false,
}: LogoProps) {
  const src = full ? "/logo.svg" : "/logo-icon.svg";

  // Aspect ratio: icon is square, full lockup is wide (1.8:1).
  const aspect = full ? 1.8 : 1;
  const width = size * aspect;
  const height = size;

  return (
    <span
      className={cn("relative inline-block shrink-0", className)}
      style={{ width, height }}
    >
      {withRing && !full && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[28%] ring-1 ring-border"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Rangkuman.news"
        width={width}
        height={height}
        className="block h-full w-full object-contain"
      />
    </span>
  );
}
