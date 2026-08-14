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
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto · Rangkuman",
    description: "Recap crypto harian — Bitcoin, Ethereum, Solana, dan koin top lainnya.",
  },
};

export default function CryptoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
