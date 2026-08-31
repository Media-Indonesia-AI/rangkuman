import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Bottom-of-section disclaimer pointing at `/trending` for the
 * full coin catalog. Sits centered under the section as a single
 * line so it doesn't compete with the two main blocks above.
 */
export function BrowseAllDisclaimer() {
  return (
    <p className="text-center font-mono text-[10px] text-text-muted">
      Mau lihat semua koin? Buka{" "}
      <Link
        href="/trending"
        className="text-text-secondary hover:text-brand"
      >
        /trending
      </Link>{" "}
      atau tambahkan ke watchlist dari halaman koin individual.
      <ArrowUpRight
        className="ml-0.5 inline h-2.5 w-2.5 align-baseline"
        aria-hidden
      />
    </p>
  );
}
