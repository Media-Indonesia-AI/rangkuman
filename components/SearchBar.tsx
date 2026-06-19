"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Hash, ArrowRight, X } from "lucide-react";
import { searchAll, groupByType, type SearchItem } from "@/lib/mock/search";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  /** Optional placeholder override. */
  placeholder?: string;
}

export function SearchBar({ className, placeholder = "Cari saham atau topik..." }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtered suggestions
  const suggestions = useMemo<SearchItem[]>(() => {
    if (!query.trim()) return [];
    return searchAll(query, 8);
  }, [query]);

  const { stocks: stockResults, topics: topicResults } = useMemo(
    () => groupByType(suggestions),
    [suggestions],
  );

  // Flatten for keyboard navigation
  const flat = useMemo(() => [...stockResults, ...topicResults], [stockResults, topicResults]);

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

  const navigate = (item: SearchItem) => {
    setOpen(false);
    setQuery("");
    router.push(item.href);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flat[activeIdx]) {
      navigate(flat[activeIdx]);
      return;
    }
    if (query.trim().length > 0) {
      setOpen(false);
      router.push(`/search/?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flat.length - 1));
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
            aria-label="Cari saham atau topik"
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
          {flat.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-[12px] text-text-muted">
                Gak ada hasil untuk &ldquo;<span className="font-mono text-text-primary">{query}</span>&rdquo;.
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
                      key={item.id}
                      item={item}
                      active={idx === activeIdx}
                      onClick={() => navigate(item)}
                      onHover={() => setActiveIdx(idx)}
                      Icon={TrendingUp}
                      iconClass="text-bullish"
                    />
                  ))}
                </div>
              )}

              {topicResults.length > 0 && (
                <div>
                  <p className="px-2 pb-1 pt-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-faint">
                    Topik
                  </p>
                  {topicResults.map((item, idx) => {
                    const absoluteIdx = stockResults.length + idx;
                    return (
                      <SuggestionRow
                        key={item.id}
                        item={item}
                        active={absoluteIdx === activeIdx}
                        onClick={() => navigate(item)}
                        onHover={() => setActiveIdx(absoluteIdx)}
                        Icon={Hash}
                        iconClass="text-brand"
                      />
                    );
                  })}
                </div>
              )}

              {/* Footer: "view all results" link */}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(`/search/?q=${encodeURIComponent(query.trim())}`);
                }}
                className="mt-1 flex w-full items-center justify-between rounded px-2 py-1.5 text-[11.5px] font-semibold text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-brand"
              >
                <span>Lihat semua hasil untuk &ldquo;{query}&rdquo;</span>
                <ArrowRight className="h-3 w-3" aria-hidden />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface SuggestionRowProps {
  item: SearchItem;
  active: boolean;
  onClick: () => void;
  onHover: () => void;
  Icon: typeof TrendingUp;
  iconClass: string;
}

function SuggestionRow({ item, active, onClick, onHover, Icon, iconClass }: SuggestionRowProps) {
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
      <span
        className={cn(
          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-bg-tertiary",
          iconClass,
        )}
      >
        <Icon className="h-3 w-3" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-semibold text-text-primary">
          {item.label}
        </span>
        <span className="block truncate text-[10.5px] text-text-muted">
          {item.hint}
        </span>
      </span>
      <span
        className={cn(
          "shrink-0 font-mono text-[9.5px] font-semibold uppercase tracking-widest",
          item.type === "stock" ? "text-bullish" : "text-brand",
        )}
      >
        {item.type === "stock" ? "Saham" : "Topik"}
      </span>
    </button>
  );
}
