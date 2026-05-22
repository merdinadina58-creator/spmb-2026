import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
