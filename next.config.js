/** @type {import('next').NextConfig} */
// Note: `output: "export"` is intentionally NOT set. The stock detail
// page (/stock/[kode]) renders dynamically based on the URL param and
// degrades gracefully for unknown tickers, which requires request-time
// rendering — incompatible with static export.
const nextConfig = {
  images: { unoptimized: true },
  reactStrictMode: true,
  trailingSlash: true,
};

export default nextConfig;
