import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NewsletterFloatingPill } from "@/components/NewsletterFloatingPill";
import { PathnameTracker } from "@/components/PathnameTracker";
import { ToastContainer } from "@/components/Toast";
import { GuestLoginDialog } from "@/components/GuestLoginDialog";
import { TopTickerRouter } from "@/components/TopTickerRouter";
import { BfcacheRecovery } from "@/components/BfcacheRecovery";
import { TopicsProvider } from "@/components/topics-provider";
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
    // Single favicon — `/biru.svg`. The browser tab does not reliably
    // flip on theme changes (the favicon is loaded outside the React
    // tree and is cached on first paint by the browser/OS), so we
    // commit to one variant for the tab and reserve theme-awareness
    // for the in-page `Logo` component.
    icon: [{ url: "/biru.svg", type: "image/svg+xml" }],
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
          <TopTickerRouter />
          <BfcacheRecovery />
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
