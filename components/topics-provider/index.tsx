/**
 * Public surface for the layout-level topics provider. Re-exports
 * `TopicsProvider` (mount inside `app/layout.tsx`) and
 * `useTopicsContext` (read inside any descendant page or widget).
 *
 * Keeping the index thin lets the barrel be the only file other
 * consumers need to know about; the actual context + provider
 * implementation lives in `TopicsProvider.tsx`.
 */
export {
  TopicsProvider,
  useTopicsContext,
} from "./TopicsProvider";
