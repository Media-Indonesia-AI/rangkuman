/**
 * Next.js instrumentation hook — runs once when the Node
 * server boots.
 *
 * Used here for two related sitemap jobs:
 *
 *   1. **Generate on boot.** Before any HTTP request is served,
 *      spawn `scripts/build-sitemaps.mjs` once. This produces
 *      `public/sitemap.xml`, `public/page-sitemap.xml`, and
 *      `public/news-sitemap.xml` from whatever the backend has
 *      right now. The very first request after deploy is
 *      already fresh — no warm-up window where Google sees
 *      missing/empty files.
 *
 *      Generating at container start (not at image build) keeps
 *      the Docker image backend-agnostic: the build doesn't
 *      need `API_BACKEND_URL` / `API_INTERNAL_TOKEN`, so the
 *      image is reusable and no secrets leak into the build
 *      context.
 *
 *   2. **Refresh on a cron.** After the boot-time generation
 *      finishes, schedule a `croner` job every 15 minutes so
 *      the files stay fresh while the container is up — without
 *      spinning up a second worker or a second runtime.
 *
 *      If the container restarts, the whole cycle re-runs on
 *      the next boot (Next.js calls `register()` every time).
 *
 * Edge runtime: `process.env.NEXT_RUNTIME` is `'nodejs'` on
 * the server and `'edge'` on middleware/edge functions. We
 * only register on Node — cron and `child_process` don't make
 * sense on Edge.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { spawn } = await import("node:child_process");
  const { Cron } = await import("croner");

  const scriptPath = new URL("./scripts/build-sitemaps.mjs", import.meta.url)
    .pathname;

  /** Spawn the build script and wait for it to exit. Errors
   *  are swallowed: if the backend is briefly unreachable at
   *  boot, the server still starts and the next cron tick (or
   *  the next deploy) gets another shot. We don't want one
   *  transient network blip to prevent the HTTP server from
   *  coming up at all. */
  function runBuildScript(): Promise<void> {
    return new Promise((resolve) => {
      const child = spawn(process.execPath, [scriptPath], {
        stdio: "inherit",
        env: process.env,
      });
      child.on("exit", () => resolve());
      child.on("error", () => resolve()); // spawn ENOENT etc. — non-fatal
    });
  }

  // (1) Boot-time generation — await so the first HTTP request
  // is served against freshly-written files.
  await runBuildScript();

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
    runBuildScript,
  );
}
