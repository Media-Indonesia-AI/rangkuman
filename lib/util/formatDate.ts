import {
  format,
  parseISO,
  subDays,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";

/**
 * Format an ISO date string (YYYY-MM-DD) into long Indonesian form,
 * e.g. "Selasa, 7 Juni 2026".
 *
 * Returns `isoDate` verbatim when the input doesn't parse into a
 * valid date (an empty string, a malformed stub, or any string
 * `parseISO` can't recover) — date-fns raises `RangeError:
 * Invalid time value` for those, and propagating it would crash
 * the row render. Same defensive convention as
 * `formatTanggalSingkat` below; any other error is re-thrown so
 * genuine bugs aren't silently swallowed.
 */
export function formatTanggalIndonesia(isoDate: string): string {
  try {
    return format(parseISO(isoDate), "EEEE, d MMMM yyyy", { locale: idLocale });
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
export function formatTanggalSingkat(isoDate: string): string {
  try {
    return format(parseISO(isoDate), "d MMM", { locale: idLocale });
  } catch (err) {
    if (err instanceof RangeError && err.message === "Invalid time value") {
      return "N/A";
    }
    throw err;
  }
}

/** Return today as an ISO date string (YYYY-MM-DD) in the user's local TZ. */
export function hariIniIso(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Return yesterday as an ISO date string (YYYY-MM-DD). */
export function kemarinIso(): string {
  return format(subDays(new Date(), 1), "yyyy-MM-dd");
}
