"use client";

import { SavedButton } from "@/components/SavedButton";
import { ShareButton } from "@/components/ShareButton";
import { SITE_URL } from "@/lib/og";

interface StockCardActionsProps {
  /** Ticker / share id passed to `<SavedButton />` (the saved items
   *  store keys on ticker). */
  id: string;
  /** ISO date string passed through to `<SavedButton />` as the
   *  `publishedAt` for sortability inside the saved list. */
  publishedAt: string;
  /** Color tone — the dark variant is the card-on-dark surfaces
   *  used everywhere on this page. */
  tone: "light" | "dark";
  /** Card's deep-link href, used to build the absolute URL passed
   *  to `<ShareButton />`. Should already include the optional
   *  `?id=` query param when the parent knows the backend headline
   *  id (see `<StockCard />`'s own `id` prop). */
  href: string;
  /** Share title. Convention: `"{TICKER} — Rangkuman"`. */
  title: string;
}

/**
 * Save + share button group used across every non-compact
 * `<StockCard />` variant. Wrapped at `z-10` so the buttons stay
 * clickable above the card's stretched overlay `<Link />`. Each
 * button's own `onClick` calls `preventDefault` + `stopPropagation`
 * to cancel the overlay link's navigation, so saving / sharing
 * never accidentally opens the detail page.
 */
export function StockCardActions({
  id,
  publishedAt,
  tone,
  href,
  title,
}: StockCardActionsProps) {
  return (
    <div className="relative z-10 flex shrink-0 items-center gap-1">
      <SavedButton
        id={id}
        kind="stock"
        publishedAt={publishedAt}
        tone={tone}
      />
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
        const today = new Date().toISOString().slice(0, 10); // yyyy-MM-dd
        const url = `${SITE_URL}${href}/${today}`;
        return (
          <ShareButton
            url={url}
            title={title}
            tone={tone}
          />
        );
      })()}
    </div>
  );
}
