"use client";

import Link from "next/link";

interface StockCardOverlayLinkProps {
  /** Card's deep-link href. Includes the optional `?id=` query
   *  param when the parent knows the backend headline id. */
  href: string;
  /** Aria label — typically the ticker. The element has no visible
   *  text (it sits over the card body), so screen readers need an
   *  explicit label to announce the link target. */
  label: string;
}

/**
 * Stretched, absolutely-positioned `<Link />` overlaid on top of
 * the whole `<StockCard />` so the entire card is a single click
 * target. Lives at `z-0`; per-card buttons (Save, Share, source
 * chips, CTA) all sit at `z-10` above it, and their own `onClick`
 * handlers cancel the overlay's navigation.
 *
 * `aria-hidden` is *not* used because the link is the only way a
 * screen reader navigates from the card to the detail page —
 * removing it would leave no a11y path through the card.
 */
export function StockCardOverlayLink({ href, label }: StockCardOverlayLinkProps) {
  return (
    <Link href={href} aria-label={label} className="absolute inset-0 z-0" />
  );
}
