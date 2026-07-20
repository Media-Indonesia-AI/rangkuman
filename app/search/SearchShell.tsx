"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search as SearchIcon, ArrowUpRight } from "lucide-react";
import { StockCard } from "@/components/stock-card";
import { EmptyState } from "@/components/EmptyState";
import { stocks } from "@/lib/mock/stocks";
import { recaps, getRecapForStock, TODAY_ISO } from "@/lib/mock/recaps";
import { formatTanggalSingkat } from "@/lib/util/formatDate";
import { initialsOf } from "@/lib/util/formatMedia";
import { cn } from "@/lib/utils";

const SUGGESTIONS = ["BBCA", "TLKM", "ASII", "ANTM", "ICBP"];

function SearchFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

  const updateQuery = (next: string) => {
    setQuery(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim()) params.set("q", next.trim());
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Array<typeof stocks[number] & { matchedRecapIds: string[] }>;
    return stocks
      .filter(
        (s) =>
          s.kode.toLowerCase().includes(q) ||
          s.nama.toLowerCase().includes(q) ||
          s.sektor.toLowerCase().includes(q),
      )
      .map((s) => {
        const matchedRecapIds = recaps
          .filter((r) => r.sahamKode === s.kode)
          .map((r) => r.id);
        return { ...s, matchedRecapIds };
      });
  }, [query]);

  const autocomplete = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as typeof stocks;
    return stocks
      .filter(
        (s) =>
          s.kode.toLowerCase().startsWith(q) || s.nama.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [query]);

  return (
    <>
      <div className="relative mb-6">
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Cari kode atau nama emiten…"
            aria-label="Cari saham"
            className={cn(
              "w-full rounded-md border border-border bg-bg-secondary py-2.5 pl-10 pr-4",
              "text-[14px] text-text-primary placeholder:text-text-muted",
              "focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30",
            )}
            autoComplete="off"
          />
        </div>

        {autocomplete.length > 0 && query.trim() !== "" && (
          <ul
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-bg-elevated shadow-card-hover"
            role="listbox"
          >
            {autocomplete.map((s) => {
              const positive = s.changePercent >= 0;
              return (
                <li key={s.kode} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => updateQuery(s.kode)}
                    className="flex w-full items-center gap-3 border-b border-border px-3 py-2 text-left transition-colors last:border-0 hover:bg-bg-tertiary"
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-bg-card font-mono text-[10px] font-semibold uppercase text-text-secondary"
                    >
                      {initialsOf(s.nama)}
                    </span>
                    <span className="font-mono text-[13px] font-semibold text-text-primary">
                      {s.kode}
                    </span>
                    <span className="flex-1 truncate text-[12.5px] text-text-secondary">
                      {s.nama}
                    </span>
                    <span className="hidden font-mono text-[11px] text-text-muted sm:inline">
                      {s.price.toLocaleString("id-ID")}
                    </span>
                    <span
                      className={
                        positive
                          ? "font-mono text-[11px] font-semibold text-bullish num-tabular"
                          : "font-mono text-[11px] font-semibold text-bearish num-tabular"
                      }
                    >
                      {positive ? "+" : ""}
                      {s.changePercent.toFixed(2)}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {query.trim() === "" ? (
        <>
          <p className="label mb-3">Saran pencarian</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => updateQuery(s)}
                className="rounded border border-border bg-bg-secondary px-3 py-1.5 font-mono text-[12px] font-semibold text-text-primary transition-colors hover:border-brand hover:text-brand"
              >
                {s}
              </button>
            ))}
          </div>
        </>
      ) : results.length === 0 ? (
        <EmptyState
          title="Saham tidak ditemukan"
          description={`Tidak ada hasil untuk "${query.trim()}".`}
          suggestion={`Coba: ${SUGGESTIONS.join(", ")}`}
        />
      ) : (
        <div className="space-y-5">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-text-muted">
            {results.length} hasil
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((s) => {
              const recap = getRecapForStock(s.kode, TODAY_ISO);
              const href = `/stock/${s.kode}`;
              return (
                <section key={s.kode}>
                  {recap ? (
                    <StockCard recap={recap} stock={s} />
                  ) : (
                    <Link
                      href={href}
                      className="card card-hover group block p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="inline-flex h-12 w-12 items-center justify-center rounded border border-border bg-bg-card font-mono text-[12px] font-semibold text-text-secondary"
                        >
                          {initialsOf(s.nama)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-[18px] font-bold text-text-primary">
                              {s.kode}
                            </span>
                            <span className="truncate text-[12.5px] text-text-secondary">
                              {s.nama}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-text-muted">{s.sektor}</p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden />
                      </div>
                    </Link>
                  )}

                  {s.matchedRecapIds.length > 0 && (
                    <div className="mt-2 border-l-2 border-border pl-3">
                      <p className="label mb-1.5">Disebut dalam {s.matchedRecapIds.length} recap</p>
                      <ul className="space-y-1">
                        {s.matchedRecapIds.slice(0, 3).map((rid) => {
                          const r = recaps.find((x) => x.id === rid);
                          if (!r) return null;
                          return (
                            <li
                              key={rid}
                              className="flex items-baseline gap-2 text-[12px] text-text-secondary"
                            >
                              <span className="font-mono text-[10.5px] font-semibold text-text-muted num-tabular">
                                {formatTanggalSingkat(r.tanggal)}
                              </span>
                              <span className="line-clamp-1">
                                {r.ringkasan.length > 100
                                  ? r.ringkasan.slice(0, 100).trimEnd() + "…"
                                  : r.ringkasan}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function SearchFormFallback() {
  return <div className="mb-6 h-11 rounded-md border border-border bg-bg-secondary" />;
}

export function SearchShell() {
  return (
    <Suspense fallback={<SearchFormFallback />}>
      <SearchFormInner />
    </Suspense>
  );
}
