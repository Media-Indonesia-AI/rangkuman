import { cn } from "@/lib/utils";
import type { Sentimen } from "@/lib/mock/recaps";
import { TrendingUp, Minus, TrendingDown } from "lucide-react";

interface SentimentBadgeProps {
  sentiment?: Sentimen;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

interface SentimentConfig {
  label: string;
  bg: string;
  text: string;
  Icon: typeof TrendingUp;
}

const config: Record<Sentimen, SentimentConfig> = {
  positif: { label: "Positif", bg: "bg-bullish-soft", text: "text-bullish", Icon: TrendingUp },
  netral: { label: "Netral", bg: "bg-mixed-soft", text: "text-mixed", Icon: Minus },
  negatif: { label: "Negatif", bg: "bg-bearish-soft", text: "text-bearish", Icon: TrendingDown },
};

/**
 * Solid colored pill badge — like cryptoslate's "News" / "Analysis" tags.
 */
export function SentimentBadge({
  sentiment,
  showLabel = true,
  size = "md",
  className,
}: SentimentBadgeProps) {
  const { label, bg, text, Icon } = config[sentiment ?? "netral"];
  const padding = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded font-mono font-semibold uppercase tracking-widest",
        bg,
        text,
        padding,
        className,
      )}
    >
      <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} aria-hidden />
      {showLabel && <span>{label}</span>}
    </span>
  );
}
