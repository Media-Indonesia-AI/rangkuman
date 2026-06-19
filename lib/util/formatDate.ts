import { format, parseISO, subDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";

/**
 * Format an ISO date string (YYYY-MM-DD) into long Indonesian form,
 * e.g. "Selasa, 7 Juni 2026".
 */
export function formatTanggalIndonesia(isoDate: string): string {
  return format(parseISO(isoDate), "EEEE, d MMMM yyyy", { locale: idLocale });
}

/**
 * Format an ISO date string into compact Indonesian form,
 * e.g. "7 Jun".
 */
export function formatTanggalSingkat(isoDate: string): string {
  return format(parseISO(isoDate), "d MMM", { locale: idLocale });
}

/** Return today as an ISO date string (YYYY-MM-DD) in the user's local TZ. */
export function hariIniIso(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Return yesterday as an ISO date string (YYYY-MM-DD). */
export function kemarinIso(): string {
  return format(subDays(new Date(), 1), "yyyy-MM-dd");
}
