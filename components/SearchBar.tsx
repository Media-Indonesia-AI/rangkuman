"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, ArrowRight, X, AlertCircle } from "lucide-react";
import { useStocksSearch } from "@/lib/hooks/useStocksSearch";
import { track, EVENTS } from "@/lib/analytics-events";
import { cn } from "@/lib/utils";

interface StockSuggestion {
  href: string;
  label: string;
  hint: string;
}

interface SearchBarProps {
  className?: string;
  /** Optional placeholder override. */
  placeholder?: string;
}

export function SearchBar({ className, placeholder = "Cari saham" }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: stocks, isLoading: stocksLoading, error } = useStocksSearch(query, 10);

  const stockResults: StockSuggestion[] = stocks.map((stock) => ({
    href: `/search/${stock.ticker}`,
    label: stock.ticker,
    hint: stock.company_name,
  }));

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Global ⌘K / Ctrl+K to focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const navigate = (item: StockSuggestion) => {
    setOpen(false);
    setQuery("");
    // The ticker is the symbol before any `:kode` or `/`-delimited
    // segments, lowercased. `StockSuggestion.href` looks like
    // `/stock/BBCA` or `/stock/BBCA/2024-08-27`.
    const ticker = item.href.split("/").filter(Boolean).pop()?.split(":")[0] ?? "";
    track(EVENTS.search_result_select, { ticker: ticker.toUpperCase() });
    router.push(item.href);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (stockResults[activeIdx]) {
      // Suggestion branch — form submit selected the active
      // suggestion. Distinct from a click-on-suggestion (which
      // goes through `onMouseDown` on the dropdown item, also
      // routed through `navigate()`). Both arms fire
      // `search_result_select` via `navigate()`. We also fire
      // `search_submit` here so the form-driven funnel is
      // distinguished from the click-through path.
      track(EVENTS.search_submit, {
        mode: "suggestion",
        query: stockResults[activeIdx].label,
      });
      navigate(stockResults[activeIdx]);
      return;
    }
    if (trimmed.length > 0) {
      track(EVENTS.search_submit, { mode: "free_text", query: trimmed });
      setOpen(false);
      router.push(`/search/?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, stockResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-md", className)}>
      <form onSubmit={handleSubmit} role="search">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint"
            aria-hidden
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Cari saham"
            aria-autocomplete="list"
            className={cn(
              "h-9 w-full rounded-md border border-border bg-bg-secondary pl-8 pr-16 text-[12.5px] text-text-primary placeholder:text-text-muted",
              "transition-colors focus:border-brand focus:outline-none",
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Hapus pencarian"
              className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-text-faint transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          )}
          {!query && (
            <kbd className="pointer-events-none absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[9.5px] text-text-faint sm:inline-block">
              ⌘K
            </kbd>
          )}
        </div>
      </form>

      {/* Suggestion dropdown */}
      {open && query.trim().length > 0 && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[420px] overflow-y-auto rounded-lg border border-border bg-bg-secondary p-1.5 shadow-2xl"
        >
          {stocksLoading ? (
            <div className="px-3 py-6 text-center">
              <p className="font-mono text-[11px] text-text-muted">
                Mencari saham…
              </p>
            </div>
          ) : stockResults.length === 0 || error ? (
            <div className="px-3 py-6 text-center">
              <p className="text-[12px] text-text-muted">
                {error ? error.message : 'Gak ada hasil untuk &ldquo;<span className="font-mono text-text-primary">{query}</span>&rdquo;.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(`/search/?q=${encodeURIComponent(query.trim())}`);
                }}
                className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand hover:text-brand-hover"
              >
                Lihat semua hasil pencarian
                <ArrowRight className="h-3 w-3" aria-hidden />
              </button>
            </div>
          ) : (
            <>
              {stockResults.length > 0 && (
                <div>
                  <p className="px-2 pb-1 pt-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
                    Saham
                  </p>
                  {stockResults.map((item, idx) => (
                    <SuggestionRow
                      key={item.label}
                      item={item}
                      active={idx === activeIdx}
                      onClick={() => navigate(item)}
                      onHover={() => setActiveIdx(idx)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface SuggestionRowProps {
  item: StockSuggestion;
  active: boolean;
  onClick: () => void;
  onHover: () => void;
}

function SuggestionRow({ item, active, onClick, onHover }: SuggestionRowProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      onMouseEnter={onHover}
      className={cn(
        "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors",
        active ? "bg-bg-tertiary" : "hover:bg-bg-tertiary/60",
      )}
    >
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-bg-tertiary text-bullish">
        <TrendingUp className="h-3 w-3" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-semibold text-text-primary">
          {item.label}
        </span>
        <span className="block truncate text-[10.5px] text-text-muted">
          {item.hint}
        </span>
      </span>
      <span className="shrink-0 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-bullish">
        Saham
      </span>
    </button>
  );
}
