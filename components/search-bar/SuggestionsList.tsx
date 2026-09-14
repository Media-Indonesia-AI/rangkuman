"use client";

import { SuggestionRow } from "./SuggestionRow";

interface SuggestionsListProps {
  results: { href: string; label: string; hint: string }[];
  activeIdx: number;
  onPick: (item: { href: string; label: string; hint: string }) => void;
  onHover: (idx: number) => void;
}

/** The successful-results branch of the dropdown. Renders a
 *  section header followed by one `<SuggestionRow />` per result.
 *  The header is hardcoded to "Saham" — the only kind of result
 *  the inline search currently returns. */
export function SuggestionsList({
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
