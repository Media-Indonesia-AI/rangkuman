import Link from "next/link";
import { Brand } from "./Brand";
import { SloganStrip } from "./SloganStrip";

export function Footer() {
  return (
    <footer aria-label="Footer" className="mt-16 border-t border-border bg-bg-primary">
      {/* Tagline bar — visible on every page for memorability */}
      <SloganStrip />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-2 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Brand logoSize={36} full />
            <p className="mt-4 max-w-sm text-[12.5px] leading-relaxed text-text-secondary">
              Recap saham harian untuk investor ritel Indonesia. Dikurasi dari
              CNBC, Bisnis, Kontan, Bloomberg, Reuters, dan 20+ media lainnya.
            </p>
          </div>
          <div>
            <p className="label mb-2.5">Topik</p>
            <ul aria-label="Topik" className="space-y-1.5 text-[12.5px] text-text-secondary">
              <li><Link href="/saham" className="hover:text-brand">Saham</Link></li>
              <li><Link href="/crypto" className="hover:text-brand">Crypto</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-2.5">Perusahaan</p>
            <ul className="space-y-1.5 text-[12.5px] text-text-secondary">
              <li><Link href="/tentang" className="hover:text-brand">Tentang</Link></li>
              <li><Link href="/tim-redaksi" className="hover:text-brand">Tim Redaksi</Link></li>
              <li><Link href="/karir" className="hover:text-brand">Karir</Link></li>
              <li><Link href="/kontak" className="hover:text-brand">Kontak</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-2.5">Legal</p>
            <ul className="space-y-1.5 text-[12.5px] text-text-secondary">
              <li><Link href="/disclaimer" className="hover:text-brand">Disclaimer</Link></li>
              <li><Link href="/privasi" className="hover:text-brand">Privasi</Link></li>
              <li><Link href="/syarat-ketentuan" className="hover:text-brand">Syarat &amp; Ketentuan</Link></li>
              <li><Link href="/pedoman-media-siber" className="hover:text-brand">Pedoman Media Siber</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-5 text-[11px] text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Rangkuman.news · Jakarta · 🇮🇩</span>
          <span>Konten untuk tujuan edukasi, bukan rekomendasi investasi.</span>
        </div>
      </div>
    </footer>
  );
}
