import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NewsletterFloatingPill } from "@/components/NewsletterFloatingPill";
import { ToastContainer } from "@/components/Toast";
import { GuestLoginDialog } from "@/components/GuestLoginDialog";
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
    "Rangkuman bisnis & ekonomi Indonesia dari 64 sumber, dikurasi AI. Saham, bisnis, ekonomi, kebijakan — intinya aja.",
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
      "Rangkuman bisnis & ekonomi Indonesia dari 64 sumber, dikurasi AI.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Rangkuman",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rangkuman — Baca lebih sedikit, tahu lebih banyak",
    description:
      "Rangkuman bisnis & ekonomi Indonesia dari 64 sumber, dikurasi AI.",
    images: ["/og-default.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
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
                var t = localStorage.getItem('beritainvestor:theme');
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
        {children}
        <NewsletterFloatingPill />
        <ToastContainer />
        <GuestLoginDialog />
      </body>
    </html>
  );
}
