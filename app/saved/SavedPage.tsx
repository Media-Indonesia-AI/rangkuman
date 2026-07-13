"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2, ArrowUpRight, Filter, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShareButton } from "@/components/ShareButton";
import { SavedButton } from "@/components/SavedButton";
import { useSaved } from "@/lib/hooks/useSaved";
import { getStockByKode } from "@/lib/mock/stocks";
import { getRecapsForStock } from "@/lib/mock/recaps";
import { getNewsStoriesByDate, type NewsStory } from "@/lib/mock/general-news";
import { cn } from "@/lib/utils";

type FilterKind = "all" | "stock" | "story";

export default function SavedPage() {
  const { items, count } = useSaved();
  const [filter, setFilter] = useState<FilterKind>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((it) => it.kind === filter);
  }, [items, filter]);

  const stockCount = items.filter((it) => it.kind === "stock").length;
  const storyCount = items.filter((it) => it.kind === "story").length;

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <header className="mb-5 border-b border-border-strong pb-3">
          <div className="mb-1 flex items-center gap-1.5">
            <Bookmark className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="label text-text-secondary">Koleksi lo</span>
            <span className="font-mono text-[10.5px] text-text-muted">
              · {count} item · {stockCount} saham · {storyCount} cerita
            </span>
          </div>
          <h1 className="text-[20px] font-bold tracking-tight text-text-primary sm:text-[24px]">
            Berita Tersimpan
          </h1>
          <p className="mt-1 text-[12.5px] leading-relaxed text-text-muted">
            Koleksi berita yang lo simpan buat dibaca nanti. Disimpan lokal di browser, gak perlu akun.
          </p>
        </header>

        {count === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Filter */}
            <div className="mb-4 inline-flex items-center gap-1 rounded-md border border-border bg-bg-secondary p-1">
              <FilterPill
                active={filter === "all"}
                onClick={() => setFilter("all")}
                label="Semua"
                count={items.length}
              />
              <FilterPill
                active={filter === "stock"}
                onClick={() => setFilter("stock")}
                label="Saham"
                count={stockCount}
              />
              <FilterPill
                active={filter === "story"}
                onClick={() => setFilter("story")}
                label="Cerita"
                count={storyCount}
              />
            </div>

            {/* List */}
            <ol className="space-y-2">
              {filtered.map((it) => (
                <li key={it.id}>
                  {it.kind === "stock" ? (
                    <SavedStockItem id={it.id} publishedAt={it.publishedAt} />
                  ) : (
                    <SavedStoryItem id={it.id} publishedAt={it.publishedAt} />
                  )}
                </li>
              ))}
            </ol>

            {/* Footer clear hint */}
            <p className="mt-6 border-t border-border pt-3 text-center font-mono text-[10.5px] text-text-muted">
              Klik ikon bookmark di kartu untuk menghapus dari tersimpan.
            </p>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-bg-secondary px-6 py-12 text-center">
      {/* Decorative empty bookmark illustration */}
      <div className="relative mb-4 flex h-24 w-24 items-center justify-center">
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-text-faint"
          aria-hidden
        >
          {/* Outer dashed circle */}
          <circle
            cx="48"
            cy="48"
            r="44"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          {/* Bookmark shape */}
          <path
            d="M36 26 L60 26 L60 70 L48 60 L36 70 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="none"
          />
          {/* X marker on top */}
          <line x1="44" y1="38" x2="52" y2="46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="52" y1="38" x2="44" y2="46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-[15px] font-bold text-text-primary">Belum ada yang lo simpan</h2>
      <p className="mt-1 max-w-sm text-[12.5px] leading-relaxed text-text-muted">
        Klik ikon <span className="inline-flex items-center gap-0.5 text-text-secondary">
          <Bookmark className="inline h-3 w-3" aria-hidden /> simpan
        </span> di kartu berita atau saham favorit. Koleksi lo bakal muncul di sini, rapi & siap dibaca kapan aja.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-3 text-[12.5px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover"
        >
          Mulai dari Beranda
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
        <Link
          href="/trending"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-bg-tertiary px-3 text-[12.5px] font-semibold text-text-primary transition-colors hover:border-border-strong"
        >
          Lihat Trending
        </Link>
      </div>
    </div>
  );
}

