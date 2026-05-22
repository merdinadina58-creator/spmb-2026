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
    "preview-chat-13a71920-a2c5-41a3-b08d-6c5eb3cd3b30.space-z.ai",
  ],
  // Disable image optimization to remove sharp dependency (saves ~33MB)
  images: {
    unoptimized: true,
  },
  // Optimize package imports for smaller bundle
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-icons",
    ],
  },
};

export default nextConfig;
