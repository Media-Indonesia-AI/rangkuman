import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CryptoDetailTickersProps {
  /** Stock tickers most affected by this story. */
  tickers: string[];
}

/**
 * "Saham terkait" — row of pill links to each affected ticker's
 * detail page. Renders only when the story carries at least one
 * ticker (most non-stock stories have none).
 */
export function CryptoDetailTickers({ tickers }: CryptoDetailTickersProps) {
  if (tickers.length === 0) return null;

  return (
    <section aria-label="Saham terkait" className="mt-6">
      <h2 className="label mb-2 text-text-secondary">Saham terkait</h2>
      <div className="flex flex-wrap items-center gap-1.5">
        {tickers.map((t) => {
          const href = `/stock/${t}`;
          return (
            <Link
              key={t}
              href={href}
              className="group inline-flex items-center gap-1 rounded border border-cat-saham-line bg-cat-saham-soft px-2.5 py-1 font-mono text-[11px] font-semibold text-cat-saham transition-colors hover:bg-cat-saham-soft/70"
            >
              {t}
              <ChevronRight
                className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}