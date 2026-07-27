import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CryptoDetailBackLinkProps {
  /** Slug of the story's primary category, used in the topic link. */
  categorySlug: string;
  /** Display label for the primary category. */
  categoryLabel: string;
}

/**
 * Full-width row at the bottom of the page — left: "Lihat sorotan
 * lain" link back to the homepage Sorotan list. Right: small note
 * about which topic this story is filed under.
 */
export function CryptoDetailBackLink({
  categorySlug,
  categoryLabel,
}: CryptoDetailBackLinkProps) {
  return (
    <div className="mt-8 flex flex-col items-center gap-2 border-t border-border pt-5 sm:flex-row sm:justify-between">
      <Link
        href="/"
        className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-text-muted transition-colors hover:text-text-secondary"
      >
        <ArrowLeft
          className="h-3 w-3 transition-transform group-hover:-translate-x-0.5"
          aria-hidden
        />
        Lihat sorotan lain
      </Link>
      <p className="text-[11px] text-text-muted">
        Cerita ini bagian dari{" "}
        <Link
          href={categorySlug}
          className="font-medium text-text-secondary hover:text-brand"
        >
          topikan {categoryLabel}
        </Link>
      </p>
    </div>
  );
}