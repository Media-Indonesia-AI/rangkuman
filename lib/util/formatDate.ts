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

/** Today as an ISO 8601 string — used as the default date param. */
export function todayIsoDate(): string {
  return new Date().toISOString();
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

/**
 * Normalize a date value to a UTC ISO 8601 string for query
 * parameters.
 *
 * - Date-only (`YYYY-MM-DD`) that matches today's calendar day
 *   (in the **caller's local timezone**, matching the convention
 *   used by `hariIniIso()` — the function callers actually use to
 *   compute "today"): emitted as the current instant via
 *   `todayIsoDate()`. A "today" query keeps streaming fresh data as
 *   the day progresses, the same way the bare-mount `effectiveDate`
 *   fallback does on `/saham`.
 * - Date-only (`YYYY-MM-DD`) for any other day: emitted as
 *   `YYYY-MM-DDT23:59:59.999Z` — the last moment of that day
 *   in UTC, "the last time before day change". Anchors the
 *   request to the full day's editorial window rather than
 *   just midnight, so a query about a past day returns the
 *   complete day's data instead of a midnight snapshot.
 * - Date-time (any string the `Date` constructor can parse,
 *   e.g. `"2026-07-30T07:00:00+07:00"`): re-emitted via
 *   `toISOString()` so the wire form is canonical UTC
 *   regardless of the caller's local timezone.
 * - Anything that doesn't parse: returned verbatim, so the
 *   request fails at the backend with a clear date error
 *   rather than silently emitting `Invalid Date`.
 *
 * Lives here (rather than next to the API endpoint that uses it)
 * because it's a pure date-formatting helper — same family as
 * `formatSingkat` / `formatTanggalIndonesia` — and pulling it into
 * one place keeps the IDX-specific offset constant out of files
 * that shouldn't need to know about it.
 *
 * ─── Why local-day, not UTC-day ─────────────────────────────────
 *
 * The previous implementation used `todayIsoDate().slice(0, 10)`
 * to detect "today". `todayIsoDate()` is `new Date().toISOString()`
 * — that is, *UTC* — so its `.slice(0, 10)` is the UTC calendar
 * day. Callers (especially `useGetStocksTrending` and the date
 * picker) build the date with `hariIniIso()`, which is the
 * **local** calendar day (`format(new Date(), "yyyy-MM-dd")`).
 *
 * For callers outside UTC (Indonesia is +07:00 / +08:00), the two
 * diverge for ~7–8 hours every day: between local-midnight and
 * the next UTC-midnight, `hariIniIso()` has already advanced to
 * the new day while `todayIsoDate().slice(0, 10)` has not. The
 * "today" branch missed, the date-only string fell through to the
 * end-of-day branch, and the GET was sent with *tomorrow's UTC
 * end-of-day instant* — which the backend has no data for, so
 * widgets like `/trending` rendered empty with no error message.
 *
 * Using `hariIniIso()` (local) as the comparison target makes the
 * two notions of "today" line up for every timezone.
 */
export function toIsoDateTime(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    // "Today" branch — return the current instant so the wire
    // form mirrors `todayIsoDate()` exactly. Without this, a
    // caller that picked today via the date picker would hit
    // the endpoint with `T23:59:59.999Z` (end-of-day) and miss
    // any editorial updates still landing before midnight UTC.
    if (value === hariIniIso()) {
      return todayIsoDate();
    }
    return `${value}T23:59:59.999Z`;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

/**
 * Normalize a date value to a timezone-explicit ISO 8601 string for
 * query parameters, anchored to a caller-specified offset.
 *
 * Counterpart to `toIsoDateTime`: where `toIsoDateTime` always emits
 * UTC for date-only inputs (so a non-UTC caller would silently get
 * the previous calendar day), `toIsoWithTimezone` lets the caller
 * pick the offset the calendar day should be anchored to. Useful for
 * IDX / WIB flows that want `+07:00` midnight, or any other
 * project-local timezone.
 *
 * - Date-only (`YYYY-MM-DD`): emitted as
 *   `YYYY-MM-DDT00:00:00<offset>`, e.g. `2026-07-30` + `"+07:00"` →
 *   `"2026-07-30T00:00:00+07:00"`.
 * - Date-time (any string the `Date` constructor can parse): the
 *   instant is preserved and re-emitted via `toISOString()` —
 *   `Date` doesn't expose a "format in this offset" primitive in
 *   JS, and the wire form must be unambiguous, so the canonical UTC
 *   form is the safest output. The caller's `offset` only changes
 *   the wire form for date-only inputs.
 * - Anything that doesn't parse: returned verbatim, so the request
 *   fails at the backend with a clear date error rather than
 *   silently emitting `Invalid Date`.
 *
 * @param value  Date-only (`YYYY-MM-DD`) or full date-time string.
 * @param offset Timezone offset suffix to attach, e.g. `"+07:00"`
 *               (WIB), `"-05:00"`, `"Z"`.
 */
export function toIsoWithTimezone(value: string, offset: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00${offset}`;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}


