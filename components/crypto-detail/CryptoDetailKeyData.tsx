import type { KeyDataPoint } from "@/lib/mock/highlights";
import { KeyDataBlock } from "@/components/KeyDataBlock";

interface CryptoDetailKeyDataProps {
  points: KeyDataPoint[];
}

/**
 * Wrapper around `<KeyDataBlock />` that hides itself when the
 * caller passes an empty array (KeyDataBlock itself doesn't render
 * a guard — this keeps the JSX at the call site clean).
 */
export function CryptoDetailKeyData({ points }: CryptoDetailKeyDataProps) {
  if (points.length === 0) return null;
  return (
    <div className="mt-4">
      <KeyDataBlock points={points} />
    </div>
  );
}