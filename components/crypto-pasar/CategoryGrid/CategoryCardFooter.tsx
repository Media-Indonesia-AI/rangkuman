import { ArrowRight } from "lucide-react";

/** Bottom CTA strip — pushed to the card's bottom edge by the
 *  parent's `flex flex-col` + `mt-auto` here. The arrow nudges
 *  on group-hover for affordance. */
export function CategoryCardFooter() {
  return (
    <div className="mt-auto flex items-center justify-end gap-1 border-t border-border bg-bg-tertiary/50 px-3.5 py-2 font-mono text-[10.5px] font-semibold text-text-muted transition-colors group-hover:text-brand">
      Lihat kategori
      <ArrowRight
        className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </div>
  );
}
