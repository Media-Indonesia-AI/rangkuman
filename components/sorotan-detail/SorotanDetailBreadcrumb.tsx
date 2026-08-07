import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

interface SorotanDetailBreadcrumbProps {
  /** Story rank label, shown as the last crumb. */
  rank: number;
  /** Back-link label — derived by the route entry from the inbound
   *  `Referer` header so the copy follows where the visitor came
   *  from (e.g. "Kembali ke Crypto" when the previous page was
   *  `/crypto`, "Kembali ke Beranda" for `/`). */
  backLabel: string;
  /** Back-link href — paired with `backLabel`. */
  backHref: string;
}

/**
 * Top-of-page breadcrumb trail: <back link> → Sorotan → #{rank}.
 *
 * The first crumb's label + href are passed in by the page wrapper
 * (derived from the inbound `Referer` header) so the breadcrumb
 * reflects where the visitor came from instead of being a static
 * "Kembali ke Crypto" regardless of the entry point. The middle
 * "Sorotan" crumb is a `<Link>` to `/sorotan` (the listing page),
 * and the last `#rank` crumb is plain text — the current page.
 */
export function SorotanDetailBreadcrumb({
  rank,
  backLabel,
  backHref,
}: SorotanDetailBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-3 flex flex-wrap items-center gap-1 font-mono text-[10.5px] tracking-widest text-text-muted"
    >
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 hover:text-text-secondary"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden />
        {backLabel}
      </Link>
    </nav>
  );
}
