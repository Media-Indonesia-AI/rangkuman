import { KeyDataBlock } from "@/components/KeyDataBlock";
import { KeywordItem } from "@/lib/api/types/story";

interface SorotanDetailKeyDataProps {
  keywords: KeywordItem[];
}

/**
 * Wrapper around `<KeyDataBlock />` that hides itself when the
 * caller passes an empty array (KeyDataBlock itself doesn't render
 * a guard — this keeps the JSX at the call site clean).
 */
export function SorotanDetailKeyData({ keywords }: SorotanDetailKeyDataProps) {
  if (keywords.length === 0) return null;
  return (
    <div className="mt-4">
      <KeyDataBlock keywords={keywords} />
    </div>
  );
}