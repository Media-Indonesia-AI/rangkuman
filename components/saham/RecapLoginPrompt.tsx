"use client";

/**
 * Inline auth gate for `<RecapStockSection />`. Shown to anonymous
 * visitors in place of the recap tree (top strip + 3-column grid)
 * so they get a single, consistent "login to see this" surface
 * instead of two parallel 401 failures — one from the trending
 * endpoint, one from the stories endpoint.
 *
 * Read-only by design (no Masuk/Daftar CTAs): `<SektorLoginPrompt />`
 * carries the auth CTAs for the sektor branch, and the recap section
 * sits one route below `/login` so the visitor is unlikely to need
 * a duplicate CTA stack here. Add CTAs in lockstep with the sektor
 * prompt if that assumption ever changes.
 */
export function RecapLoginPrompt() {
  return (
    <section
      aria-label="Recap saham — login dulu"
      className="rounded-lg border border-border bg-bg-secondary px-4 py-10 text-center"
    >
      <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-text-muted">
        Recap saham
      </p>
      <p className="mt-2 text-[13px] font-semibold text-text-primary">
        Masuk dulu untuk lihat recap harian
      </p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-text-muted">
        Cerita emiten dan saham yang paling banyak diberitakan
        hanya tersedia untuk anggota.
      </p>
    </section>
  );
}
