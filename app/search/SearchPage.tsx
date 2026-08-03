"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Clock, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { StoryFilter, TickerItem, TickerListItem } from "@/lib/api";
import { loadTickers, peekTickers } from "@/lib/api/cache";
import { useGetTickerListArticles } from "@/lib/hooks/useGetTickerListArticles";
import { formatTanggalIndonesia } from "@/lib/util/formatDate";

/** Shape consumed by `<SuggestionChip />`. Inline here (rather than
 *  re-exporting from `@/lib/mock/search`, which the page no longer
 *  touches) so the type travels with the component that uses it. */
interface SuggestionItem {
  id: string;
  label: string;
  href: string;
}

function SearchPageContent() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim();

  // Stable filter identity — the array is recreated only when `query`
  // changes, so the hook doesn't refetch on unrelated renders.
  const filters = useMemo<StoryFilter[]>(
    () =>
      query
        ? [{ field: "stock_ticker", operator: "eq", value: query.toUpperCase() }]
        : [],
    [query],
  );
  const { data: tickerArticles, isLoading } = useGetTickerListArticles(
    20,
    0,
    filters,
    Boolean(query),
  );

  // Live ticker catalog (replaces the previous mock-driven
  // `searchAll`). Initialized lazily from the shared cache so a
  // remount that happens after another instance has already
  // fetched shows the data on the first render (no flash of an
  // empty saran-cepat strip). The cache is shared app-wide, so
  // `<TopTicker />` and any other consumer of `loadTickers()`
  // don't duplicate the round-trip.
  const [tickers, setTickers] = useState<TickerItem[] | null>(
    () => peekTickers()?.data ?? null,
  );

  useEffect(() => {
    let cancelled = false;
    void loadTickers()
      .then((res) => {
        if (!cancelled) setTickers(res.data);
      })
      .catch(() => {
        // Swallow — saran cepat collapses to empty until the
        // next mount retries. The widget still renders the
        // `<EmptyState />` for the no-query branch and the
        // "Gak ada hasil" card for the loaded-no-results branch.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Build saran-cepat chips from the live ticker list:
  //   - non-empty query → match against `ticker` OR `company_name`
  //     (case-insensitive substring); fall back to the first 6
  //     tickers when the query is a no-match (e.g. `"BSBR"`, a
  //     ticker not in the catalog).
  //   - empty query       → first 6 tickers as the default browse
  //     list.
  const suggestions = useMemo<SuggestionItem[]>(() => {
    const q = query.trim().toLowerCase();
    return [{
      id: q,
      label: q.toUpperCase(),
      href: `/stock/${q.toUpperCase()}`,
    }];
  }, [query, tickers]);

  return (
    <main className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5 md:max-w-4xl lg:max-w-6xl lg:px-8">
      {/* Back link */}
      <Link
        href="/"
        className="mb-3 inline-flex items-center gap-1.5 text-[12px] text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden />
        Kembali ke Beranda
      </Link>

      {/* Header */}
      <header className="mb-5 border-b border-border-strong pb-3">
        <div className="mb-0.5 flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 text-brand" aria-hidden />
          <span className="label text-text-secondary">Hasil pencarian</span>
        </div>
        <h1 className="text-[20px] font-bold tracking-tight text-text-primary sm:text-[24px]">
          {query ? (
            <>
              Pencarian untuk &ldquo;<span className="font-mono text-brand">{query}</span>&rdquo;
            </>
          ) : (
            "Cari saham atau topik"
          )}
        </h1>
        {query && !isLoading && (
          <p className="mt-1 text-[12px] text-text-muted">
            {tickerArticles.length} artikel ditemukan untuk ticker &ldquo;
            <span className="font-mono text-text-primary">{query.toUpperCase()}</span>
            &rdquo;.
          </p>
        )}
      </header>

      {suggestions.length > 0 && (
        <section className="mb-5" aria-label="Saran cepat">
          <p className="label mb-1.5">Saran cepat</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <SuggestionChip key={s.id} item={s} />
            ))}
          </div>
        </section>
      )}

      {!query ? (
        <EmptyState />
      ) : isLoading ? (
        <div className="rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-10 text-center">
          <p className="font-mono text-[12px] text-text-muted">Memuat…</p>
        </div>
      ) : (
        <section aria-label="Hasil ticker" className="space-y-3">
          {tickerArticles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-10 text-center">
              <Search className="mx-auto h-6 w-6 text-text-faint" aria-hidden />
              <p className="mt-2 text-[13.5px] font-semibold text-text-primary">
                Gak ada hasil untuk &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-[12px] text-text-muted">
                Coba ticker lain, misal BBCA, ANTM, TLKM.
              </p>
            </div>
          ) : (
            tickerArticles.map((item) => (
              <TickerArticleCard key={item.id} item={item} />
            ))
          )}
        </section>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-10 text-text-muted md:max-w-4xl lg:max-w-6xl lg:px-8">Memuat…</div>}>
        <SearchPageContent />
      </Suspense>
      <Footer />
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-10 text-center">
      <Search className="mx-auto h-7 w-7 text-text-faint" aria-hidden />
      <p className="mt-2 text-[14px] font-semibold text-text-primary">
        Coba ketik di kolom pencarian
      </p>
      <p className="mt-1 text-[12px] text-text-muted">
        Topik populer: dividen, nikel, inflasi, BI Rate, IHSG, rupiah, IPO.
      </p>
    </div>
  );
}

function SuggestionChip({ item }: { item: SuggestionItem }) {
  return (
    <Link
      href={item.href}
      className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-2.5 py-1 text-[11.5px] transition-colors hover:border-brand hover:bg-bg-tertiary"
    >
      <TrendingUp className="h-3 w-3 text-bullish" aria-hidden />
      <span className="font-semibold text-text-primary">{item.label}</span>
    </Link>
  );
}

/**
 * Trim a date-only or date-time ISO string to its `YYYY-MM-DD`
 * prefix. Used for URL path segments so a wire-format date
 * (`2026-07-30`) and a wire-format date-time
 * (`2026-07-30T07:00:00+07:00`) produce the same path value.
 * Falls back to the original input when the string doesn't start
 * with a recognizable date — malformed data should surface as a
 * 404, not be silently coerced to an empty string.
 */
function toYmd(value: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  return match ? match[1] : value;
}

function TickerArticleCard({ item }: { item: TickerListItem }) {
  return (
    <Link
      href={`/stock/${encodeURIComponent(item.ticker)}/${encodeURIComponent(toYmd(item.recap_date))}`}
      className="group block rounded-lg border border-border bg-bg-secondary p-3.5 transition-all hover:border-border-strong hover:shadow-card-hover"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded border border-cat-emiten-line bg-cat-emiten-soft px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-cat-emiten">
          {item.ticker}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
          <Clock className="h-2.5 w-2.5" aria-hidden />
          {formatTanggalIndonesia(item.recap_date)}
        </span>
      </div>
      <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-text-primary group-hover:text-brand">
        {item.description}
      </p>
    </Link>
  );
}
