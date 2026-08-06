/** @type {import('next').NextConfig} */
// `output: "standalone"` builds a self-contained Node.js server bundle
// in `.next/standalone/` — the Dockerfile copies only that + the few
// static asset folders, so the runtime image doesn't need node_modules
// or the full source tree.
const nextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  reactStrictMode: true,
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_BACKEND_URL || ""}/:path*`,
      },
    ];
  },
};

export default nextConfig;
