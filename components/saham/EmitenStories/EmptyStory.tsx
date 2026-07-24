/** Empty-state message when the ticker has no stories. */
export function EmptyStory({ ticker }: { ticker: string }) {
  return (
    <p className="py-6 text-center font-mono text-[11px] text-text-faint">
      Belum ada story untuk {ticker.toUpperCase()}.
    </p>
  );
}
