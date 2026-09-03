# Sitemap cron (PHP)

`regenerate-sitemap.php` is a cron-driven warmer for the Next.js
sitemap ISR cache. Run it on a schedule from any host that has PHP
+ cURL installed; it doesn't need to be the same box as your Next.js
server.

## What it does

Each run GETs two sitemap URLs in order:

- `/sitemap.xml` — root sitemap. Next.js auto-merges `app/sitemap.ts`
  (sections + per-headline URLs) and `app/story/sitemap.ts`
  (listing URLs) into this single output, so one URL covers both.
- `/news-sitemap.xml` — Google News sitemap (`app/news-sitemap.xml/route.ts`).
  Lives at a separate URL because Next.js's `sitemap.ts` convention
  only emits `/sitemap.xml`; this one is a route handler.

Each is configured with `revalidate = 3600` in the Next.js app, so
the **first hit after the 1-hour cache window expires** triggers a
background rebuild. Without this cron, the sitemap only refreshes
when a real visitor/crawler happens to land on the URL after the
TTL expires — which can mean hours of staleness on slow-news days.

With this cron running on a schedule, the sitemap is **guaranteed**
to be fresh at least once per ISR window.

## Install (production)

1. **Copy the script** to the host that runs cron:
   ```bash
   sudo mkdir -p /opt/rangkuman
   sudo cp scripts/regenerate-sitemap.php /opt/rangkuman/
   sudo chmod +x /opt/rangkuman/regenerate-sitemap.php
   ```

2. **Pick a log location** the cron user can write to. Default is
   `/var/log/rangkuman/sitemap-cron.log` — if `/var/log/rangkuman`
   doesn't exist, either create it with the right ownership or
   override via `SITEMAP_CRON_LOG` (e.g., `SITEMAP_CRON_LOG=/var/log/sitemap-cron.log`).

3. **Add to the user's crontab** (`crontab -e`):
   ```cron
   MAILTO=you@example.com
   # Warm sitemaps hourly on the half-hour. The 30-min interval
   # guarantees a hit lands inside the 1-hour ISR window even if
   # the cron daemon drifts by a few minutes.
   */30 * * * * /usr/bin/php /opt/rangkuman/regenerate-sitemap.php
   ```

   `MAILTO` makes cron email you on non-zero exit (i.e., any URL
   that 500s or times out). Drop the line if you don't want emails.

4. **Verify**:
   ```bash
   # Manual run — should print "[OK]" lines and exit 0
   /usr/bin/php /opt/rangkuman/regenerate-sitemap.php
   echo $?   # → 0

   # Wait for the next cron tick, then check the log
   tail -f /var/log/rangkuman/sitemap-cron.log
   # or via syslog
   journalctl -t rangkuman.sitemap -f
   ```

## Required on the Next.js side

Nothing. The script just GETs the publicly-served sitemap URLs.
The Next.js app's ISR cache handles invalidation automatically.

If you ever move the sitemaps behind auth or rate-limiting, you'll
need to add the matching credential here — the script is currently
unauthenticated because the sitemap endpoints are public.

## Optional env vars

| Var | Default | Purpose |
|---|---|---|
| `SITEMAP_CRON_URL` | `https://rangkuman.news` | Override site origin (use for staging). |
| `SITEMAP_CRON_PATHS` | `/sitemap.xml,/news-sitemap.xml` | Comma-separated paths. |
| `SITEMAP_CRON_TIMEOUT` | `120` | Per-request timeout in seconds. |
| `SITEMAP_CRON_LOG` | `/var/log/rangkuman/sitemap-cron.log` | Local log file. |

Example with overrides:
```cron
*/30 * * * * SITEMAP_CRON_URL=https://staging.example.com /usr/bin/php /opt/rangkuman/regenerate-sitemap.php
```

## Failure modes

The script exits non-zero if either URL:

- Fails to connect (DNS, network, timeout)
- Returns non-200
- Returns 200 but the body has no `<urlset>` (walker errored out)

Cron will then email `MAILTO`. Common causes to look for in the log:
- `curl failed` → firewall blocked the cron host, or site is down
- `HTTP 500` → Next.js build issue, check server logs
- `no <urlset>` → walker broke (backend unreachable, auth added, etc.)