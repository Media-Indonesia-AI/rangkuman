"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, ArrowRight, X } from "lucide-react";
import { useStocksSearch } from "@/lib/hooks/useStocksSearch";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { track, EVENTS } from "@/lib/analytics-events";
import { LoginPromptOverlay } from "@/components/LoginPromptOverlay";
import { cn } from "@/lib/utils";
import type { StockSearchItem } from "@/lib/api";

/** Row shape consumed by the suggestions list. Built from the
 *  raw `useStocksSearch` results so the dropdown only depends
 *  on the fields it actually renders. */
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

/** Free-text search route — used when the user submits a query
 *  that doesn't match any suggestion. The page reads the term
 *  from the `q` query param. */
const FREE_TEXT_SEARCH_PATH = "/search/";

/** Build the free-text search URL for `query`. Centralized so
 *  the form-submit branch and the "lihat semua" link can't
 *  drift apart. */
function buildFreeTextSearchUrl(query: string): string {
  return `${FREE_TEXT_SEARCH_PATH}?q=${encodeURIComponent(query)}`;
}

/** Pull the ticker symbol out of a suggestion's `href`. The
 *  href is one of:
 *    - `/search/{ticker}`       (legacy path-segment form)
 *    - `/search/{ticker}:{...}` (rare, but the colon branch
 *                                existed historically)
 *  Returns uppercase so the analytics payload matches the
 *  shape the rest of the app records (e.g. `BBCA`). */
function parseTickerFromHref(href: string): string {
  const lastSegment = href.split("/").filter(Boolean).pop() ?? "";
  return lastSegment.split(":")[0].toUpperCase();
}

/** Map `useStocksSearch` rows to the dropdown's local shape. */
function toSuggestions(stocks: StockSearchItem[]): StockSuggestion[] {
  return stocks.map((s) => ({
    href: `/search/${s.ticker}`,
    label: s.ticker,
    hint: s.company_name,
  }));
}

