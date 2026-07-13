"use client";

import { useMemo } from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Clock, ArrowUpRight, TrendingUp, Hash } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { searchResults, searchAll, type SearchResult, type SearchItem } from "@/lib/mock/search";
import { cn } from "@/lib/utils";

const categoryColor: Record<SearchResult["category"], { text: string; bg: string; border: string }> = {
  ekonomi: { text: "text-cat-ekonomi", bg: "bg-cat-ekonomi-soft", border: "border-cat-ekonomi-line" },
  pemerintah: { text: "text-cat-pemerintah", bg: "bg-cat-pemerintah-soft", border: "border-cat-pemerintah-line" },
  politik: { text: "text-cat-politik", bg: "bg-cat-politik-soft", border: "border-cat-politik-line" },
  emiten: { text: "text-cat-emiten", bg: "bg-cat-emiten-soft", border: "border-cat-emiten-line" },
  global: { text: "text-cat-global", bg: "bg-cat-global-soft", border: "border-cat-global-line" },
  komoditas: { text: "text-brand", bg: "bg-brand-soft", border: "border-brand-line" },
};

function SearchPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const query = (params.get("q") ?? "").trim();

  const results = useMemo(() => (query ? searchResults(query) : []), [query]);
  const suggestions = useMemo(() => searchAll(query, 6), [query]);

  return (
    <main className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
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
        {query && (
          <p className="mt-1 text-[12px] text-text-muted">
            {results.length} cerita dikurasi dari CNBC, Bisnis, Kontan, Bloomberg, Reuters, dan 20+ media.
          </p>
        )}
      </header>

      {!query ? (
        <EmptyState />
      ) : (
        <>
          {/* Quick suggestions */}
          {suggestions.length > 0 && (
            <section className="mb-5" aria-label="Saran cepat">
              <p className="label mb-1.5">Saran cepat</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <SuggestionChip key={`${s.type}-${s.id}`} item={s} />
                ))}
              </div>
            </section>
          )}

          {/* Result list */}
          <section aria-label="Hasil cerita" className="space-y-3">
            {results.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-10 text-center">
                <Search className="mx-auto h-6 w-6 text-text-faint" aria-hidden />
                <p className="mt-2 text-[13.5px] font-semibold text-text-primary">
                  Gak ada hasil untuk &ldquo;{query}&rdquo;
                </p>
                <p className="mt-1 text-[12px] text-text-muted">
                  Coba kata kunci lain: dividen, nikel, inflasi, BI Rate, IHSG.
                </p>
              </div>
            ) : (
              results.map((r) => <ResultCard key={r.id} result={r} query={query} />)
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-10 text-text-muted">Memuat…</div>}>
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

function SuggestionChip({ item }: { item: SearchItem }) {
  const Icon = item.type === "stock" ? TrendingUp : Hash;
  return (
    <Link
      href={item.href}
      className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-2.5 py-1 text-[11.5px] transition-colors hover:border-brand hover:bg-bg-tertiary"
    >
      <Icon
        className={cn(
          "h-3 w-3",
          item.type === "stock" ? "text-bullish" : "text-brand",
        )}
        aria-hidden
      />
      <span className="font-semibold text-text-primary">{item.label}</span>
      <span className="text-text-muted">{item.hint}</span>
    </Link>
  );
}

function ResultCard({ result, query }: { result: SearchResult; query: string }) {
  const cfg = categoryColor[result.category];
  return (
    <Link
      href={result.href}
      className="group block rounded-lg border border-border bg-bg-secondary p-3.5 transition-all hover:border-border-strong hover:shadow-card-hover"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest",
            cfg.text,
            cfg.bg,
            cfg.border,
          )}
        >
          {result.category}
        </span>
        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-text-faint">
          <Clock className="h-2.5 w-2.5" aria-hidden />
          {result.timeAgo}
        </span>
      </div>

      <h3 className="text-[14px] font-bold leading-snug text-text-primary group-hover:text-brand">
        <HighlightedTitle title={result.title} query={query} />
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.55] text-text-secondary">
        {result.summary}
      </p>

      <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
            {result.source}
          </span>
          {result.ticker && (
            <>
              <span className="text-text-faint">·</span>
              <span className="font-mono text-[10px] font-semibold text-text-primary">
                {result.ticker}
              </span>
            </>
          )}
        </div>
        <ArrowUpRight
          className="h-3 w-3 text-text-faint transition-colors group-hover:text-brand"
          aria-hidden
        />
      </div>
    </Link>
  );
}

/** Highlight the search term in the result title. */
function HighlightedTitle({ title, query }: { title: string; query: string }) {
  if (!query) return <>{title}</>;
  const lower = title.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, idx)}
      <mark className="bg-brand/30 px-0.5 text-brand">
        {title.slice(idx, idx + query.length)}
      </mark>
      {title.slice(idx + query.length)}
    </>
  );
}