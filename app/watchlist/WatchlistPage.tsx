"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  X,
  Eye,
  EyeOff,
  Search,
  LogOut,
  ArrowLeft,
  FileText,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SentimentBadge } from "@/components/SentimentBadge";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useWatchlist, useIsInWatchlist } from "@/lib/hooks/useWatchlist";
import { logout, WATCHLIST_LIMIT } from "@/lib/auth";
import { stocks, getStockByKode } from "@/lib/mock/stocks";
import { getRecapsByDate, TODAY_ISO, getRecapForStock } from "@/lib/mock/recaps";
import { cn } from "@/lib/utils";

export default function WatchlistPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const { codes, isFull } = useWatchlist();
  const [showAdd, setShowAdd] = useState(false);

  // If not logged in, push to /login.
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  // Hydration state — show a neutral loader while we figure out auth.
  if (user === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-text-muted">
        Memuat…
      </div>
    );
  }
  if (user === null) return null;

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Kembali ke Beranda
        </Link>

        {/* Header */}
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border-strong pb-3">
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
              <span className="label text-text-secondary">Watchlist kamu</span>
              <span className="font-mono text-[10.5px] text-text-muted">
                · {codes.length} / {WATCHLIST_LIMIT} saham
              </span>
            </div>
            <h1 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[30px]">
              Saham yang kamu pantau
            </h1>
            <p className="mt-1 max-w-2xl text-[12.5px] leading-[1.55] text-text-secondary">
              Hai <span className="font-mono font-semibold text-text-primary">{user.name}</span> 👋 — ini saham yang kamu simpan. Disimpan lokal di browser, gak perlu login server.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-3 text-[12.5px] font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Keluar
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              disabled={isFull}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[12.5px] font-semibold transition-colors",
                isFull
                  ? "cursor-not-allowed bg-bg-tertiary text-text-faint"
                  : "bg-brand text-bg-primary hover:bg-brand-hover",
              )}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Tambah saham
            </button>
          </div>
        </header>

        {/* Empty state */}
        {codes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-14 text-center">
            <Eye className="h-7 w-7 text-text-faint" aria-hidden />
            <p className="text-[14px] font-semibold text-text-primary">
              Watchlist kamu masih kosong
            </p>
            <p className="max-w-sm text-[12.5px] leading-relaxed text-text-muted">
              Tambahin saham yang mau kamu pantau. Kamu bakal dapet recap
              personalized di beranda & update sentiment real-time.
            </p>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Tambah saham pertama
            </button>
          </div>
        ) : (
          <>
            <p className="mb-3 font-mono text-[10.5px] text-text-muted">
              {isFull
                ? `⚠ Watchlist penuh (${WATCHLIST_LIMIT}). Hapus dulu sebelum nambah yang baru.`
                : `Sisa slot: ${WATCHLIST_LIMIT - codes.length}`}
            </p>

            {/* Stock grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {codes.map((kode) => (
                <WatchlistStockCard key={kode} kode={kode} />
              ))}
            </div>
          </>
        )}

        {/* Info */}
        <aside className="mt-6 rounded-lg border border-border bg-bg-secondary/50 p-3.5">
          <p className="label mb-1.5">Tentang watchlist</p>
          <ul className="space-y-1 text-[11.5px] leading-relaxed text-text-muted">
            <li>· Disimpan di localStorage browser kamu. Gak ada backend, data gak ke-upload.</li>
            <li>· Maksimal {WATCHLIST_LIMIT} saham (free tier). Hapus dulu kalo mau ganti.</li>
            <li>· Sentiment badge & jumlah berita dari agregat media hari ini.</li>
          </ul>
        </aside>
      </main>

      {showAdd && (
        <AddStockDialog onClose={() => setShowAdd(false)} isFull={isFull} existing={codes} />
      )}
      <Footer />
    </>
  );
}

