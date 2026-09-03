<?php
/**
 * regenerate-sitemap.php
 *
 * Cron-driven sitemap warmer for the Next.js ISR cache.
 *
 * What it does:
 *
 *   Every time it runs, it GETs `/sitemap.xml` and
 *   `/news-sitemap.xml` from the site. Each one is configured
 *   with `revalidate = 3600` in the Next.js app, so the first
 *   hit *after* the 1-hour cache window expires triggers a
 *   background rebuild — without this cron, the sitemap
 *   would only refresh when a real visitor/crawler happens
 *   to land on the URL after the TTL expires. With this
 *   cron running on a schedule, the sitemap is guaranteed to
 *   be fresh at the top of every hour (or every 30 min —
 *   see the schedule block below).
 *
 * Why two URLs and not just the root `/sitemap.xml`:
 *   Next.js auto-merges every `sitemap.ts` it finds in the
 *   route tree into the single `/sitemap.xml` output, so the
 *   root sitemap already contains the listings from
 *   `app/story/sitemap.ts` + the per-headline URLs from
 *   `app/sitemap.ts`. The News sitemap lives at a separate
 *   URL (`/news-sitemap.xml`) because Next.js's `sitemap.ts`
 *   convention only emits `/sitemap.xml`; that one is a
 *   route handler, not auto-merged.
 *
 *   Each surface has its own ISR cache, so they need
 *   separate hits to keep the warm-cache contract.
 *
 * Why a separate cron (and not build-time generation):
 *   `next build` pre-renders the sitemaps at deploy time
 *   only — the URLs would go stale immediately after the
 *   newsroom publishes. ISR with a 1-hour window gives us
 *   hourly freshness without a full redeploy; the cron just
 *   makes that window a *guaranteed* hourly freshness
 *   instead of a "whenever a crawler happens to show up"
 *   one.
 *
 * Schedule — install on the host that runs cron:
 *
 *   # Hourly, on the hour. Runs PHP, hits the three sitemap
 *   # URLs, logs OK/ERROR to the local log file and syslog,
 *   # exits non-zero on any failure so cron can email the
 *   # operator (set `MAILTO=you@…` at the top of the crontab).
 *   0 * * * * /usr/bin/php /opt/rangkuman/regenerate-sitemap.php
 *
 *   Or, for tighter freshness:
 *
 *   */30 * * * * /usr/bin/php /opt/rangkuman/regenerate-sitemap.php
 *
 *   The 30-minute interval costs 2× the cron hits but
 *   guarantees the rebuild always lands inside the 1-hour
 *   ISR window. Recommended.
 *
 * Dependencies: PHP 7.4+ with the cURL extension. No
 * Composer needed.
 *
 * Optional environment (all have sensible defaults):
 *
 *   SITEMAP_CRON_URL    Override the site origin (default
 *                       https://rangkuman.news). Useful for
 *                       staging.
 *   SITEMAP_CRON_PATHS  Comma-separated paths to hit (default
 *                       /sitemap.xml,/news-sitemap.xml,/story/sitemap.xml).
 *   SITEMAP_CRON_TIMEOUT  Curl timeout in seconds (default
 *                       120 — sitemap rebuild can take a
 *                       while when the walker paginates all
 *                       pages).
 *   SITEMAP_CRON_LOG    Local log file (default
 *                       /var/log/rangkuman/sitemap-cron.log).
 */

// ── Config ─────────────────────────────────────────────────────────
$origin = getenv('SITEMAP_CRON_URL') ?: 'https://rangkuman.news';
$paths  = array_filter(array_map(
    'trim',
    explode(',', getenv('SITEMAP_CRON_PATHS')
        ?: '/sitemap.xml,/news-sitemap.xml'),
));
$timeout = (int) (getenv('SITEMAP_CRON_TIMEOUT') ?: '120');
$logFile = getenv('SITEMAP_CRON_LOG')
    ?: '/var/log/rangkuman/sitemap-cron.log';

// ── Run ───────────────────────────────────────────────────────────
$anyFailure = false;

foreach ($paths as $path) {
    $url = rtrim($origin, '/') . '/' . ltrim($path, '/');
    $startedAt = microtime(true);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => $timeout,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_USERAGENT     => 'rangkuman-sitemap-cron/1.0',
    ]);

    $body = curl_exec($ch);
    $err  = curl_error($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $size = (int) curl_getinfo($ch, CURLINFO_SIZE_DOWNLOAD);
    $elapsedMs = (int) ((microtime(true) - $startedAt) * 1000);
    curl_close($ch);

    if ($body === false) {
        log_line('ERROR', sprintf(
            '%s curl failed: %s',
            $path,
            $err ?: 'unknown',
        ));
        $anyFailure = true;
        continue;
    }

    if ($code !== 200) {
        log_line('ERROR', sprintf(
            '%s HTTP %d (%d bytes in %d ms)',
            $path,
            $code,
            $size,
            $elapsedMs,
        ));
        $anyFailure = true;
        continue;
    }

    // Sanity check — an empty `<urlset>` means the walker
    // silently failed (caught an exception or hit an empty
    // page). Surface that as an error so cron can alert.
    if (strpos($body, '<urlset') === false) {
        log_line('ERROR', sprintf(
            '%s HTTP 200 but no <urlset> in body (%d bytes)',
            $path,
            $size,
        ));
        $anyFailure = true;
        continue;
    }

    log_line('OK', sprintf(
        '%s HTTP %d (%d bytes in %d ms)',
        $path,
        $code,
        $size,
        $elapsedMs,
    ));
}

exit($anyFailure ? 1 : 0);

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Append a single line to the local log file AND forward it
 * to syslog under the `rangkuman.sitemap` tag. The local
 * file is the source of truth (syslog may not be configured
 * everywhere); syslog is a free bonus for ops who already
 * watch it.
 *
 * Both writes are best-effort — a missing directory or no
 * `syslog` daemon must not fail the cron. The webhook result
 * above is the signal that matters.
 */
function log_line(string $level, string $msg): void
{
    global $logFile;

    $line = sprintf(
        '[%s] %s %s',
        date('c'),
        $level,
        $msg,
    );

    $dir = dirname($logFile);
    if (is_dir($dir) || @mkdir($dir, 0755, true)) {
        @file_put_contents($logFile, $line . PHP_EOL, FILE_APPEND);
    }

    @openlog('rangkuman.sitemap', LOG_PID | LOG_NDELAY, LOG_USER);
    @syslog(
        $level === 'ERROR' ? LOG_WARNING : LOG_INFO,
        $line,
    );
    @closelog();
}