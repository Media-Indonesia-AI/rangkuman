/**
 * Next.js instrumentation hook — runs once when the Node
 * server boots. See
 * https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 *
 * Used here to keep the sitemap files (`public/sitemap.xml`,
 * `public/page-sitemap.xml`, `public/news-sitemap.xml`)
 * fresh while the container is up:
 *
 *   1. **Generate on boot.** Before any HTTP request is served,
 *      `regenerateSitemaps()` runs once. The very first request
 *      after deploy is already fresh — no warm-up window where
 *      Google sees missing/empty files.
 *
 *   2. **Refresh on a cron.** A `croner` job fires every 15
 *      minutes so the files stay fresh while the container is
 *      up — no second worker, no second runtime.
 *
 * The cron lives in the same Node.js process as the main
 * Next.js server (this file), so there is no external
 * scheduler to babysit. If the container restarts, the whole
 * cycle re-runs on the next boot — Next.js calls `register()`
 * every time the Node server starts.
 *
 * Edge runtime: `process.env.NEXT_RUNTIME` is `'nodejs'` on
 * the server and `'edge'` on middleware/edge functions. We
 * only register on Node — croner and `fs.writeFileSync` don't
 * make sense on Edge.
 *
 * Requires `experimental.instrumentationHook: true` in
 * `next.config.js`. Next.js 14.x silently ignores this file
 * without that flag — that's the bug that made the original
 * `fiox` wiring dead in production.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Dynamic imports so this file can be bundled by Next.js's
  // webpack, which refuses Node built-ins and statically-traced
  // deps from an instrumentation context. Native Node resolves
  // both at runtime.
  const { regenerateSitemaps } = await import("./lib/sitemap/generate.mjs");
  const { Cron } = await import("croner");

  // (1) Boot-time generation — fire and let it run; failures
  // shouldn't block the HTTP server from coming up.
  regenerateSitemaps().then(
    (summary) =>
      console.log(
        `[sitemap] boot generation complete — ${summary.files} files, ${summary.headlines} headlines`,
      ),
    (err) => console.warn("[sitemap] boot generation failed:", err),
  );

  // (2) Periodic refresh — every 15 minutes, sub-hourly because
  // Google News indexing is most valuable in the first 1–2 hours
  // after a headline publishes; daily cadence would miss that
  // window for everything published outside the morning crawl.
  new Cron(
    "*/15 * * * *",
    {
      name: "sitemap-refresh",
      protect: true, // overlap-protection: skip a tick if the previous one is still running
    },
    async () => {
      try {
        const summary = await regenerateSitemaps();
        console.log(
          `[sitemap] cron refresh — ${summary.files} files, ${summary.headlines} headlines`,
        );
      } catch (err) {
        console.warn("[sitemap] cron refresh failed:", err);
      }
    },
  );
}
