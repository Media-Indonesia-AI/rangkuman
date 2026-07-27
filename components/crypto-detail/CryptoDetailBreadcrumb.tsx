import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CryptoDetailBreadcrumbProps {
  /** Story rank label, shown as the last crumb. */
  rank: number;
}

/**
 * Top-of-page breadcrumb trail: Beranda → Sorotan → #{rank}.
 * Renders as a small mono-caps nav with chevron separators. Last
 * crumb is plain text (current page); previous two are `<Link>`.
 */
export function CryptoDetailBreadcrumb({ rank }: CryptoDetailBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-3 flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-widest text-text-muted"
    >
      <Link href="/" className="hover:text-text-secondary">
        Beranda
      </Link>
      <ChevronRight className="h-2.5 w-2.5" aria-hidden />
      <Link href="/" className="hover:text-text-secondary">
        Sorotan
      </Link>
      <ChevronRight className="h-2.5 w-2.5" aria-hidden />
      <span className="text-text-secondary">#{rank}</span>
    </nav>
  );
}