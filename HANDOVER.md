# Handover Checklist — Rangkuman.news v1.7.0

Quick-start guide buat IT team接手. Ikutin step by step.

**Project:** Rangkuman.news
**Version:** 1.7.0 (June 2026)
**Stack:** Next.js 14.2 (App Router) + TypeScript 5.6 + Tailwind CSS 3.4
**Output:** Static export (`out/` folder)

---

## TL;DR (5 menit)

```bash
# Setup
cd rangkuman-news
npm install
npm run dev          # → http://localhost:3000

# Build production
npm run build        # → generates ./out/ (static HTML)

# Deploy
# Upload ./out/ to static host (Vercel, Netlify, S3, Nginx, dll)
```

---

## Day 1 — Setup lokal

### 1. Prasyarat
- [ ] Node.js 20 LTS terinstall (`node -v`)
- [ ] npm 9+ terinstall (`npm -v`)
- [ ] Git terinstall (`git --version`)

### 2. Clone & install
```bash
git clone <repo-url>
cd rangkuman-news
npm install
```

### 3. Run dev server
```bash
npm run dev
# → http://localhost:3000
```

Buka di browser. Test:
- [ ] Homepage load
- [ ] Navbar: klik semua tab (Saham, Bisnis, Ekonomi, Kebijakan, Global, Crypto)
- [ ] Theme toggle: switch light/dark
- [ ] Story page: buka `/sorotan/[id]/`
- [ ] Detail page: `/kebijakan/kenaikan-bbm-subsidi/`
- [ ] localStorage: login (mock), watchlist, saved

### 4. Verify build
```bash
npm run build
```

Should produce `./out/` with 121 static pages. Cek:
- [ ] No errors
- [ ] `out/index.html` exists
- [ ] `out/kebijakan/kenaikan-bbm-subsidi/index.html` exists
- [ ] Bundle sizes reasonable (most pages 118kB)

### 5. Verify static output
```bash
# Serve locally
npx serve out
# → http://localhost:3000 (production build)
```

Test all features work the same as dev.

---

## Day 2 — Deploy ke staging

### 6. Pilih platform

Recommended: **Cloudflare Pages** (free, fast, global CDN)

Lihat [DEPLOY.md](./DEPLOY.md) untuk setup detail per platform:
- Cloudflare Pages
- Vercel
- Netlify
- AWS S3 + CloudFront
- Nginx (self-hosted)

### 7. Configure environment

**Tidak ada env vars.** Project ini 100% static.

### 8. Setup custom domain

Domain: `rangkuman.news` (atau subdomain)

DNS:
- `A` record → hosting IP (kalo pake S3/Nginx)
- `CNAME` → hosting URL (kalo pake Vercel/Netlify/Cloudflare)
- Force HTTPS (Let's Encrypt atau platform default)

### 9. Setup CI/CD

Recommended: GitHub Actions / GitLab CI

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: rangkuman-news
          directory: out
```

---

## Day 3 — Production launch

### 10. Final checks

- [ ] All pages load (test 5-10 random URLs)
- [ ] Theme toggle works
- [ ] Logo SVG renders correctly (in light + dark)
- [ ] Mobile responsive (test iPhone, Android, iPad, desktop)
- [ ] Accessibility: keyboard navigation, screen reader
- [ ] SEO: meta tags, OG image, sitemap (optional)
- [ ] Performance: Lighthouse score ≥ 90
- [ ] 404 page works

### 11. SEO submission

- [ ] Submit sitemap to Google Search Console
- [ ] Submit to Bing Webmaster
- [ ] Verify OG image shows when sharing to WA/Telegram

### 12. Analytics (optional)

Add one of:
- Plausible (privacy-friendly, recommended)
- Umami (self-hosted)
- GA4 (heavy but full-featured)

Insert tracking script di `app/layout.tsx` (search for `</body>`).

---

## Project structure (TL;DR)

```
rangkuman-news/
├── app/                              # Pages
│   ├── page.tsx                      # Home
│   ├── saham/  bisnis/  ekonomi/  kebijakan/  global/  crypto/  komoditas/
│   ├── kebijakan/[slug]/             # 8 policy detail pages
│   ├── sorotan/[id]/                 # 50 story pages
│   ├── stock/[kode]/                 # 34 stock pages
│   ├── sektor/  sektor/[slug]/       # 12 sector pages
│   ├── trending/  search/  watchlist/  saved/  login/
│   └── tentang/  disclaimer/  privasi/  ...  (8 static info pages)
│
├── components/                       # ~58 React components
├── lib/mock/                         # All mock data
├── lib/hooks/                        # localStorage-backed hooks
├── public/                           # Logo SVG, favicon, OG image
└── tailwind.config.ts                # Color tokens via CSS vars
```

**121 static pages, 58 components, 18 routes.**

---

## Key files buat IT

| File | Penting karena |
|------|---------------|
| `next.config.js` | `output: 'export'` — static export mode |
| `package.json` | Dependencies, scripts, name, version |
| `app/globals.css` | Color tokens (light/dark), tailwind base |
| `tailwind.config.ts` | Tailwind config, theme tokens |
| `lib/mock/*.ts` | All content data — edit di sini untuk update |
| `public/logo*.svg` | Logo files |
| `app/layout.tsx` | Root layout, fonts, OG metadata |
| `DEPLOY.md` | Platform-specific deploy instructions |

---

## Common operations

### Edit data (prices, stocks, news)

1. Edit file di `lib/mock/`
2. `npm run build`
3. Deploy

Contoh: ganti harga BBCA
```ts
// lib/mock/stocks.ts
{ kode: "BBCA", harga: 9875, change: 2.22, ... }
```

### Edit color

1. `app/globals.css` → ubah `--brand`, `--logo-accent`
2. `tailwind.config.ts` → already references CSS vars, no change needed
3. Rebuild

### Edit text (heading, label)

1. Find component di `components/`
2. Edit JSX
3. Rebuild

### Add new page

1. `mkdir -p app/[nama]`
2. `app/[nama]/page.tsx`:
   ```tsx
   export default function FooPage() {
     return <div>Hello</div>;
   }
   ```
3. Add link di `components/Footer.tsx` or `components/Navbar.tsx`
4. Rebuild

---

## Maintenance schedule

| Task | Frequency | Time |
|------|-----------|------|
| Update stock prices | Daily (mock) | 5 min |
| Update news/recaps | Daily (mock) | 30 min |
| Update policy tracker | Weekly | 30 min |
| Update crypto prices | Daily (mock) | 5 min |
| Dependency updates | Monthly | 30 min |
| Lighthouse audit | Monthly | 30 min |
| Full content review | Quarterly | 2-3 hours |

---

## Known issues & gotchas

1. **Static export, no SSR** — kalau perlu dynamic per-user content, harus migrasi ke SSR
2. **localStorage, no server sync** — watchlist gak sync antar device
3. **Mock data only** — semua angka adalah mock, jangan dipake untuk trading beneran
4. **No analytics** — belum ada tracking
5. **Bundle size for /crypto/ (285kB)** — heaviest page karena chart components
6. **SloganStrip di Footer** — tagline kelihatan di setiap page, by design

---

## Kontak

Untuk pertanyaan tentang project ini:
- Repo issues: <github-url>
- Slack/Discord: <link>
- Email: <email>

---

## License

Proprietary. © 2026 Rangkuman.news.
