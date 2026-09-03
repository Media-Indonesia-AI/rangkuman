import { KeyDataBlock } from "@/components/KeyDataBlock";
import { LoginPromptOverlay } from "@/components/LoginPromptOverlay";
import { KeywordItem } from "@/lib/api/types/story";

interface HeadlineDetailKeyDataProps {
  keywords: KeywordItem[];
}

/**
 * Wrapper around `<KeyDataBlock />` that hides itself when the
 * caller passes an empty array (KeyDataBlock itself doesn't render
 * a guard — this keeps the JSX at the call site clean).
 */
export function HeadlineDetailKeyData({ keywords }: HeadlineDetailKeyDataProps) {
  if (keywords.length === 0) return null;
  return (
    <section className="glass-card relative overflow-hidden rounded-xl border border-border-strong bg-bg-secondary mt-4">
      <KeyDataBlock keywords={keywords} />
      <LoginPromptOverlay title="Masuk dulu untuk baca Data Kunci" />
    </section>
  );
}