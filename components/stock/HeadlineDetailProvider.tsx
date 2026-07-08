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
import { loadHeadlineById } from "@/lib/api/cache";
import type { HeadlineDetail } from "@/lib/api";

/**
 * Single owner of the deep-linked headline-detail fetch for the stock
 * detail page.
 *
 * The page (`app/stock/[kode]/page.tsx`) is a static-export server
 * component (`output: 'export'` + `generateStaticParams`/
 * `generateMetadata`), so it can't read `?id=` or run a browser fetch
 * itself. Instead it mounts this provider once; the provider reads the
 * `?id=` deep-link param, calls `loadHeadlineById(id)` a single time
 * (deduped/cached in `lib/api/cache`), and exposes the result via
 * context so any consumer in the subtree (the hero sentiment badge
 * today, a headline detail section later) reads from one fetch.
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

function HeadlineDetailFetcher({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [detail, setDetail] = useState<HeadlineDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset whenever the id changes (or clears) so a stale headline
    // never lingers on a different deep link.
    setDetail(null);
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
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
  }, [id]);

  return (
    <HeadlineDetailContext.Provider value={{ detail, loading }}>
      {children}
    </HeadlineDetailContext.Provider>
  );
}

export function HeadlineDetailProvider({ children }: { children: ReactNode }) {
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
      <HeadlineDetailFetcher>{children}</HeadlineDetailFetcher>
    </Suspense>
  );
}
