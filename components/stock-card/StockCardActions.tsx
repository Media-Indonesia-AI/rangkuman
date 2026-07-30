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
        `href` is built by `<StockCard />` as a path that always
        carries a leading slash (e.g. `/stock/BBCA?id=ABC`), so a
        straight concatenation with `SITE_URL` produces the
        correct absolute URL. Sourcing the origin from
        `lib/og.ts` keeps the production domain in one place —
        change it there, every caller picks up the new value.
      */}
      <ShareButton
        url={`${SITE_URL}${href}`}
        title={title}
        tone={tone}
      />
    </div>
  );
}
