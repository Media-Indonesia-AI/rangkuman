import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

interface BrandProps {
  /** Show the tagline next to / below the logo. Default false. */
  tagline?: boolean;
  /** Logo size in pixels. Default 32. */
  logoSize?: number;
  /**
   * Use the full lockup (icon + wordmark in one SVG).
   * When false, the wordmark is rendered as text next to the icon —
   * useful in compact contexts like the navbar.
   */
  full?: boolean;
  /** Optional extra className for the outer Link. */
  className?: string;
}

/**
 * Brand lockup: Logo (icon or full) + optional wordmark text + optional tagline.
 *
 * Two visual modes:
 * 1. `full={true}` — the SVG already contains the wordmark, so we just render
 *    the SVG and (optionally) the tagline. Used in footer, login.
 * 2. `full={false}` — render the icon SVG, then add the wordmark as React text
 *    next to it. Used in the navbar where the icon is small.
 *
 * Wordmark color treatment:
 * - "Rangkuman" → text-text-primary (default ink)
 * - ".news" → var(--logo-accent) (navy in light, orange in dark)
 */
export function Brand({
  tagline = false,
  logoSize = 32,
  full = false,
  className,
}: BrandProps) {
  return (
    <Link
      href="/"
      aria-label="Rangkuman.news — beranda"
      className={cn("group inline-flex items-center gap-2", className)}
    >
      <Logo size={logoSize} full={full} withRing={logoSize >= 40 && !full} />

      {!full && (
        <span
          className="flex items-baseline whitespace-nowrap"
          style={{ fontSize: logoSize >= 40 ? 18 : 14 }}
        >
          <span className="font-semibold tracking-tight text-text-primary">
            Rangkuman
          </span>
          <span
            className="font-semibold tracking-tight"
            style={{ color: "var(--logo-accent)" }}
          >
            .news
          </span>
        </span>
      )}

      {tagline && (
        <span
          className={cn(
            "font-mono uppercase tracking-widest text-text-faint",
            full
              ? "ml-1 text-[10.5px] tracking-[0.2em] sm:text-[11.5px]"
              : "hidden text-[9.5px] lg:inline",
          )}
        >
          Baca lebih sedikit, tahu lebih banyak.
        </span>
      )}
    </Link>
  );
}