export function SearchBar({ className, placeholder = "Cari saham" }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: stocks, isLoading, error, status } = useStocksSearch(query, 10);
  const stockResults = toSuggestions(stocks);

  // The `/stocks/search` endpoint is auth-gated, so a `401`
  // means the visitor is logged out. Surface a login prompt
  // inside the dropdown instead of the generic "Gak ada
  // hasil" message. A logged-in user seeing `401` would
  // usually mean an expired session — that's a separate
  // concern, not the path the prompt is built for (it
  // returns `null` when a user is present).
  const user = useCurrentUser();
  const isUnauthorized = status === 401 && !user;

  // Reset active row when the query changes so a stale highlight
  // from a previous term doesn't carry over to a new result set.
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // Close the dropdown on outside clicks. The listener only
  // attaches while the panel is open, so it pays no cost the
  // rest of the time.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Global ⌘K / Ctrl+K to focus the input from anywhere.
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
    track(EVENTS.search_result_select, { ticker: parseTickerFromHref(item.href) });
    router.push(item.href);
  };

  const submitFreeText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    track(EVENTS.search_submit, { mode: "free_text", query: trimmed });
    setOpen(false);
    router.push(buildFreeTextSearchUrl(trimmed));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const suggestion = stockResults[activeIdx];
    if (suggestion) {
      // Suggestion branch — the form submit picked the active
      // suggestion. Clicking a suggestion goes through
      // `navigate()` instead; both arms fire
      // `search_result_select`, and the form-driven funnel
      // additionally fires `search_submit` so the two paths
      // are distinguishable in analytics.
      track(EVENTS.search_submit, { mode: "suggestion", query: suggestion.label });
      navigate(suggestion);
      return;
    }
    submitFreeText(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    // No results means no row to navigate to — bail before
    // clamping `activeIdx` into a negative range. The 401
    // overlay branch is the common case (empty list), but
    // this also covers the "no matches" empty state.
    if (stockResults.length === 0) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
      return;
    }
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

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-md", className)}>
      <form onSubmit={handleSubmit} role="search">
        <SearchInput
          inputRef={inputRef}
          value={query}
          placeholder={placeholder}
          onChange={(v) => {
            setQuery(v);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onClear={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          onKeyDown={handleKeyDown}
        />
      </form>

      {showPanel && (
        <SuggestionsPanel
          query={query}
          isLoading={isLoading}
          error={error}
          isUnauthorized={isUnauthorized}
          results={stockResults}
          activeIdx={activeIdx}
          onPick={navigate}
          onHover={setActiveIdx}
          onSeeAll={() => submitFreeText(query)}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────

interface SearchInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onClear: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/** The search input row: leading icon, the input itself, and
 *  a trailing affordance that swaps between the clear button
 *  (when there's text) and the `⌘K` keyboard hint (when it's
 *  empty). */
function SearchInput({
  inputRef,
  value,
  placeholder,
  onChange,
  onFocus,
  onClear,
  onKeyDown,
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label="Cari saham"
        aria-autocomplete="list"
        className={cn(
          "h-9 w-full rounded-md border border-border bg-bg-secondary pl-8 pr-16 text-[12.5px] text-text-primary placeholder:text-text-muted",
          "transition-colors focus:border-brand focus:outline-none",
        )}
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Hapus pencarian"
          className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-text-faint transition-colors hover:bg-bg-tertiary hover:text-text-primary"
        >
          <X className="h-3 w-3" aria-hidden />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[9.5px] text-text-faint sm:inline-block">
          ⌘K
        </kbd>
      )}
    </div>
  );
}

interface SuggestionsPanelProps {
  query: string;
  isLoading: boolean;
  error: Error | null;
  /** True when the request returned `401` and the user is
   *  logged out. The panel swaps its body for the login
   *  prompt overlay in that case — the suggestions list,
   *  loading spinner, and "no results" branch are all
   *  meaningless once the endpoint is known to be
   *  auth-gated. */
  isUnauthorized: boolean;
  results: StockSuggestion[];
  activeIdx: number;
  onPick: (item: StockSuggestion) => void;
  onHover: (idx: number) => void;
  onSeeAll: () => void;
  onClose: () => void;
}

/** Dropdown that appears under the input while the user is
 *  actively searching. Renders one of four states, dispatched
 *  in priority order:
 *    1. `401` + logged out → login prompt overlay
 *    2. loading            → spinner message
 *    3. error / no results → "no results" with "see all"
 *    4. otherwise          → suggestion rows */
function SuggestionsPanel({
  query,
  isLoading,
  error,
  isUnauthorized,
  results,
  activeIdx,
  onPick,
  onHover,
  onSeeAll,
  onClose,
}: SuggestionsPanelProps) {
  return (
    <div
      id="search-suggestions"
      role="listbox"
      className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[420px] overflow-y-auto rounded-lg border border-border bg-bg-secondary p-1.5 shadow-2xl"
    >
      {isUnauthorized ? (
        // Wrap the overlay in a `relative` container with a
        // `min-h` so the panel has layout content. The
        // overlay itself is `absolute inset-0` (contributes
        // no height of its own), so without the wrapper the
        // panel would collapse to its `p-1.5` padding and
        // the prompt would be invisible. The `relative` on
        // the wrapper also re-establishes the containing
        // block the overlay needs to fill itself against.
        <div className="relative min-h-[140px]">
          <LoginPromptOverlay title="Login untuk mencari saham" />
        </div>
      ) : isLoading ? (
        <LoadingState />
      ) : results.length === 0 || error ? (
        <EmptySearchState
          query={query}
          error={error}
          onSeeAll={onSeeAll}
          onClose={onClose}
        />
      ) : (
        <SuggestionsList
          results={results}
          activeIdx={activeIdx}
          onPick={onPick}
          onHover={onHover}
        />
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="px-3 py-6 text-center">
      <p className="font-mono text-[11px] text-text-muted">Mencari saham…</p>
    </div>
  );
}

interface EmptySearchStateProps {
  query: string;
  error: Error | null;
  onSeeAll: () => void;
  onClose: () => void;
}

/** Shown when the search returned no results, or the request
 *  errored. Always offers a "lihat semua" link so the user
 *  can fall through to the full search page with the same
 *  query. */
function EmptySearchState({
  query,
  error,
  onSeeAll,
  onClose,
}: EmptySearchStateProps) {
  return (
    <div className="px-3 py-6 text-center">
      <p className="text-[12px] text-text-muted">
        {error ? (
          error.message
        ) : (
          <>
            Gak ada hasil untuk &ldquo;
            <span className="font-mono text-text-primary">{query}</span>
            &rdquo;.
          </>
        )}
      </p>
      <button
        type="button"
        onClick={() => {
          onClose();
          onSeeAll();
        }}
        className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand hover:text-brand-hover"
      >
        Lihat semua hasil pencarian
        <ArrowRight className="h-3 w-3" aria-hidden />
      </button>
    </div>
  );
}

interface SuggestionsListProps {
  results: StockSuggestion[];
  activeIdx: number;
  onPick: (item: StockSuggestion) => void;
  onHover: (idx: number) => void;
}

/** The successful-results branch of the dropdown. Renders a
 *  section header followed by one row per suggestion. The
 *  header is hardcoded to "Saham" — the only kind of result
 *  the inline search currently returns. */
function SuggestionsList({
  results,
  activeIdx,
  onPick,
  onHover,
}: SuggestionsListProps) {
  return (
    <div>
      <p className="px-2 pb-1 pt-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
        Saham
      </p>
      {results.map((item, idx) => (
        <SuggestionRow
          key={item.label}
          item={item}
          active={idx === activeIdx}
          onClick={() => onPick(item)}
          onHover={() => onHover(idx)}
        />
      ))}
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
