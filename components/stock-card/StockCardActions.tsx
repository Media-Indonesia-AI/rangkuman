"use client";

import { ShareButton } from "@/components/ShareButton";
import { SITE_URL } from "@/lib/og";

interface StockCardActionsProps {
  /** Card's deep-link href, used to build the absolute URL passed
   *  to `<ShareButton />`. Should already include the optional
   *  `?id=` query param when the parent knows the backend headline
   *  id (see `<StockCard />`'s own `id` prop). */
  href: string;
  /** Share title. Convention: `"{TICKER} — Rangkuman"`. */
  title: string;
  /** Color tone — `light` for dark surfaces (e.g. a card on a
   *  hero gradient), `dark` for light surfaces. Passed through
   *  to `<ShareButton />` so the action button matches the
   *  card's surface. */
  tone: "light" | "dark";
  /** Share button size — `compact` (default) for normal cards,
   *  `xs` for dense list rows where a smaller footprint fits
   *  the row layout better. See `<ShareButton />` for the full
   *  size grid. */
  variant?: "xs" | "compact";
}

/**
 * Share-button group used across every non-compact
 * `<StockCard />` variant. Wrapped at `z-10` so the button stays
 * clickable above the card's stretched overlay `<Link />`. The
 * button's own `onClick` calls `preventDefault` + `stopPropagation`
 * to cancel the overlay link's navigation, so sharing never
 * accidentally opens the detail page.
 */
export function StockCardActions({
  href,
  title,
  tone,
  variant = "compact",
}: StockCardActionsProps) {
  return (
    <div className="relative z-10 flex shrink-0 items-center gap-1">
      {/*
        The share URL becomes a daily-recap deep link by
        appending today's date (`yyyy-MM-dd`, derived from
        `new Date()` in the user's local TZ via `toISOString`'s
        slice) as a path segment. That lands on
        `/stock/[kode]/[recapDate]` and shows the current day's
        snapshot when the recipient opens the link. The optional
        `?id=...` backend-headline query on `href` is preserved
        by splitting before the `?` and re-appending after.

        URL-shape pre/post:
          href: /stock/BBCA           → /<origin>/stock/BBCA/2026-07-30
          href: /stock/BBCA?id=ABC    → /<origin>/stock/BBCA/2026-07-30?id=ABC
      */}
      {(() => {
        const url = `${SITE_URL}${href}`;
        return (
          <ShareButton
            url={url}
            title={title}
            tone={tone}
            variant={variant}
          />
        );
      })()}
    </div>
  );
}