import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" output only for Docker/VPS self-hosted deployment
  // Vercel handles build automatically, no need for standalone
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    ".space-z.ai",
    ".chatglm.cn",
    "localhost",
    "127.0.0.1",
  ],
  // Disable image optimization to remove sharp dependency
  images: {
    unoptimized: true,
  },
  // Optimize package imports for smaller bundle
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
    ],
  },
};

export default nextConfig;
