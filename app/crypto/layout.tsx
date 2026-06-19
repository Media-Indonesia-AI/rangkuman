import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crypto · Rangkuman",
  description:
    "Berita crypto & Bitcoin hari ini: BTC, ETH, SOL, dan koin top lainnya. Recap harian dari CoinDesk, The Block, Decrypt, Bloomberg, Reuters.",
  openGraph: {
    title: "Crypto · Rangkuman",
    description:
      "Recap crypto harian — Bitcoin, Ethereum, Solana, dan koin top lainnya. Dikurasi dari CoinDesk, The Block, Decrypt, Bloomberg, Reuters.",
    url: "https://rangkuman.news/crypto/",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [
      { url: "/og-default.png", width: 1200, height: 630, alt: "Crypto Rangkuman" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto · Rangkuman",
    description: "Recap crypto harian — Bitcoin, Ethereum, Solana, dan koin top lainnya.",
    images: ["/og-default.png"],
  },
};

export default function CryptoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
