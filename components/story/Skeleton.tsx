import { Shimmer } from "@/components/Shimmer";

/** Loading placeholder — one featured block + three compact rows,
 *  matching the real layout so the page height stays stable while
 *  the fetch is in flight. */
export function ListingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-bg-secondary p-4">
        <div className="flex items-center gap-2">
          <Shimmer className="h-4 w-12" />
          <Shimmer className="h-4 w-20" />
        </div>
        <Shimmer className="mt-2.5 h-5 w-2/3" />
        <div className="mt-2 space-y-1.5">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-4/5" />
        </div>
      </div>
      <ul className="rounded-b-lg border-x border-b border-border-strong bg-bg-secondary/20 px-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="flex items-start gap-3 border-b border-border/60 py-3.5 last:border-b-0"
          >
            <div className="flex w-[52px] shrink-0 flex-col gap-1">
              <Shimmer className="h-4 w-11" />
              <Shimmer className="h-3 w-10" />
            </div>
            <div className="flex-1 space-y-1.5">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-3.5 w-1/2" />
              <Shimmer className="h-3 w-full" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
