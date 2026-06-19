import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combine and deduplicate Tailwind classes. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a number as Indonesian Rupiah. */
export function formatCurrency(value: number, options?: { compact?: boolean }): string {
  if (options?.compact && Math.abs(value) >= 1_000_000_000_000) {
    return `Rp ${(value / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (options?.compact && Math.abs(value) >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(2)}M`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format number with thousand separator and fixed decimals. */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Format a percent value with sign. Returns "+1.23%" or "-0.45%". */
export function formatPercent(value: number, decimals = 2): string {
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/** Return tailwind text color class for a given percent value. */
export function percentColorClass(value: number): string {
  if (value > 0) return "text-bullish";
  if (value < 0) return "text-bearish";
  return "text-neutral";
}

/** Return human-readable relative time in Indonesian. */
export function getRelativeTime(date: Date | string | number, now: Date = new Date()): string {
  const target = date instanceof Date ? date : new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} minggu lalu`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} bulan lalu`;
  return `${Math.floor(diffDay / 365)} tahun lalu`;
}

/** Truncate text to a max length with ellipsis. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

/** Build a URL-safe slug from arbitrary text. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}
