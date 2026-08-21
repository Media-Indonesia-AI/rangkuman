# Rangkuman.news

Portal ringkasan pasar modal Indonesia untuk investor ritel. Recap saham harian, market mood, trending, analisis sektoral, kebijakan, dan berita crypto — **semua mock data, fully static, deploy ke mana aja**.

**Brand:** Rangkuman.news
**Tagline:** "Baca lebih sedikit, tahu lebih banyak"
**Live demo:** https://1w32ur3b725c.space.minimax.io (v1.7.0)

---

## Tech stack

| Layer | Tech | Versi |
|-------|------|-------|
| Framework | Next.js (App Router) | 14.2.15 |
| Language | TypeScript | 5.6.3 |
| Styling | Tailwind CSS | 3.4.13 |
| UI primitives | lucide-react icons | 0.453.0 |
| Utility | clsx, tailwind-merge, date-fns | latest |
| Image | sharp (dev only, untuk OG image) | 0.34.5 |
| Font | Inter, JetBrains Mono (via next/font) | latest |

**Static export only** — `output: 'export'` di `next.config.js`. Output folder: `out/`. Bisa di-host di static host manapun (Vercel, Netlify, Cloudflare Pages, S3, Nginx, dll).

**Tidak butuh backend.** Semua data mock. Auth & watchlist pakai localStorage. Tidak ada API routes, tidak ada server actions.

---

## Quick start

### Prasyarat
- Node.js ≥ 18.17 (recommended: **20 LTS**)
- npm ≥ 9 (atau pnpm/yarn equivalent)

### Install & develop
```bash
cd rangkuman-news
npm install
npm run dev          # http://localhost:3000
```

### Build untuk production
```bash
npm run build        # output di ./out/
```

Output `out/` bisa langsung di-upload ke static host manapun.

### Verify sebelum deploy
```bash
# TypeScript check
npx tsc --noEmit --skipLibCheck

# ESLint
npx eslint --ext .ts,.tsx --max-warnings 0 app/ components/ lib/

# Build size sanity check
du -sh out/
ls -la out/*.html
```

---

## Project structure

