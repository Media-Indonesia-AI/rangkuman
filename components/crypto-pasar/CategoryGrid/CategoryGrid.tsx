import { COIN_CATEGORIES } from "@/lib/mock/crypto";
import { CategoryCard } from "./CategoryCard";

/** Section header strip — "Kategori Koin" label + count meta. */
function CategoryGridHeader() {
  return (
    <header className="mb-3 flex items-end justify-between border-b border-border-strong pb-1.5">
      <div>
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          Kategori Koin
        </h2>
        <p className="mt-0.5 text-[11px] text-text-muted">
          {COIN_CATEGORIES.length} kategori pasar crypto
        </p>
      </div>
      <span className="font-mono text-[10px] text-text-faint">
        Sorted by market cap
      </span>
    </header>
  );
}

/**
 * Pasar tab's category grid — one `<CategoryCard />` per entry
 * in `COIN_CATEGORIES`. Pure mock-data driven today; when the
 * backend ships categories this swaps to an API hook the same
 * way `TopMovers` does.
 */
export function CategoryGrid() {
  return (
    <section aria-label="Kategori koin">
      <CategoryGridHeader />
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {COIN_CATEGORIES.map((cat) => (
          <CategoryCard key={cat.key} cat={cat} />
        ))}
      </div>
    </section>
  );
}
