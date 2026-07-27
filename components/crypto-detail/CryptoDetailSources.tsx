interface CryptoDetailSourcesProps {
  /** Source names. */
  sources: string[];
  /** Pre-computed total (matches `sources.length` today, kept
   *  explicit so future expansion can use a separate count). */
  count: number;
}

/**
 * "Daftar sumber" — vertical list of every media covering this story.
 * Each row is a plain mono line with a small `media` tag on the right.
 * Renders only when there's at least one source.
 */
export function CryptoDetailSources({
  sources,
  count,
}: CryptoDetailSourcesProps) {
  if (sources.length === 0) return null;

  return (
    <section aria-label="Daftar sumber" className="mt-8">
      <div className="mb-2 flex items-end justify-between border-b border-border-strong pb-2">
        <div>
          <h2 className="label text-text-secondary">Sumber</h2>
          <h3 className="text-[15px] font-bold tracking-tight text-text-primary sm:text-[16px]">
            {count} media meliput cerita ini
          </h3>
        </div>
      </div>
      <ul className="space-y-1">
        {sources.map((src) => (
          <li
            key={src}
            className="flex items-center justify-between border-b border-border/50 py-1.5"
          >
            <span className="text-[12.5px] text-text-primary">{src}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
              media
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}