function SavedStockItem({ id, publishedAt }: { id: string; publishedAt: string }) {
  const stock = getStockByKode(id);
  const recaps = getRecapsForStock(id);
  const recap = recaps[0];
  if (!stock) return null;
  const change = stock.changePercent;
  const href = `/stock/${id}`;
  const isPos = change >= 0;

  return (
    <article className="group flex items-center gap-3 rounded-lg border border-border bg-bg-secondary p-3 transition-colors hover:border-border-strong sm:gap-4 sm:p-4">
      {/* Ticker chip */}
      <Link
        href={href}
        className={cn(
          "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md font-mono text-[10.5px] font-bold leading-none",
          isPos
            ? "bg-bullish-soft text-bullish"
            : "bg-bearish-soft text-bearish",
        )}
        aria-label={`${id} — ${stock.nama}`}
      >
        <span className="text-[13px] font-bold tracking-tighter">{id}</span>
        <span className="mt-0.5 text-[8px] font-medium opacity-80">{stock.sektor.slice(0, 8)}</span>
      </Link>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <Link
          href={href}
          className="block"
        >
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-mono text-[14px] font-bold tracking-tighter text-text-primary group-hover:text-brand sm:text-[15px]">
              {id}
            </span>
            <span className="truncate text-[11.5px] text-text-muted sm:text-[12.5px]">
              {stock.nama}
            </span>
          </div>
          {recap ? (
            <p className="mt-1 line-clamp-2 text-[12px] leading-[1.5] text-text-secondary">
              {recap.ringkasan}
            </p>
          ) : (
            <p className="mt-1 text-[12px] text-text-muted">
              {isPos ? "▲ +" : "▼ "}
              {Math.abs(change).toFixed(2)}% · {stock.sektor} · Vol {stock.volume}
            </p>
          )}
        </Link>
        <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px] text-text-faint">
          <span>Disimpan {new Date(publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
          <span aria-hidden>·</span>
          <span>Vol {stock.volume}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <div className="hidden text-right sm:block">
          <p className={cn("font-mono text-[12.5px] font-semibold leading-none num-tabular", isPos ? "text-bullish" : "text-bearish")}>
            {isPos ? "▲ +" : "▼ "}
            {Math.abs(change).toFixed(2)}%
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-text-faint">
            {stock.price.toLocaleString("id-ID")}
          </p>
        </div>
        <SavedButton id={id} kind="stock" publishedAt={publishedAt} tone="dark" />
        <ShareButton
          url={`https://rangkuman.news${href}`}
          title={`${id} — ${stock.nama} · Rangkuman`}
          tone="dark"
        />
      </div>
    </article>
  );
}

function SavedStoryItem({ id, publishedAt }: { id: string; publishedAt: string }) {
  // Look up the story across all categories of the published date.
  const allStories: NewsStory[] = getNewsStoriesByDate(publishedAt);
  const story = allStories.find((s) => s.id === id);
  if (!story) {
    // Story no longer available (date changed). Show minimal info.
    return (
      <article className="group flex items-center gap-3 rounded-lg border border-border bg-bg-secondary p-3 sm:p-4">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-text-primary">Cerita tersimpan</p>
          <p className="mt-0.5 font-mono text-[10.5px] text-text-muted">
            Disimpan {new Date(publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <SavedButton id={id} kind="story" publishedAt={publishedAt} tone="dark" />
      </article>
    );
  }

  const cfg = categoryConfig[story.category];
  return (
    <article className="group flex items-start gap-3 rounded-lg border border-border bg-bg-secondary p-3 transition-colors hover:border-border-strong sm:gap-4 sm:p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-bg-tertiary text-text-faint sm:h-12 sm:w-12">
        <span className={cn("h-2 w-2 rounded-full", cfg.dot)} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "rounded border px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-widest",
              cfg.text, cfg.bg, cfg.border, "border",
            )}
          >
            {cfg.label}
          </span>
          <span className="font-mono text-[10px] text-text-faint">
            {publishedAt}
          </span>
        </div>
        <h3 className="text-[13.5px] font-bold leading-snug text-text-primary group-hover:text-brand">
          {story.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[12px] leading-[1.5] text-text-secondary">
          {story.summary}
        </p>
        <p className="mt-1.5 font-mono text-[10px] text-text-muted">
          {story.sources.length} sumber · {story.sources.map((s) => s.name).join(" · ")}
        </p>
      </div>
      <div className="flex shrink-0 items-start gap-1">
        <SavedButton id={id} kind="story" publishedAt={publishedAt} tone="dark" />
        <ShareButton
          url={`https://rangkuman.news/?date=${publishedAt}#${id}`}
          title={story.title}
          tone="dark"
        />
      </div>
    </article>
  );
}

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}

function FilterPill({ active, onClick, label, count }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded px-2.5 py-1 text-[12px] font-medium transition-colors",
        active
          ? "bg-bg-tertiary text-text-primary"
          : "text-text-muted hover:text-text-primary",
      )}
    >
      <span>{label}</span>
      <span className="font-mono text-[10px] text-text-faint">{count}</span>
    </button>
  );
}

const categoryConfig: Record<
  NewsStory["category"],
  { label: string; text: string; bg: string; border: string; dot: string }
> = {
  ekonomi: {
    label: "Ekonomi",
    text: "text-cat-ekonomi",
    bg: "bg-cat-ekonomi-soft",
    border: "border-cat-ekonomi-line",
    dot: "bg-cat-ekonomi",
  },
  pemerintah: {
    label: "Pemerintah",
    text: "text-cat-pemerintah",
    bg: "bg-cat-pemerintah-soft",
    border: "border-cat-pemerintah-line",
    dot: "bg-cat-pemerintah",
  },
  politik: {
    label: "Politik",
    text: "text-cat-politik",
    bg: "bg-cat-politik-soft",
    border: "border-cat-politik-line",
    dot: "bg-cat-politik",
  },
  emiten: {
    label: "Emiten",
    text: "text-cat-emiten",
    bg: "bg-cat-emiten-soft",
    border: "border-cat-emiten-line",
    dot: "bg-cat-emiten",
  },
  global: {
    label: "Global",
    text: "text-cat-global",
    bg: "bg-cat-global-soft",
    border: "border-cat-global-line",
    dot: "bg-cat-global",
  },
};