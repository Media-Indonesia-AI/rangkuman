"use client";

import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useStocksSearch } from "@/lib/hooks/useStocksSearch";
import { SEARCH_DROPDOWN_OPEN_CLASS } from "@/lib/hooks/useSearchDropdownOpen";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { track, EVENTS } from "@/lib/analytics-events";
import { cn } from "@/lib/utils";
import type { StockSearchItem } from "@/lib/api";
import { SearchInput, SuggestionsPanel } from "./search-bar/index";

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

  // Mirror the dropdown's open state onto `<html>` so portal'd
  // consumers (sub-tab bars rendered to `document.body`, which
  // escape the React tree) can react via `useSearchDropdownOpen`
  // instead of needing a Context provider. The class is removed
  // on cleanup so outside-click / Escape / pick-suggestion closes
  // all restore the closed state. Mirrors the
  // `MOBILE_MENU_OPEN_CLASS` writer pattern in `useMobileMenu`.
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add(SEARCH_DROPDOWN_OPEN_CLASS);
    return () => {
      document.documentElement.classList.remove(SEARCH_DROPDOWN_OPEN_CLASS);
    };
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

  const handleSubmit = (e: FormEvent) => {
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

  const handleKeyDown = (e: ReactKeyboardEvent) => {
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
