"use client";

import {
  Suspense,
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { loadHeadlineById, loadHeadlines } from "@/lib/api/cache";
import type { HeadlineDetail, StoryFilter } from "@/lib/api";

/**
 * Single owner of the headline-detail fetch for the stock detail page.
 *
 * The page (`app/stock/[kode]/page.tsx`) is a static-export server
 * component (`output: 'export'` + `generateStaticParams`/
 * `generateMetadata`), so it can't read `?id=` or run a browser fetch
 * itself. Instead it mounts this provider once; the provider:
 *
 *   1. Reads the `?id=` deep-link param.
 *   2. If present, calls `loadHeadlineById(id)` once (deduped/cached
 *      in `lib/api/cache`).
 *   3. If absent, falls back to the most recent headline for `kode`:
 *      calls `loadHeadlines(1, 0, [{primary_ticker_code, eq, kode}])`,
 *      takes the first story's id, then calls `loadHeadlineById(id)`
 *      on it. The list endpoint is the same one `ArsipSingkat` uses
 *      (different `limit`, so a separate cache slot), so a warm cache
 *      still skips the network round-trip.
 *
 * The result is exposed via context so any consumer in the subtree
 * (the hero sentiment badge today, a headline detail section later)
 * reads from one fetch.
 *
 * A client `Context.Provider` may wrap server-rendered `children`; the
 * server content is passed through untouched and client consumers
 * nested inside it still receive the context.
 */

interface HeadlineDetailContextValue {
  /** The fetched headline, or `null` when there's no `?id=`, the fetch
   *  is still in flight, or it failed. */
  detail: HeadlineDetail | null;
  /** True while a fetch is in flight. */
  loading: boolean;
}

const HeadlineDetailContext = createContext<HeadlineDetailContextValue>({
  detail: null,
  loading: false,
});

/** Read the shared headline detail. Returns `{ detail: null, loading:
 *  false }` outside a provider, so consumers degrade to their fallback. */
export function useHeadlineDetail(): HeadlineDetailContextValue {
  return useContext(HeadlineDetailContext);
}

interface HeadlineDetailProviderProps {
  /** Stock ticker. Used to derive a fallback headline id from the
   *  latest headlines list when the URL doesn't carry `?id=`. */
  kode: string;
  children: ReactNode;
}

function HeadlineDetailFetcher({ kode, children }: HeadlineDetailProviderProps) {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [detail, setDetail] = useState<HeadlineDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset whenever the id changes (or clears) so a stale headline
    // never lingers on a different deep link.
    setDetail(null);
    if (!id) {
      // No deep link — derive an id from the latest headlines for
      // this ticker so consumers like the hero sentiment badge still
      // have a context. The list endpoint is the same one
      // `<ArsipSingkat>` uses (different `limit`, so a separate cache
      // slot); a warm cache still skips the network round-trip.
      const fallbackFilters: StoryFilter[] = [
        { field: "primary_ticker_code", operator: "eq", value: kode },
      ];
      let cancelled = false;
      void loadHeadlines(1, 0, fallbackFilters)
        .then((res) => {
          if (cancelled) return;
          const fallbackId = res.data[0]?.id;
          if (!fallbackId) {
            // No headlines for this ticker — leave detail null and
            // flip loading off so consumers fall back.
            setLoading(false);
            return;
          }
          return loadHeadlineById(fallbackId)
            .then((d) => {
              if (!cancelled) setDetail(d);
            })
            .catch(() => {
              // Keep detail null on error — consumers fall back.
            })
            .finally(() => {
              if (!cancelled) setLoading(false);
            });
        })
        .catch(() => {
          // List fetch failed — leave detail null.
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }
    let cancelled = false;

    void loadHeadlineById(id)
      .then((res) => {
        if (!cancelled) setDetail(res);
      })
      .catch(() => {
        // Keep `detail` null on error — consumers fall back.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, kode]);

  return (
    <HeadlineDetailContext.Provider value={{ detail, loading }}>
      {children}
    </HeadlineDetailContext.Provider>
  );
}

export function HeadlineDetailProvider({
  kode,
  children,
}: HeadlineDetailProviderProps) {
  // useSearchParams() opts out of static prerendering, so the Suspense
  // boundary lets Next ship the static shell (rendering `children` with
  // the default null-context) and hydrate the resolved value after.
  return (
    <Suspense
      fallback={
        <HeadlineDetailContext.Provider value={{ detail: null, loading: false }}>
          {children}
        </HeadlineDetailContext.Provider>
      }
    >
      <HeadlineDetailFetcher kode={kode}>{children}</HeadlineDetailFetcher>
    </Suspense>
  );
}
