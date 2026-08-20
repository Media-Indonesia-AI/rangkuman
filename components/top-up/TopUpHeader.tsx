import { Sparkles } from "lucide-react";

/**
 * Page header for `/profile/top-up`. Sparkles icon + the H1
 * title. Visual-only — no client state, so this stays a server
 * component.
 */
export function TopUpHeader() {
  return (
    <header className="border-b border-border-strong pb-3">
      <div className="mb-1 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-text-primary sm:text-[26px]">
          Top Up Koin
        </h1>
      </div>
    </header>
  );
}