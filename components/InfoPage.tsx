import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TopTicker } from "@/components/TopTicker";
import { cn } from "@/lib/utils";

interface InfoPageProps {
  /** Page title, e.g. "Tentang Rangkuman". */
  title: string;
  /** Short subhead / description under the title. */
  description: string;
  /** ISO date (yyyy-mm-dd) for "Terakhir diperbarui" line. */
  lastUpdated: string;
  /** Optional eyebrow/kicker shown above the title. */
  eyebrow?: string;
  /** Optional icon element next to the title. */
  icon?: ReactNode;
  /** Main content — sections, lists, paragraphs, etc. */
  children: ReactNode;
  /** Optional related links shown at the bottom. */
  related?: { label: string; href: string; description?: string }[];
}

const formatDateId = (iso: string): string =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function InfoPage({
  title,
  description,
  lastUpdated,
  eyebrow,
  icon,
  children,
  related,
}: InfoPageProps) {
  return (
    <>
      <Navbar />
      <TopTicker />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 font-mono text-[10.5px] text-text-muted">
          <Link href="/" className="hover:text-text-primary">
            Beranda
          </Link>
          <ChevronRight className="h-3 w-3 text-text-faint" aria-hidden />
          <span className="text-text-secondary">{title}</span>
        </nav>

        {/* Header */}
        <header className="mb-6 border-b border-border-strong pb-5">
          {eyebrow && (
            <div className="mb-1.5 flex items-center gap-1.5">
              {icon}
              <span className="label text-text-secondary">{eyebrow}</span>
            </div>
          )}
          <h1 className="text-[22px] font-bold tracking-tight text-text-primary sm:text-[28px]">
            {title}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-text-muted sm:text-[13.5px]">
            {description}
          </p>
          <p className="mt-3 font-mono text-[10.5px] text-text-faint">
            Terakhir diperbarui: {formatDateId(lastUpdated)}
          </p>
        </header>

        {/* Body */}
        <div
          className={cn(
            "prose-content space-y-5 text-[13.5px] leading-[1.7] text-text-secondary",
            "[&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-[15px] [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-text-primary [&_h2]:sm:text-[17px]",
            "[&_h3]:mt-5 [&_h3]:mb-1.5 [&_h3]:text-[13.5px] [&_h3]:font-semibold [&_h3]:text-text-primary",
            "[&_p]:text-text-secondary",
            "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5",
            "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5",
            "[&_li]:text-text-secondary",
            "[&_strong]:font-semibold [&_strong]:text-text-primary",
            "[&_a]:text-brand [&_a]:underline-offset-2 hover:[&_a]:underline",
          )}
        >
          {children}
        </div>

        {/* Related */}
        {related && related.length > 0 && (
          <aside className="mt-10 border-t border-border pt-5">
            <p className="label mb-2.5">Halaman Terkait</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="block rounded-md border border-border bg-bg-secondary p-3 transition-colors hover:border-border-strong hover:bg-bg-tertiary"
                  >
                    <span className="block text-[12.5px] font-semibold text-text-primary">
                      {r.label} →
                    </span>
                    {r.description && (
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-text-muted">
                        {r.description}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <p className="mt-8 font-mono text-[10.5px] text-text-faint">
          Rangkuman · © 2026 · Konten untuk tujuan edukasi, bukan rekomendasi investasi.
        </p>
      </main>
      <Footer />
    </>
  );
}
