"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type CryptoSubNavValue = "top" | "pasar";

interface CryptoSubNavProps {
  active: CryptoSubNavValue;
  onChange: (v: CryptoSubNavValue) => void;
  className?: string;
}

const TABS: { value: CryptoSubNavValue; label: string }[] = [
  { value: "top", label: "Recap" },
  { value: "pasar", label: "Pasar" },
];

/** Locator for the page navbar. The navbar is the only
 *  `<header>` that is `sticky top-0`, so a class-hint query is
 *  stable across the routes where this component is used. */
function findNavbar(): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    'header[class*="sticky"][class*="top-0"]',
  );
}

export function CryptoSubNav({ active, onChange, className }: CryptoSubNavProps) {
  // Portal needs `document.body`, which only exists after mount.
  const [mounted, setMounted] = useState(false);

  // Pixels from viewport top to the pill's top edge. We keep this
  // in state so the pill's `style.top` reflects the navbar's live
  // bottom edge. The navbar's vertical position is dynamic because
  // the TopTicker renders above the navbar in document order — at
  // scroll 0 the navbar sits just below the ticker (~y=50+56), and
  // only after the ticker scrolls away does the sticky navbar
  // settle at y=0-56. A static `top-X` value can't cover both cases,
  // so we measure.
  const [topOffset, setTopOffset] = useState(64);

  // Whether to render the navbar-matching translucent chrome. The
  // bar's backdrop is only useful once the user has scrolled and the
  // bar is overlaying moving content — at scroll 0 the bar sits in
  // the clear gap between the navbar and the page content, so we
  // skip the bg/border entirely to avoid a double-strip seam with
  // the navbar's own bottom border.
  const [hasChrome, setHasChrome] = useState(false);

  useEffect(() => {
    setMounted(true);

    const update = () => {
      const navbar = findNavbar();
      if (!navbar) return;
      const rect = navbar.getBoundingClientRect();
      // Flush against the navbar's bottom edge (no visual gap).
      // Guard against negative values when the navbar is scrolled
      // off the top.
      setTopOffset(Math.max(0, rect.bottom));
      // Trigger chrome as soon as the user has scrolled at all — any
      // scroll position past 0 means the bar is in motion over page
      // content and needs the backdrop to stay legible.
      setHasChrome(window.scrollY > 0);
    };

    update();

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    // ResizeObserver catches ticker / widget height changes that
    // don't fire scroll or resize (the ticker marquee can grow /
    // shrink, and so can any element above the navbar).
    const ro = new ResizeObserver(update);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      role="tablist"
      aria-label="Sub-tab crypto"
      style={{ top: `${topOffset}px` }}
      className={cn(
        // Block-level bar matching the navbar's chrome when scrolled,
        // transparent when at scroll 0:
        //   - `hasChrome` (scrollY > 0): full navbar treatment with
        //     `border-b`, `bg-bg-primary/95`, and `backdrop-blur`
        //     so the bar reads as a translucent floating strip when
        //     it's overlaying scrolled page content.
        //   - at scroll 0: no bg, no border — the bar just sits
        //     between the navbar and page content as a transparent
        //     centered pill, no double-seam with the navbar.
        "fixed left-0 right-0 z-50 transition-colors",
        hasChrome
          ? "border-b border-border bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/80"
          : "border-b border-transparent",
        className,
      )}
    >
      <div
        className={cn(
          // Match the navbar's `py-2` while scrolling (compact
          // floating strip), then grow the bottom padding at scroll
          // 0 so the pill row has visible breathing room above the
          // page content below it.
          "mx-auto flex max-w-7xl items-center justify-center px-4 sm:px-6",
          hasChrome ? "py-2" : "pt-2 pb-8",
        )}
      >
        <div className="inline-flex items-center gap-1 rounded-md border border-border bg-bg-secondary p-1">
          {TABS.map((t) => {
            const isActive = active === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(t.value)}
                className={cn(
                  "rounded px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-bg-tertiary text-text-primary"
                    : "text-text-muted hover:text-text-primary",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
