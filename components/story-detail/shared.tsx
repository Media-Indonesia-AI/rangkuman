import type { ReactNode } from "react";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import type { StorySentiment } from "@/lib/api";

/** Status icon per sentiment. The API returns `primary_sentiment`
 *  on each `EmbeddedStory`, which the widgets reuse as the editorial
 *  "status" badge since the editorial lifecycle status (ongoing /
 *  paused / resolved) isn't yet exposed by the endpoint. */
export const STATUS_ICON: Record<
  StorySentiment,
  React.ComponentType<{ className?: string }>
> = {
  positive: CheckCircle2,
  negative: XCircle,
  neutral: Eye,
};

/** Pill / dot colors per sentiment. Reused by the hero status badge,
 * the row sentiment pill, and the sidebar pill. */
export const sentimentMeta: Record<
  StorySentiment,
  { label: string; color: string; dot: string }
> = {
  positive: {
    label: "Positif",
    color: "border-bullish/30 bg-bullish/10 text-bullish",
    dot: "bg-bullish",
  },
  negative: {
    label: "Negatif",
    color: "border-bearish/30 bg-bearish/10 text-bearish",
    dot: "bg-bearish",
  },
  neutral: {
    label: "Netral",
    color: "border-border bg-bg-tertiary text-text-muted",
    dot: "bg-text-muted",
  },
};

/** `source_url` may arrive as either a hostname (`market.bisnis.com`)
 *  or a full canonical URL. Anchor `href` needs a scheme, so we
 *  normalize. */
export function articleHref(sourceUrl: string): string {
  return /^https?:\/\//i.test(sourceUrl) ? sourceUrl : `https://${sourceUrl}`;
}

/** Muted "n/a" marker for fields the API doesn't yet return.
 *  Stays consistent across the page so missing-data cells read as
 *  one pattern. */
export function NotAvailable() {
  return (
    <span className="font-mono text-[10.5px] text-text-faint">n/a</span>
  );
}

/** Section header — bold 2px border under a mono uppercase title +
 *  optional subtitle line. Shared by `StoryStoriesList`,
 *  `StoryArticles`, and the sidebar. */
export function SectionHeader({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-end justify-between border-b-2 border-text-primary pb-1.5">
      <div>
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-text-faint">{subtitle}</p>
        )}
      </div>
      {trailing}
    </div>
  );
}
