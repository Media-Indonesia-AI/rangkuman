"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/hooks/useTheme";

interface LogoProps {
  size?: number;
  className?: string;
  /** Show the full lockup (icon + wordmark) instead of just the icon. */
  full?: boolean;
  /** Subtle ring around the icon (good for footers). */
  withRing?: boolean;
}

/**
 * Rangkuman.news logo — uses the brand assets in `public/`:
 *
 * - `blue.png`   — blue R icon, light theme
 * - `orange.png` — orange R icon, dark theme
 *
 * Theme handling:
 * The icon picks the blue or orange variant based on the site's
 * `.dark` class on `<html>` via `useTheme()`. SSR + first client
 * render default to light (`blue.png`) to match the `:root` palette;
 * the hook re-renders with the correct variant once the theme is known.
 *
 * Both files are square (1:1) — the wordmark stays composed in React
 * (see `components/Brand.tsx`), so we render the same icon asset in
 * both `full={true}` and `full={false}` modes.
 */
export function Logo({
  size = 32,
  className,
  full = false,
  withRing = false,
}: LogoProps) {
  const theme = useTheme();
  const src = theme === "dark" ? "/orange.png" : "/blue.png";

  const width = size;
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