function WatchlistStockCard({ kode }: { kode: string }) {
  const { remove } = useWatchlist();
  const stock = getStockByKode(kode);
  if (!stock) {
    return (
      <article className="rounded-lg border border-border bg-bg-secondary p-3.5">
        <p className="font-mono text-[12px] text-bearish">
          ⚠ {kode} gak ditemukan di database.
        </p>
        <button
          type="button"
          onClick={() => remove(kode)}
          className="mt-2 text-[11.5px] text-text-muted hover:text-bearish"
        >
          Hapus
        </button>
      </article>
    );
  }

  const recap = getRecapForStock(kode, TODAY_ISO);
  const positive = stock.changePercent >= 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong hover:shadow-card-hover">
      {/* Top: ticker + remove */}
      <header className="flex items-start justify-between border-b border-border bg-bg-tertiary px-3 py-2">
        <Link href={`/stock/${kode}`} className="min-w-0">
          <p className="font-mono text-[18px] font-bold leading-none tracking-tighter text-text-primary group-hover:text-brand">
            {kode}
          </p>
          <p className="mt-0.5 truncate text-[10.5px] text-text-muted">{stock.nama}</p>
        </Link>
        <button
          type="button"
          onClick={() => remove(kode)}
          aria-label={`Hapus ${kode} dari watchlist`}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-text-faint transition-colors hover:bg-bg-secondary hover:text-bearish"
        >
          <X className="h-3 w-3" aria-hidden />
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Price + change */}
        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-mono text-[18px] font-bold leading-none tracking-tight text-text-primary num-tabular">
              {stock.price.toLocaleString("id-ID")}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-text-faint">{stock.sektor}</p>
          </div>
          <p
            className={cn(
              "font-mono text-[12.5px] font-semibold num-tabular",
              positive ? "text-bullish" : "text-bearish",
            )}
          >
            {positive ? "▲ +" : "▼ "}
            {Math.abs(stock.changePercent).toFixed(2)}%
          </p>
        </div>

        {/* Sentiment + article count */}
        {recap ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <SentimentBadge sentiment={recap.sentimen} size="sm" showLabel={false} />
            <span className="inline-flex items-center gap-1 rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
              <FileText className="h-2.5 w-2.5" aria-hidden />
              {recap.jumlahBerita} artikel
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              {recap.sumber.length} media
            </span>
          </div>
        ) : (
          <p className="font-mono text-[10.5px] text-text-faint">
            Belum ada recap hari ini
          </p>
        )}
      </div>
    </article>
  );
}

function AddStockDialog({
  onClose,
  isFull,
  existing,
}: {
  onClose: () => void;
  isFull: boolean;
  existing: string[];
}) {
  const { add, remove, isIn } = useWatchlist();
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stocks.slice(0, 8);
    return stocks
      .filter(
        (s) =>
          s.kode.toLowerCase().includes(q) ||
          s.nama.toLowerCase().includes(q) ||
          s.sektor.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [query]);

  const handleToggle = (kode: string) => {
    if (isIn(kode)) {
      remove(kode);
      setToast(`✕ ${kode} dihapus dari watchlist`);
    } else {
      if (isFull) {
        setToast(`⚠ Watchlist penuh (max ${WATCHLIST_LIMIT})`);
        return;
      }
      const res = add(kode);
      setToast(res.ok ? `✓ ${kode} ditambahin ke watchlist` : `⚠ ${res.reason}`);
    }
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-label="Tambah saham ke watchlist"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-bg-secondary shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border bg-bg-tertiary px-3.5 py-2.5">
          <div className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5 text-brand" aria-hidden />
            <h2 className="text-[14px] font-bold tracking-tight text-text-primary">
              Tambah ke watchlist
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-text-faint hover:bg-bg-secondary hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </header>

        <div className="border-b border-border p-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint"
              aria-hidden
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari saham (kode atau nama)..."
              className="h-9 w-full rounded-md border border-border bg-bg-input pl-8 pr-3 text-[12.5px] text-text-primary placeholder:text-text-faint focus:border-brand focus:outline-none"
              autoFocus
            />
          </div>
          {toast && (
            <p className="mt-2 rounded border border-border bg-bg-tertiary px-2 py-1 font-mono text-[10.5px] text-text-primary">
              {toast}
            </p>
          )}
        </div>

        <ul className="max-h-[360px] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-[12px] text-text-muted">
              Gak ada hasil untuk &ldquo;{query}&rdquo;
            </li>
          ) : (
            results.map((s) => {
              const inList = isIn(s.kode);
              return (
                <li key={s.kode}>
                  <button
                    type="button"
                    onClick={() => handleToggle(s.kode)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded px-2 py-2 text-left transition-colors",
                      "hover:bg-bg-tertiary",
                      inList && "bg-bullish-soft/30",
                    )}
                  >
                    <span className="inline-flex h-8 w-12 shrink-0 items-center justify-center rounded border border-border bg-bg-card font-mono text-[10.5px] font-bold tracking-tight text-text-primary">
                      {s.kode}
                    </span>
                    <span className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold text-text-primary">
                        {s.nama}
                      </p>
                      <p className="truncate font-mono text-[10px] text-text-muted">
                        {s.sektor} · {s.price.toLocaleString("id-ID")}
                      </p>
                    </span>
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        inList
                          ? "bg-bullish text-bg-primary"
                          : "border border-border bg-bg-tertiary text-text-faint",
                      )}
                    >
                      {inList ? (
                        <Eye className="h-3 w-3" aria-hidden />
                      ) : (
                        <EyeOff className="h-3 w-3" aria-hidden />
                      )}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <footer className="flex items-center justify-between border-t border-border bg-bg-tertiary px-3.5 py-2.5">
          <span className="font-mono text-[10px] text-text-muted">
            {existing.length} / {WATCHLIST_LIMIT} watchlist
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 items-center rounded-md border border-border bg-bg-card px-3 text-[11.5px] font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            Selesai
          </button>
        </footer>
      </div>
    </div>
  );
}