import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

interface InfoPageProps {
  /** Page title, e.g. "Tentang Rangkuman". */
  title: string;
  /** Optional eyebrow/kicker shown above the title. */
  eyebrow?: string;
  /** Optional icon element next to the title. */
  icon?: ReactNode;
  /** Main content — sections, lists, paragraphs, etc. */
  children: ReactNode;
}

/**
 * Shared chrome for static legal/about pages (`/kontak-kerjasama/`,
 * `/syarat-ketentuan/`, etc.). Provides the breadcrumb, header block
 * (eyebrow + title), prose-style body, and the standard
 * Navbar/Footer pair. Callers supply the title, optional eyebrow
 * + icon, and the body as children — no per-page layout work.
 *
 * The prose class chain below mirrors the project's earlier
 * `prose-content` typography (h2/h3 sizing, list styling, link
 * treatment) so MDX-style content slotted in via `children` reads
 * consistently across pages.
 */
export function InfoPage({
  title,
  eyebrow,
  icon,
  children,
}: InfoPageProps) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
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
        </header>

        {/* Body */}
        <div
          className={cn(
            "prose-content space-y-5 text-[13.5px] leading-[1.7] text-text-secondary",
            "[&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-[15px] [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-text-primary [&_h2]:sm:text-[17px]",
            "[&_h3]:mt-5 [&_h3]:mb-1.5 [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:text-text-primary",
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
      </main>
      <Footer />
    </>
  );
}