```
rangkuman-news/
├── app/                              # Next.js App Router (pages + layouts)
│   ├── layout.tsx                    # Root layout: theme, fonts, OG image
│   ├── page.tsx                      # Home: Sorotan + Berita Terkini
│   ├── globals.css                   # Tailwind + CSS variables (light/dark)
│   │
│   ├── saham/                        # /saham (sub-tab: Recap | Sektor)
│   ├── bisnis/                       # /bisnis (category view)
│   ├── ekonomi/                      # /ekonomi (with macro indicators)
│   ├── kebijakan/                    # /kebijakan (with policy tracker)
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx           # /kebijakan/[slug] — detail per topik
│   ├── global/                       # /global (bursa global + news)
│   ├── crypto/                       # /crypto (Recap | Pasar tabs)
│   ├── komoditas/                    # /komoditas
│   │
│   ├── crypto/  detail/[id]/        # 50 story detail pages
│   ├── stock/[kode]/                 # 34 stock detail pages
│   ├── sektor/[slug]/                # 12 sector detail pages
│   │
│   ├── trending/  search/  watchlist/  login/
│   ├── kerjasama/  syarat-ketentuan/  kontak/
│   │
│   └── not-found.tsx                 # Custom 404
│
├── components/                       # ~58 React components
│   ├── Navbar.tsx                    # Top nav, theme toggle, login state, mobile menu
│   ├── Footer.tsx                    # Footer with SloganStrip
│   ├── TopTicker.tsx                 # Marquee ticker (variants: stocks/crypto/global)
│   ├── Logo.tsx                      # Custom R monogram SVG
│   ├── Brand.tsx                     # Logo + wordmark + tagline lockup
│   ├── SloganStrip.tsx               # "Baca lebih sedikit, tahu lebih banyak" bar
│   ├── BrandSlogan.tsx               # Above-the-fold homepage tagline
│   │
│   ├── StoryHero.tsx                 # 1 big card (Sorotan)
│   ├── StoryEditorial.tsx            # Editorial cards (Berita Terkini)
│   │
│   ├── CategoryPageView.tsx          # Shared layout for category pages
│   ├── PolicyTracker.tsx             # Status board untuk kebijakan
│   ├── MacroIndicators.tsx           # IHSG, USD/IDR, dll untuk /ekonomi/
│   ├── WorldIndices.tsx              # S&P 500, Nikkei, dll untuk /global/
│   │
│   ├── CryptoInfoBar.tsx             # 1-line crypto info (F&G, sparklines, BTC.D)
│   ├── CryptoSubNav.tsx              # /crypto/ Recap | Pasar tabs
│   ├── sektor/                       # /saham/ + /sektor/ sector grid
│   │   ├── SektorSection.tsx          # section + grid orchestration
│   │   ├── SektorCard.tsx             # one tile in the 12-sector grid
│   │   ├── hueStyles.ts               # per-hue Tailwind class maps
│   │   └── index.ts                   # barrel: SektorSection, SektorCard
│   │
│   ├── commodity-prices/             # commodity-price tile grid (live API)
│   │   ├── CommodityPrices.tsx        # one section per wire category
│   │   ├── CommodityPricesShimmer.tsx # loading skeleton
│   │   ├── CommodityPricesEmpty.tsx   # empty-state shell
│   │   ├── categoryStyles.ts          # per-bucket chip styling
│   │   ├── commodityIcons.ts          # per-commodity / per-category icons
│   │   └── index.ts                   # barrel
│   │
│   ├── sektor-detail/                # /sektor/[slug] sector detail page
│   │   ├── SektorDetailPage.tsx        # page orchestrator (loading/data/404)
│   │   ├── SektorDetailHeader.tsx      # sector header (hue + sentiment + stats)
│   │   ├── SektorTopStocks.tsx         # top-5 stocks section
│   │   ├── SektorTopStockCard.tsx      # one top-5 stock tile
│   │   ├── SektorDetailNews.tsx        # news placeholder section
│   │   ├── SektorDetailSkeleton.tsx    # loading shimmer
│   │   ├── SektorDetailEmpty.tsx       # 404 defensive fallback
│   │   └── index.ts                    # barrel
│   │
│   ├── DatePicker.tsx  DateTabs.tsx  DateDivider.tsx
│   ├── ShareButton.tsx
│   ├── SearchBar.tsx  ThemeToggle.tsx
│   ├── InfoPage.tsx                  # Template for static legal/about pages
│   ├── KeyDataBlock.tsx              # Story detail key data
│   ├── MarketSnapshot.tsx            # 4-col data widget
│   │
│   └── ...                           # Plus ~30 more
│
├── lib/
│   ├── mock/                         # ALL mock data lives here
│   │   ├── highlights.ts             # 50 stories with events, keyData, affectedCategories
│   │   ├── stocks.ts                 # 34 stocks
│   │   ├── recaps.ts                 # 3 days of recap stories
│   │   ├── sector-stocks.ts          # 12 sectors with stocks
│   │   ├── crypto.ts                 # 12 coins, 8 categories, 3 days recaps
│   │   ├── policy-tracker.ts         # 8 trending policy topics
│   │   ├── policy-stories.ts         # 3-4 stories per policy topic
│   │   ├── category-widgets.ts       # MacroIndicators + WorldIndices
│   │   ├── commodities.ts            # Commodity prices
│   │   └── ...                       # 10+ more
│   │
│   ├── hooks/                        # React hooks (client-side)
│   │   ├── useAuth.ts                # Mock auth state
│   │   ├── useWatchlist.ts
│   │   └── useSaved.ts
│   │
│   ├── auth.ts  saved.ts  newsletter.ts  search.ts
│   ├── og.ts                         # buildPageMetadata() helper
│   ├── utils.ts                      # cn() class-name utility
│   └── util/                         # format helpers
│
├── public/
│   ├── logo.svg                      # Full lockup (icon + "rangkuman.news")
│   ├── logo-icon.svg                 # Icon only (R + stripes)
│   ├── favicon.svg                   # Browser favicon
│   ├── og-default.svg                # OG image source
│   └── ...
│
├── scripts/
│   └── build-og.mjs                  # Regenerate og-default.png
│
├── tailwind.config.ts                # Color tokens via CSS variables
├── postcss.config.js
├── tsconfig.json
├── next.config.js                    # output: 'export', trailing slash
└── package.json                      # name: "rangkuman-news", version: "1.7.0"
```

