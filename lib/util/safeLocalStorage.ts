/**
 * Safe wrappers around `window.localStorage` that swallow the
 * security / availability errors browsers can throw (private
 * mode, blocked by policy, quota exceeded, etc.).
 *
 * Both helpers return `null` / `void` on failure rather than
 * throwing — callers can treat a missing write as a noop and a
 * missing read as "key not present" without a try/catch at each
 * call site. This kills the duplicated try/catch boilerplate
 * that used to live at every read/write in the consuming
 * components.
 *
 * Centralised here so the failure mode is documented once and
 * any future concern (quota telemetry, encryption, namespacing)
 * has a single place to land.
 */

export function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    // localStorage may be disabled (private mode, blocked by
    // browser policy, etc.) — treat as "key not present".
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* noop — storage may be full or disabled */
  }
}

export function safeRemoveItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* noop — storage may be disabled */
  }
}