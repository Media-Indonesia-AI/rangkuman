# Changelog

All notable changes to Rangkuman.news. Newest first.

## v1.7.0 — June 2026 (current)

**Live demo:** https://1w32ur3b725c.space.minimax.io

### 🎨 Brand & Visual

- **Custom logo** (R + stripes + "rangkuman.news" wordmark) — replaces generic R monogram
  - `public/logo.svg` (full lockup)
  - `public/logo-icon.svg` (icon only)
  - `public/favicon.svg` (favicon)
- **Brand colors locked**: Navy `#1E3A8A` (logo accent) + Teal `#14B8A6` + Orange `#F7931A`
- **Inter only** (no Playfair) — single font family across the app
- **Logo accent follows theme**: navy in light mode, orange in dark mode

### 📢 Tagline

- **BrandSlogan** — above-the-fold "BACA LEBIH SEDIKIT, TAHU LEBIH BANYAK" on homepage
- **SloganStrip** — same tagline in Footer, visible on every page
- **Brand tagline** — tagline in Brand component (Navbar, Footer, Login)
- **Tagline dedup** — single SloganStrip per page (no triple repetition)

### 🆕 Policy Tracker (kebijakan)

- **Replaces Kalender Regulasi** — static calendar → live status board
- **8 trending policy topics**: BBM, Ekspor 1 Pintu, Pajak Ekspor, THR, Tapera, PMSE, LPG, PLN
- **6 status types** with color-coded badges: Rancangan, Pembahasan DPR, Uji Publik, Disahkan, Ditunda, Ditolak
- **Mini timeline** per topic (3 events, color-coded dots)
- **8 detail pages** at `/kebijakan/[slug]/` with full timeline + related stories

### 🪙 Crypto & Global

- **/crypto/** — news portal (Recap | Pasar sub-tabs), 1-line info bar (F&G + 3 sparklines + BTC.D)
- **/global/** — news portal with WorldIndices + MarketSnapshot widgets
- **Context-aware TopTicker** — variants for stocks/crypto/global
- **6 TODAY crypto recaps** + **7 global stories** in highlights

### 🧹 Code quality

- **Removed dead code**: `AltcoinSeasonBar.tsx`, `HighlightCard.tsx`, `RegulatoryCalendar.tsx`
- **Removed unused imports** across multiple files
- **Reduced TopTicker padding** for 6-link navbar
- **A11y improvements**: aria-label on Footer, aria-label on Topik list

### 📊 Performance

- 121 static pages, all pre-rendered
- First Load JS: 118-285 kB (most pages 118 kB)
- Static export, CDN-ready
- SVG logos (tiny, scalable)

### 🐛 Bug fixes

- **Crypto sub-nav positioning** — moved from right to left, restored "Recap" label
- **Section header removal** from category pages (no duplicate navigation)
- **Tagline repetition** — single SloganStrip per page
- **TopTicker marquee** — seamless infinite loop with item duplication

### 📦 Dependencies

No new dependencies. Same stack as v1.0.0.

---

## v1.0.0 — Initial Release (June 2026)

- 18 routes, 121 static pages
- 6 categories (Saham, Bisnis, Ekonomi, Kebijakan, Global, Crypto)
- 50 story pages, 34 stock pages, 12 sector pages
- 8 legal/info pages
- Full theming (light/dark)
- localStorage-based auth, watchlist, bookmarks
- Mock data, static export, no backend

---

## Migration notes

- v1.7.0 is fully backward compatible with v1.0.0
- localStorage keys preserved: `beritainvestor:*`
- No breaking API changes
- All routes accessible at same paths