**Total: 121 static pages, 58 components, 18 routes, fully static.**

---

## Key concepts

### 1. Brand identity

| Element | Value |
|---------|-------|
| Brand name | **Rangkuman.news** |
| Tagline | "Baca lebih sedikit, tahu lebih banyak" |
| Logo | Custom R monogram (R + 3 stripes + teal leg detail) |
| Logo wordmark | "rangkuman" (navy) + "." (orange) + "news" (teal) |
| Navy (logo accent, light) | `#1E3A8A` |
| Teal (stripes, "news") | `#14B8A6` |
| Orange (brand, ".") | `#F7931A` |

Logo files di `public/`:
- `logo.svg` — full lockup (icon + wordmark, 1.8:1 aspect)
- `logo-icon.svg` — icon only (square)
- `favicon.svg` — favicon (navy bg with white R)

Component usage:
```tsx
<Logo size={32} />           // icon only
<Logo size={36} full />      // full lockup
<Brand logoSize={32} />      // navbar (icon + wordmark)
<Brand logoSize={36} tagline full />  // footer (full + tagline)
```

### 2. Theming (light/dark mode)

- CSS variables di `app/globals.css` untuk light & dark mode
- Tailwind config reference variables: `bg-bg-primary`, `text-text-primary`, dll
- Mode disimpan di localStorage (`rangkuman-news:theme`)
- Inline script di `<head>` di root layout untuk prevent flash of wrong theme
- Toggle component: `components/ThemeToggle.tsx`

**Color tokens:**
```css
/* Light mode (default :root) */
--bg-primary: #FFFFFF;       --bg-secondary: #F1F5F9;   --bg-tertiary: #E2E8F0;
--text-primary: #0B1220;    --text-secondary: #475569;  --text-muted: #64748B;
--brand: #F7931A;           --brand-hover: #E07F0F;     --logo-accent: #1E3A8A;
--bullish: #15803D;         --bearish: #B91C1C;         --mixed: #B45309;

/* Dark mode (.dark) */
--bg-primary: #0A0A0B;       --bg-secondary: #131316;    --bg-tertiary: #1F1F23;
--text-primary: #FAFAFA;    --text-secondary: #A1A1AA;   --text-muted: #71717A;
--brand: #F7931A;           --brand-hover: #FFA940;     --logo-accent: #F7931A;
--bullish: #16C784;         --bearish: #EA3943;         --mixed: #FFB020;
```

**Add a new color token:**
```ts
// 1. Add to globals.css under :root and :root.dark
:root { --my-color: #FF0000; }
:root.dark { --my-color: #00FF00; }

// 2. Add to tailwind.config.ts
colors: { "my-color": "var(--my-color)" }

// 3. Use in any component
<div className="bg-my-color">...</div>
```

### 3. Story flow (event-driven)

Cerita direpresentasikan sebagai sequence of events. Setiap story punya:
- `id` (string)
- `title`, `summary` (1-2 kalimat)
- `category` (kategori utama)
- `affectedCategories: Category[]` (multi-tag untuk cross-listing)
- `events: StoryEvent[]` (timeline kronologis)
- `keyData: KeyData[]` (data penting, e.g. "+2.3%" / "Rp 9.875")
- `flag?` (country/chain emoji untuk identifier)

Lihat `lib/mock/highlights.ts` untuk schema lengkap.

### 4. Categories (6 navigasi utama)

| Slug | Label | Widget |
|------|-------|--------|
| `saham` | Saham | DatePicker + sub-tab Recap/Sektor |
| `bisnis` | Bisnis | (none) |
| `ekonomi` | Ekonomi | MacroIndicators (IHSG, USD/IDR, BI Rate, dll) |
| `kebijakan` | Kebijakan | PolicyTracker (8 trending topics) |
| `global` | Global | WorldIndices + MarketSnapshot |
| `crypto` | Crypto | CryptoInfoBar + sub-tab Recap/Pasar |

