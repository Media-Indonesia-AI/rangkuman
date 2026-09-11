"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CryptoSubNav } from "@/components/CryptoSubNav";
import { useCryptoTabSession } from "@/lib/hooks/useCryptoTabSession";
import { CryptoRecapTab } from "./CryptoRecapTab";
import { CryptoPasarTab } from "./CryptoPasarTab";

/**
 * `/crypto` page — orchestrator only. Composes:
 *   - `<Navbar />` / `<Footer />` — chrome,
 *   - `<CryptoSubNav />` — the Recap | Pasar tab switcher (state
 *     owned here, persisted via `useCryptoTabSession`),
 *   - `<CryptoRecapTab />` — editorial pillar (live topic feed +
 *     lead / sedang-terjadi / cerita-lain layers),
 *   - `<CryptoPasarTab />` — market pillar (Categories).
 *
 * Each tab widget owns its own data fetching and rendering —
 * `CryptoPage` is purely a chrome-and-switching shell.
 *
 * `CryptoPage` is a client component because it owns the
 * sub-tab state. The state lives in localStorage so a refresh
 * or back-navigation lands the visitor on whichever pillar
 * they were viewing last — see `useCryptoTabSession`.
 */
export default function CryptoPage() {
  const [subTab, setSubTab] = useCryptoTabSession();

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-3 sm:px-6 sm:pt-4 md:max-w-4xl lg:max-w-7xl lg:px-8">
        {/* Sr-only H1 for SEO */}
        <h1 className="sr-only">
          Rangkuman &mdash; Crypto: Berita Crypto Hari Ini
        </h1>

        {/* Sub-nav (Recap | Pasar) — replaces section header. Hidden
         *  during the pre-hydration render (`subTab === null`) so
         *  the page renders a chrome shell without flashing the
         *  default "top" tab when the persisted choice is "pasar". */}
        <div className="flex items-center justify-start pt-1">
          {subTab !== null && (
            <CryptoSubNav active={subTab} onChange={setSubTab} />
          )}
        </div>

        {subTab === "top" && <CryptoRecapTab />}
        {subTab === "pasar" && <CryptoPasarTab />}
      </main>
      <Footer />
    </>
  );
}
