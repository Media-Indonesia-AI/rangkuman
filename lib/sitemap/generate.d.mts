/**
 * Type declarations for `lib/sitemap/generate.mjs`. Plain ESM
 * has no inline type info; this sidecar gives `instrumentation.ts`
 * (and anything else that imports `generate.mjs`) a real
 * signature instead of falling back to `any`.
 */

export function regenerateSitemaps(
  opts?: { publicDir?: string },
): Promise<{ files: number; headlines: number }>;
