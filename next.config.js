/** @type {import('next').NextConfig} */
// `output: "standalone"` builds a self-contained Node.js server bundle
// in `.next/standalone/` — the Dockerfile copies only that + the few
// static asset folders, so the runtime image doesn't need node_modules
// or the full source tree.
const nextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  reactStrictMode: true,
  trailingSlash: true,
  // Opt in to Next.js 14's instrumentation hook — without this
  // flag, `instrumentation.ts` is silently ignored (the config
  // is baked into `.next/standalone/server.js` as
  // `"instrumentationHook": false`, confirmed by reading the
  // built artifact). The sitemap-regeneration cron lives in
  // `instrumentation.ts`, so this flag is load-bearing.
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
