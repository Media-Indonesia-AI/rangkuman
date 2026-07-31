"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  parseISO,
  subDays,
  addDays,
  isSameDay,
  isAfter,
  isBefore,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
  getDay,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  /** Currently selected ISO date (YYYY-MM-DD). */
  value: string;
  /** Called when user picks a new date. Use this when the picker
   *  drives local state (e.g. `useState`). Mutually exclusive with
   *  `hrefFor` — when both are passed, `hrefFor` wins and `onChange`
   *  is ignored. */
  onChange?: (iso: string) => void;
  /** Builds the destination URL for a given ISO date. When provided,
   *  the picker's interactive targets (prev/next arrows, day grid,
   *  "Loncat ke hari ini") render as Next.js `<Link>` elements so
   *  navigation is declarative — Next.js prefetches the destination
   *  and `AggregateSummary` doesn't need a `useRouter` hook to wire
   *  up the navigation. Mutually exclusive with `onChange`. */
  hrefFor?: (iso: string) => string;
  /** Max lookback in days from "today". Default 30. */
  maxLookbackDays?: number;
  /** The "today" anchor for navigation bounds. Default: actual today. */
  todayIso?: string;
  className?: string;
}

const DAY_NAMES_MIN = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;

export function DatePicker({
  value,
  onChange,
  hrefFor,
  maxLookbackDays = 30,
  todayIso,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(parseISO(value));
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // When value changes (via arrows), keep the calendar month in sync
  useEffect(() => {
    if (!open) setViewMonth(parseISO(value));
  }, [value, open]);

  const today = todayIso ? parseISO(todayIso) : new Date();
  const selected = parseISO(value);
  const minDate = subDays(today, maxLookbackDays);

  const canGoForward = isBefore(selected, today);
  const canGoBack = isAfter(selected, minDate);
  // `mode` resolves once per render: when `hrefFor` is passed we render
  // the interactive targets as Next.js `<Link>` for declarative
  // navigation; when only `onChange` is passed we keep the imperative
  // button-based shift handler. The two modes are mutually exclusive.
  const mode: "link" | "callback" = hrefFor ? "link" : "callback";

  const shift = (days: number) => {
    const next = days > 0 ? addDays(selected, days) : subDays(selected, -days);
    if (days < 0 && isBefore(next, minDate)) return;
    if (days > 0 && isAfter(next, today)) return;
    onChange?.(format(next, "yyyy-MM-dd"));
  };

  // Arrow-target helpers — return the href the prev/next buttons should
  // navigate to, or `null` when the target is out of bounds (so the
  // caller can render a disabled, non-interactive control instead of
  // a link that 404s on click). Used only when `mode === "link"`.
  const prevIso = canGoBack
    ? format(subDays(selected, 1), "yyyy-MM-dd")
    : null;
  const nextIso = canGoForward
    ? format(addDays(selected, 1), "yyyy-MM-dd")
    : null;
  const todayIsoValue = format(today, "yyyy-MM-dd");

  // Build calendar grid for the current view month
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const monthLabel = format(viewMonth, "MMMM yyyy", { locale: idLocale });
  const selectedLabel = format(selected, "EEEE, d MMMM yyyy", { locale: idLocale });

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {/* Trigger pill */}
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-md border border-border bg-bg-secondary p-1",
        )}
      >
        {/* Prev arrow — `<Link>` for declarative navigation when
            `hrefFor` is provided; `<button>` otherwise. Always
            disabled at the lookback-window edge in both modes. */}
        {mode === "link" && prevIso ? (
          <Link
            href={hrefFor!(prevIso)}
            prefetch
            aria-label="Tanggal sebelumnya"
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary",
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={!canGoBack}
            aria-label="Tanggal sebelumnya"
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded text-text-secondary transition-colors",
              canGoBack
                ? "hover:bg-bg-tertiary hover:text-text-primary"
                : "cursor-not-allowed opacity-30",
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}

        {/* Calendar trigger — always a button (toggles the dropdown,
            no navigation involved). */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[12.5px] font-medium transition-colors",
            open
              ? "bg-bg-tertiary text-text-primary"
              : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
          )}
        >
          <CalendarIcon className="h-3 w-3 text-brand" aria-hidden />
          <span>{selectedLabel}</span>
        </button>

        {/* Next arrow — same dual-mode pattern as prev. */}
        {mode === "link" && nextIso ? (
          <Link
            href={hrefFor!(nextIso)}
            prefetch
            aria-label="Tanggal berikutnya"
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary",
            )}
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={!canGoForward}
            aria-label="Tanggal berikutnya"
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded text-text-secondary transition-colors",
              canGoForward
                ? "hover:bg-bg-tertiary hover:text-text-primary"
                : "cursor-not-allowed opacity-30",
            )}
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>

      {/* Calendar dropdown */}
      {open && (
        <div
          role="dialog"
          aria-label="Pilih tanggal"
          className="absolute left-0 top-full z-50 mt-1.5 w-[280px] rounded-lg border border-border bg-bg-secondary p-3 shadow-2xl"
        >
          {/* Month nav */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth(subMonths(viewMonth, 1))}
              aria-label="Bulan sebelumnya"
              className="inline-flex h-7 w-7 items-center justify-center rounded text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            </button>
            <span className="font-mono text-[12px] font-semibold uppercase tracking-widest text-text-primary">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              aria-label="Bulan berikutnya"
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded text-text-secondary transition-colors",
                isSameMonth(viewMonth, today)
                  ? "cursor-not-allowed opacity-30"
                  : "hover:bg-bg-tertiary hover:text-text-primary",
              )}
              disabled={isSameMonth(viewMonth, today)}
            >
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          {/* Day-name header */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {DAY_NAMES_MIN.map((d) => (
              <span
                key={d}
                className="py-1 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((d) => {
              const inMonth = getDay(d) >= 0 && d.getMonth() === viewMonth.getMonth();
              const iso = format(d, "yyyy-MM-dd");
              const isSelected = iso === value;
              const isToday = isSameDay(d, today);
              const isFuture = isAfter(d, today);
              const isBeforeMin = isBefore(d, minDate);
              const disabled = isFuture || isBeforeMin;
              const dayClassName = cn(
                "relative h-8 rounded font-mono text-[11.5px] font-medium transition-colors",
                disabled
                  ? "cursor-not-allowed text-text-faint/40"
                  : isSelected
                    ? "bg-brand text-bg-primary"
                    : inMonth
                      ? "text-text-primary hover:bg-bg-tertiary"
                      : "text-text-faint hover:bg-bg-tertiary/50",
              );
              const dayLabel = format(d, "EEEE, d MMMM yyyy", { locale: idLocale });
              // In link mode, an enabled day becomes a <Link>; a
              // disabled day renders as a non-interactive <span>
              // (caller chose to disable that date — it shouldn't be
              // navigable).
              if (mode === "link" && !disabled) {
                return (
                  <Link
                    key={iso}
                    href={hrefFor!(iso)}
                    prefetch
                    aria-label={dayLabel}
                    onClick={() => setOpen(false)}
                    className={dayClassName}
                  >
                    {d.getDate()}
                    {isToday && !isSelected && (
                      <span
                        aria-hidden
                        className="absolute bottom-0.5 left-1/2 h-0.5 w-1 -translate-x-1/2 rounded-full bg-brand"
                      />
                    )}
                  </Link>
                );
              }
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange?.(iso);
                    setOpen(false);
                  }}
                  className={dayClassName}
                  aria-label={dayLabel}
                >
                  {d.getDate()}
                  {isToday && !isSelected && (
                    <span
                      aria-hidden
                      className="absolute bottom-0.5 left-1/2 h-0.5 w-1 -translate-x-1/2 rounded-full bg-brand"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-border pt-2">
            {/* "Loncat ke hari ini" — link in link mode, button in
                callback mode. The dropdown closes on click via
                `setOpen(false)` (button onClick) or implicit
                navigation away from the page (link). */}
            {mode === "link" ? (
              <Link
                href={hrefFor!(todayIsoValue)}
                prefetch
                onClick={() => setOpen(false)}
                className="block w-full rounded px-2 py-1.5 text-center text-[11.5px] font-medium text-brand transition-colors hover:bg-brand-soft"
              >
                Loncat ke hari ini
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onChange?.(todayIsoValue);
                  setOpen(false);
                }}
                className="w-full rounded px-2 py-1.5 text-[11.5px] font-medium text-brand transition-colors hover:bg-brand-soft"
              >
                Loncat ke hari ini
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
