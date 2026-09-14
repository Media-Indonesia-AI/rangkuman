import { Sparkles } from "lucide-react";

interface AkunPageHeaderProps {
  /** Short eyebrow label rendered above the title — e.g. "Akun". */
  eyebrow: string;
  /** Bold page title — e.g. "Informasi akun". */
  title: string;
  /** One-line muted subheader describing what the tab does. */
  subheader: string;
}

/** Top strip for the Akun section — Sparkles + eyebrow + h1 +
 *  subheader. Same visual vocabulary used by the other profile
 *  tabs (`WhatsappPageHeader`, `TopUpHeader`); each tab keeps
 *  its own copy of the strip rather than sharing a primitive
 *  because the variations (eyebrow presence, right slot,
 *  subheader copy) are too small to factor into a generic
 *  header without inflating the prop surface. */
export function AkunPageHeader({ eyebrow, title, subheader }: AkunPageHeaderProps) {
  return (
    <header className="border-b border-border-strong pb-3">
      <div className="mb-1 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
        <span className="label text-text-secondary">{eyebrow}</span>
      </div>
      <h1 className="text-[22px] font-bold leading-tight tracking-tight text-text-primary sm:text-[26px]">
        {title}
      </h1>
      <p className="mt-1 text-[12.5px] leading-[1.55] text-text-muted">
        {subheader}
      </p>
    </header>
  );
}
