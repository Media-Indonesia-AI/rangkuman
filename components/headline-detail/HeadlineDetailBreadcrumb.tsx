"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface HeadlineDetailBreadcrumbProps {
  /** Back-link label — derived by the route entry from the inbound
   *  `Referer` header so the copy follows where the visitor came
   *  from (e.g. "Kembali ke Crypto" when the previous page was
   *  `/crypto`, "Kembali ke Beranda" for `/`). The actual
   *  navigation is `router.back()` so the visitor lands on the
   *  *real* previous page in their browser history, not a
   *  hardcoded URL. */
  backLabel: string;
}

/**
 * Top-of-page back affordance: a single `<button>` that calls
 * `router.back()` so the visitor goes back to whatever they were
 * actually viewing before — `/crypto`, `/`, an in-app deep link
 * chain, etc. The label passed in by the page wrapper mirrors
 * the most common entry points but the click action is
 * history-driven, not href-driven.
 */
export function HeadlineDetailBreadcrumb({
  backLabel,
}: HeadlineDetailBreadcrumbProps) {
  const router = useRouter();

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-3 flex flex-wrap items-center gap-1 font-mono text-[10.5px] tracking-widest text-text-muted"
    >
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 hover:text-text-secondary"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden />
        {backLabel}
      </button>
    </nav>
  );
}