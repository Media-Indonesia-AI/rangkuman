import {
  format,
  parseISO,
  subDays,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const DATE_FORMAT_LONG = "EEEE, d MMMM yyyy";
export const DATE_FORMAT_SHORT = "d MMM";
export const DATE_FORMAT_ISO = "yyyy-MM-dd";

/**
 * Format an ISO date string (YYYY-MM-DD) into long Indonesian form,
 * e.g. "Selasa, 7 Juni 2026".
 *
 * Returns `isoDate` verbatim when the input doesn't parse into a
 * valid date (an empty string, a malformed stub, or any string
 * `parseISO` can't recover) — date-fns raises `RangeError:
 * Invalid time value` for those, and propagating it would crash
 * the row render. Same defensive convention as
 * `formatSingkat` below; any other error is re-thrown so
 * genuine bugs aren't silently swallowed.
 */
export function formatTanggalIndonesia(isoDate: string): string {
  try {
    return format(parseISO(isoDate), DATE_FORMAT_LONG, { locale: idLocale });
  } catch (err) {
    if (err instanceof RangeError && err.message === "Invalid time value") {
      return isoDate;
    }
    throw err;
  }
}

/**
 * Format an ISO date string into compact Indonesian form,
 * e.g. "7 Jun". Returns `"N/A"` when the input doesn't parse
 * into a valid date (e.g. an empty string, a malformed stub, or
 * a `Date` that `parseISO` can't recover) — date-fns raises
 * `RangeError: Invalid time value` for those, and propagating
 * it would crash the entire sidebar rail. Any other error is
 * re-thrown so genuine bugs aren't silently swallowed.
 */
export function formatSingkat(isoDate: string, dateFormat?: string): string {
  try {
    return format(parseISO(isoDate), dateFormat || "d MMM", { locale: idLocale });
  } catch (err) {
    if (err instanceof RangeError && err.message === "Invalid time value") {
      return "N/A";
    }
    throw err;
  }
}

/** Return today as an ISO date string (YYYY-MM-DD) in the user's local TZ. */
export function hariIniIso(): string {
  return format(new Date(), DATE_FORMAT_ISO);
}

/** Return yesterday as an ISO date string (YYYY-MM-DD). */
export function kemarinIso(): string {
  return format(subDays(new Date(), 1), DATE_FORMAT_ISO);
}

/**
 * Format a date / timestamp as a coarse Indonesian
 * "time elapsed" label — `Baru saja`, `X menit lalu`,
 * `X jam lalu`, `Kemarin`, `X hari lalu`, `X minggu lalu`,
 * `X bulan lalu`, or `X tahun lalu`. Uses `Math.floor` on a
 * millisecond delta so `5 hari 23 jam` reads as `5 hari`,
 * not `6 hari`.
 *
 * Accepts an ISO string, a `Date`, or a millisecond number
 * so callers can pass through whichever shape the upstream
 * payload gives them. The `now` override exists primarily
 * for tests / server rendering; production callers omit it.
 *
 * Moved here from `lib/utils.ts` so all date formatting
 * helpers live in one place — used by the crypto, latest-
 * headlines, related-stories, story-timeline, and hero
 * blocks across the app.
 */
export function getRelativeTime(
  date: Date | string | number,
  now: Date = new Date(),
): string {
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
