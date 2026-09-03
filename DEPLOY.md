# Deployment Guide

Rangkuman.news adalah static site (output: `out/`). Bisa di-deploy ke banyak platform.

## Pre-requisites

Pastikan udah jalan:
```bash
npm install
npm run build
```

Output ada di folder `out/`. Folder ini yang di-upload/deploy.

---

## Option 1: Vercel (Recommended, ⭐ Easiest)

Vercel = creators of Next.js. Native support, instant deploys, free tier generous.

### Via CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Via Git
1. Push ke GitHub
2. Buka https://vercel.com/new
3. Import repo
4. Framework: Next.js (auto-detect)
5. Build command: `npm run build`
6. Output directory: `out` (auto)
7. Deploy

**Custom domain:** Settings → Domains → Add `rangkuman.news`

---

## Option 2: Cloudflare Pages (Best for Asia-Pacific)

Free, super fast global CDN, ~250ms TTFB worldwide.

### Via Dashboard
1. Push ke GitHub
2. Buka https://dash.cloudflare.com → Pages
3. Create application → Connect to Git
4. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Node version:** 20
5. Save and Deploy

### Via Wrangler CLI
```bash
npm i -g wrangler
wrangler pages deploy out --project-name=rangkuman-news
```

**Custom domain:** Custom domains → Add `rangkuman.news`

---

## Option 3: Netlify

```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod --dir=out
```

Atau via Git di https://app.netlify.com/start.

**Custom domain:** Domain settings → Add `rangkuman.news`

---

## Option 4: AWS S3 + CloudFront

### Upload ke S3
```bash
aws s3 sync out/ s3://rangkuman-news-prod/ --delete
```

### CloudFront
1. Buka CloudFront → Create distribution
2. Origin: S3 bucket `rangkuman-news-prod`
3. Default root object: `index.html`
4. Error pages: 404 → `/404/index.html`
5. Custom domain: Alternate domain names → `rangkuman.news`
6. SSL: ACM certificate

---

## Option 5: Nginx (self-hosted)

### Sync ke server
```bash
rsync -avz --delete out/ user@server:/var/www/rangkuman.news/
```

### Nginx config
```nginx
server {
    listen 80;
    server_name rangkuman.news www.rangkuman.news;
    root /var/www/rangkuman.news;
    index index.html;

    # Trailing slash redirect
    rewrite ^([^.]*[^/])$ $1/ permanent;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback (kalau perlu)
    # location / { try_files $uri $uri/ $uri.html /index.html; }
}
```

### SSL (Let's Encrypt)
```bash
sudo certbot --nginx -d rangkuman.news -d www.rangkuman.news
```

---

## Post-deploy verification

Setelah deploy, cek:

- [ ] HTTPS works (no mixed content warnings)
- [ ] Custom domain resolves
- [ ] All routes load (test 5-10 random URLs)
- [ ] Logo SVG renders (light + dark mode)
- [ ] Theme toggle works
- [ ] localStorage works (login, watchlist, bookmarks)
- [ ] Sitemap.xml accessible
- [ ] OG image shows on social share

### Quick smoke test
```bash
# Replace with your domain
DOMAIN="https://rangkuman.news"

# Test homepage
curl -sI $DOMAIN/ | head -1

# Test story page
curl -sI $DOMAIN/headline/detail/bisnis-mnc-rcti/ | head -1

# Test policy detail
curl -sI $DOMAIN/kebijakan/kenaikan-bbm-subsidi/ | head -1

# Test 404
curl -sI $DOMAIN/nonexistent | head -1
```

---

## Performance tips

1. **CDN** — pakai platform dengan global CDN (Vercel, Cloudflare, Netlify)
2. **Cache static assets** — `Cache-Control: public, max-age=31536000, immutable` untuk `/_next/static/*`
3. **Gzip / Brotli** — enable compression di server/CDN
4. **HTTP/2** — modern CDN sudah default
5. **Image optimization** — SVG udah optimal, no further work needed
6. **Bundle size** — kebanyakan page 118kB First Load JS, no further splitting needed

---

## Rollback

Kalo deploy gagal atau ada bug:

### Vercel
```bash
vercel rollback
```

### Cloudflare Pages
Dashboard → Deployments → klik deployment sebelumnya → "Rollback to this deploy"

### Netlify
Dashboard → Deploys → klik deploy sebelumnya → "Publish deploy"

### Manual (S3, Nginx)
Re-deploy previous build, atau git revert + rebuild.

---

## Monitoring (optional)

Add one of:
- **Plausible** (recommended, privacy-friendly) — https://plausible.io
- **Umami** (self-hosted) — https://umami.is
- **GA4** (heavy but full-featured)

Insert tracking script sebelum `</body>` di `app/layout.tsx`.

---

## Support

Untuk pertanyaan tentang deployment:
- Lihat [README.md](./README.md) untuk overview
- Lihat [HANDOVER.md](./HANDOVER.md) untuk on-boarding IT team
- Lihat [CHANGELOG.md](./CHANGELOG.md) untuk history