### 5. localStorage schema

All keys live under the `rangkuman-news:*` prefix. The previous
`beritainvestor:*` namespace was retired in a hard cutover with
no migration shim — existing user data was left under the old
keys and the app silently re-onboarded those users as fresh
visitors on first paint.

| Key | Type | Purpose |
|-----|------|---------|
| `rangkuman-news:user` | `{ email, username, name, password, … }` (JSON) | Mock auth session |
| `rangkuman-news:setupToken` | `string` | One-time token from `POST /auth/register` |
| `rangkuman-news:watchlist` | `{ codes: string[], updatedAt: string }` | User's watchlist snapshot (max 10 tickers) |
| `rangkuman-news:theme` | `"dark"` \| `"light"` | Theme preference |
| `rangkuman-news:saved` | `SavedItem[]` (JSON) | Bookmarks (stocks + stories + coins) |
| `rangkuman-news:newsletter` | `SubscriberEntry[]` (JSON) | List of subscribed emails |
| `rangkuman-news:newsletter_dismissed` | `{ until: ISO string }` | Pill-dismiss cooldown (24h) |
| `rangkuman-news:saham-tab` | `"recap"` \| `"sektor"` | Active sub-tab on `/saham` |
| `rangkuman-news:saham-recap-date` | `YYYY-MM-DD` | Active DatePicker value on `/saham` |

**Cross-tab sync:** pakai `storage` event + custom event
`rangkuman-news:storage` (and `rangkuman-news:saved-changed` for
the bookmarks key, which predates the shared helper). Lihat
`lib/auth.ts`, `lib/newsletter.ts`, `lib/saved.ts`.

**sessionStorage** (separate namespace, cleared per tab):

| Key | Purpose |
|-----|---------|
| `rangkuman:auth-prev-path` | Last non-auth pathname, captured by `<PathnameTracker />` and read by `getAuthRedirectTarget()` after login/register |

**Clear all local data (untuk testing):**
```js
// Browser DevTools console
Object.keys(localStorage)
  .filter(k => k.startsWith('rangkuman-news:'))
  .forEach(k => localStorage.removeItem(k));
```

### 6. Routing & static export

- **121 routes total**, all pre-rendered as static HTML
- Dynamic routes: `/stock/[kode]` (34), `/sektor/[slug]` (12), `/sorotan/detail/[id]` (50), `/kebijakan/[slug]` (8)
- Trailing slash enabled di `next.config.js`
- Custom 404 page di `app/not-found.tsx`

**Add a new static page:**
```bash
mkdir -p app/foo
# create app/foo/page.tsx
# create app/foo/layout.tsx (optional, for metadata)
```

### 7. SEO & Open Graph

Setiap page export `metadata` (server component) atau ada `layout.tsx` (client component) yang exports metadata.

OG image default di `public/og-default.png` (1200×630). Di-share ke WhatsApp/Telegram → preview muncul.

**Regenerate OG image:**
```bash
# 1. Edit public/og-default.svg
# 2. Run:
node scripts/build-og.mjs
```

Helper: `buildPageMetadata()` di `lib/og.ts` untuk konsistensi OG tags.

---

## Pages overview

### Public
- `/` — Home (Sorotan + Berita Terkini)
- `/sorotan/detail/[id]/` — 50 story detail pages
- `/saham/` — Stocks (sub-tab: Recap | Sektor)
- `/bisnis/`, `/ekonomi/`, `/kebijakan/`, `/komoditas/` — Category pages
- `/kebijakan/[slug]/` — 8 policy detail pages
- `/global/`, `/crypto/` — News portals (sub-tab + info bar)
- `/sektor/`, `/sektor/[slug]/` — 12 sector pages
- `/stock/[kode]/` — 34 stock pages
- `/trending/`, `/search/`, `/watchlist/`, `/login/`
- `/kontak-kerjasama/`, `/syarat-ketentuan/`

### Internal
- `/not-found` — custom 404

---

## Common tasks

