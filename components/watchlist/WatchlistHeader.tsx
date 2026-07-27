"use client";

import Link from "next/link";
import { ArrowLeft, LogOut, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { WATCHLIST_LIMIT } from "@/lib/auth";

interface WatchlistHeaderProps {
  userName: string;
  codesCount: number;
  isFull: boolean;
  onAddClick: () => void;
  onLogoutClick: () => void;
}

/**
 * Page-level header for /watchlist: back link, label, title, greeting,
 * and the two action buttons (Keluar + Tambah).
 */
export function WatchlistHeader({
  userName,
  codesCount,
  isFull,
  onAddClick,
  onLogoutClick,
}: WatchlistHeaderProps) {
  return (
    <>
      <Link
        href="/"
        className="mb-3 inline-flex items-center gap-1.5 text-[12px] text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden />
        Kembali ke Beranda
      </Link>

      <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border-strong pb-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="label text-text-secondary">Watchlist kamu</span>
            <span className="font-mono text-[10.5px] text-text-muted">
              · {codesCount} / {WATCHLIST_LIMIT} saham
            </span>
          </div>
          <h1 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[30px]">
            Saham yang kamu pantau
          </h1>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-[1.55] text-text-secondary">
            Hai <span className="font-mono font-semibold text-text-primary">{userName}</span> 👋 — ini saham yang kamu simpan. Disimpan lokal di browser, gak perlu login server.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLogoutClick}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-3 text-[12.5px] font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Keluar
          </button>
          <button
            type="button"
            onClick={onAddClick}
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
    </>
  );
}