import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { NewsletterFloatingPill } from "@/components/NewsletterFloatingPill";
import { PathnameTracker } from "@/components/PathnameTracker";
import { ToastContainer } from "@/components/Toast";
import { GuestLoginDialog } from "@/components/GuestLoginDialog";
import { TopTickerRouter } from "@/components/TopTickerRouter";
import { BfcacheRecovery } from "@/components/BfcacheRecovery";
import { TopicsProvider } from "@/components/topics-provider";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { FaviconSync } from "@/components/FaviconSync";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rangkuman.news"),
  title: {
    default: "Rangkuman — Baca lebih sedikit, tahu lebih banyak",
    template: "%s",
  },
  description:
    "Rangkuman bisnis & ekonomi Indonesia dari 11 sumber, dikurasi AI. Saham, bisnis, ekonomi, kebijakan — intinya aja.",
  keywords: [
    "recap saham",
    "berita saham",
    "investor Indonesia",
    "IHSG",
    "saham",
    "pasar modal",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://rangkuman.news",
    siteName: "Rangkuman",
    title: "Rangkuman — Baca lebih sedikit, tahu lebih banyak",
    description:
      "Rangkuman bisnis & ekonomi Indonesia dari 11 sumber, dikurasi AI.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rangkuman — Baca lebih sedikit, tahu lebih banyak",
    description:
      "Rangkuman bisnis & ekonomi Indonesia dari 11 sumber, dikurasi AI.",
  },
  icons: {
    // Two favicons, one per `prefers-color-scheme`. Browsers that
    // respect the media query (Safari, Firefox, Chrome on macOS /
    // iOS) pick the right one at cold load based on the OS theme.
    // Browsers that don't still get a valid link, just not a
    // theme-aware one. `<FaviconSync />` in the body handles the
    // user-toggle case: it rewrites the link href whenever the
    // `.dark` class flips, so the tab icon follows the in-app
    // theme toggle instead of staying pinned to the OS preference.
    // The background stays white in both variants — only the icon
    // glyph (blue vs orange) flips — so the tab reads cleanly on
    // any browser/OS chrome.
    icon: [
      {
        url: "/blue.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/orange.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem(${JSON.stringify(STORAGE_KEYS.theme)});
                if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="relative min-h-screen bg-bg-primary font-sans text-[14px] leading-relaxed text-text-primary antialiased">
        {/*
          Layout-level providers. Each one is a small client island
          that owns a piece of cross-route state (top-ticker router,
          bfcache recovery, the shared topics list). Mounting them
          here means a single network round-trip per data source
          when the app first hydrates, regardless of which route the
          user lands on. Subsequent routes read from cache / context
          without re-fetching.
        */}
        <TopicsProvider>
          {/* Google Analytics — loads gtag.js + fires pageviews on
              every App Router navigation. Wrapped in `<Suspense>`
              because the client component uses `useSearchParams()`
              inside its pageview-tracking effect, which would
              otherwise force the whole layout into dynamic rendering.
              The fallback is `null` because the analytics effect
              itself doesn't render anything — the `<Suspense>` only
              exists to satisfy Next.js's prerender-time check. */}
          <Suspense fallback={null}>
            {/* Pass `gaId` from the server component instead of letting
                the client component read `process.env.GA_ID` itself —
                non-`NEXT_PUBLIC_` env vars are `undefined` in the
                client bundle and would cause a hydration mismatch
                that drops the gtag init script. */}
            <GoogleAnalytics gaId={process.env.GA_ID} />
          </Suspense>
          <TopTickerRouter />
          <BfcacheRecovery />
          <FaviconSync />
          {/* Side-effect-only: writes the current pathname to
              sessionStorage on every navigation so the auth
              pages know which page the user came from and can
              route them back there after a successful login /
              register. */}
          <PathnameTracker />
          {children}
          <NewsletterFloatingPill />
          <ToastContainer />
          <GuestLoginDialog />
        </TopicsProvider>
      </body>
    </html>
  );
}
