import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
