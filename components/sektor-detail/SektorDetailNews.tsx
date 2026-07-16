"use client";

import { Newspaper } from "lucide-react";
import type { SektorDisplay } from "@/lib/util/sectorMappers";

interface SektorDetailNewsProps {
  /** The sector whose news section we're rendering. Used for
   *  the H2 copy ("Recap terbaru dari emiten {name}") and
   *  nothing else — the section is currently a placeholder
   *  (see the component docstring). */
  sektor: SektorDisplay;
}

/**
 * "Berita sektor" section on the sector detail page.
 *
 * Renders the section header (Newspaper icon + label + H2 +
 * "agregat dari 6+ media" meta) and a dashed-border empty-state
 * shell saying the recap-per-emiten endpoint isn't wired up
 * yet.
 *
 * Why a placeholder: the live `/stocks/sectors` endpoint
 * doesn't include recap/news data per stock. Mixing mock
 * recaps here would silently introduce stale data into an
 * otherwise-live page, so we leave the section visible (so
 * the layout stays stable) but explicitly empty (so the gap
 * is honest). Replace the empty-state with a real list once
 * a per-stock recap endpoint is integrated.
 */
export function SektorDetailNews({ sektor }: SektorDetailNewsProps) {
  return (
    <section aria-label="Berita sektor">
      <header className="mb-3 flex items-end justify-between border-b border-border-strong pb-2">
        <div>
          <div className="mb-0.5 flex items-center gap-1.5">
            <Newspaper className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="label text-text-secondary">Berita sektor</span>
          </div>
          <h2 className="text-[15px] font-bold tracking-tight text-text-primary">
            Recap terbaru dari emiten {sektor.name}
          </h2>
        </div>
        <span className="font-mono text-[10.5px] text-text-muted">
          agregat dari 6+ media
        </span>
      </header>

      <div className="rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-10 text-center">
        <p className="text-[13px] text-text-muted">
          Recap berita per-emiten belum tersedia untuk sektor ini.
        </p>
        <p className="mt-1 font-mono text-[10.5px] text-text-faint">
          Endpoint recap per saham belum di-integrasikan di sini.
        </p>
      </div>
    </section>
  );
}