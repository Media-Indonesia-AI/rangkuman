"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onClear: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/** The search input row: leading icon, the input itself, and a
 *  trailing affordance that swaps between the clear button (when
 *  there's text) and the `⌘K` keyboard hint (when it's empty). */
export function SearchInput({
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