### Update content (text, prices, stocks)
```bash
# 1. Edit lib/mock/*.ts
# 2. Rebuild
npm run build
# 3. Deploy (lihat DEPLOY.md)
```

### Add a new policy topic
1. Edit `lib/mock/policy-tracker.ts` → tambah entry di `POLICY_TOPICS`
2. Tambah stories di `lib/mock/policy-stories.ts`
3. `/kebijakan/[slug]/` auto-generates via `generateStaticParams()`

### Add a new crypto coin
1. Edit `lib/mock/crypto.ts` → tambah entry di `COINS` + `COIN_CATEGORIES`
2. Tambah recap di `coinRecaps`
3. Update `STORIES_BY_CATEGORY.crypto` di `lib/mock/highlights.ts`

### Tambah halaman baru
1. `mkdir -p app/[nama]`
2. `app/[nama]/page.tsx` — bisa pakai `<InfoPage>` template untuk halaman legal/about
3. Update Footer.tsx dengan link baru
4. Tambah metadata (title, OG tags)

### Ganti warna brand
1. `app/globals.css` → ubah `--brand`, `--logo-accent`
2. Logo files di `public/*.svg` punya warna hardcoded — edit manual kalo perlu
3. Rebuild

### Ganti logo
1. Replace `public/logo.svg` & `public/logo-icon.svg` dengan file baru (SVG recommended)
2. `components/Logo.tsx` udah handle swap otomatis

---

## Environment variables

**Tidak ada.** Static export, no secrets, no API keys.

Kalau nanti mau connect ke real data source:
1. Tambah `.env.local` dengan API keys
2. Tambah di `next.config.js` `env: { MY_KEY: process.env.MY_KEY }`
3. Fetch di server-side component sebelum static export
4. **Atau** migrate ke ISR/SSR mode (ganti `output: 'export'` jadi `output: 'standalone'`)

---

## Build & deploy workflow

Lihat **[DEPLOY.md](./DEPLOY.md)** untuk detail per platform.

Ringkas:
```bash
npm install
npm run build      # generates ./out/
# upload ./out/ to your host
```

---

## Bundle stats (v1.7.0)

| Route | First Load JS |
|-------|---------------|
| `/` (homepage) | 118 kB |
| `/kebijakan/`, `/bisnis/`, dll | 118 kB |
| `/kebijakan/[slug]/` | 118 kB (8 pages) |
| `/sorotan/detail/[id]/` | 120 kB (50 pages) |
| `/stock/[kode]/` | 118 kB (34 pages) |
| `/sektor/[slug]/` | 118 kB (12 pages) |
| `/saham/` | 157 kB |
| `/crypto/` | 285 kB (heaviest, charts) |
| `/login/`, `/search/` | 120-133 kB |

Total chunks: ~1.9 MB (well-cached across pages).

---

## Maintenance & known limitations

- **All data is mock** — to go to production, integrate real data source (BEI API, news feeds)
- **Auth is mock** — no real password, no server session. Replace with real auth (NextAuth, Clerk, etc.) when needed
- **Watchlist is local-only** — kalau user ganti device, watchlist ilang. Sync ke server kalau perlu
- **No backend** — kalau perlu fitur seperti comment, like, atau sharing-to-server, tambah API routes (butuh server, bukan static export)
- **No analytics** — belum ada tracking. Tambah Plausible/Umami/GA4 kalau perlu

---

## Migration to real backend (future)

Project ini di-design biar gampang migrasi ke SSR. Steps:

1. Ganti `next.config.js`:
   ```js
   module.exports = { output: 'standalone' };  // instead of 'export'
   ```

2. Add API routes di `app/api/`

3. Replace mock data dengan `fetch()` di server components:
   ```ts
   export default async function Page() {
     const stocks = await fetch('https://api.example.com/stocks').then(r => r.json());
     return <StockList stocks={stocks} />;
   }
   ```

4. Move localStorage (auth, watchlist) ke server session + DB

5. Tambah ISR (`revalidate: 60`) untuk incremental updates tanpa full rebuild

---

## License

Proprietary. © 2026 Rangkuman.news.
