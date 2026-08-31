import { cn } from "@/lib/utils";
import {
  BrowseAllDisclaimer,
  CategoryGrid,
  TopMovers,
} from "./crypto-pasar";

interface CryptoSectionProps {
  className?: string;
}

/**
 * Pasar tab's main body — Top Movers + Categories + a bottom
 * disclaimer. The widget itself is just an orchestrator; each
 * block lives in its own sub-component under `./crypto-pasar/`
 * so this file stays a thin shell.
 */
export function CryptoSection({ className }: CryptoSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <TopMovers />
      <CategoryGrid />
      <BrowseAllDisclaimer />
    </div>
  );
}
