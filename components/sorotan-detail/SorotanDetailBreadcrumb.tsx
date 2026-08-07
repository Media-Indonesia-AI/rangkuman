import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SorotanDetailBreadcrumbProps {
  /** Story rank label, shown as the last crumb. */
  rank: number;
}

/**
 * Top-of-page breadcrumb trail: Beranda → Sorotan → #{rank}.
 * Renders as a small mono-caps nav with chevron separators. Last
 * crumb is plain text (current page); previous two are `<Link>`.
 */
export function SorotanDetailBreadcrumb({ rank }: SorotanDetailBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-3 flex items-center gap-1 font-mono text-[10.5px] tracking-widest text-text-muted"
    >
      <Link
        href="/crypto"
        className="inline-flex items-center gap-1.5 hover:text-text-secondary"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden />
        Kembali ke Crypto
      </Link>
    </nav>
  );
}