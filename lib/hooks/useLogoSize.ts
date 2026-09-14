"use client";

import { useEffect, useState } from "react";

const MOBILE_LOGO_SIZE = 32;
const DESKTOP_LOGO_SIZE = 42;
const DESKTOP_BREAKPOINT = 1024;

/**
 * Logo size for the navbar's brand lockup. 32px on mobile / tablet,
 * 42px on desktop (≥1024px wide). The Brand component renders a
 * ring around the icon for sizes ≥40 by default — the navbar opts
 * out of that ring at the call site so the icon sits flush against
 * the navbar background regardless of which size is active here.
 *
 * Starts at `MOBILE_LOGO_SIZE` so SSR renders the same markup as
 * mobile CSR; the effect upgrades to the real value after mount.
 */
export function useLogoSize(): number {
  const [size, setSize] = useState<number>(MOBILE_LOGO_SIZE);

  useEffect(() => {
    const update = () => {
      setSize(
        window.innerWidth >= DESKTOP_BREAKPOINT
          ? DESKTOP_LOGO_SIZE
          : MOBILE_LOGO_SIZE,
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}
