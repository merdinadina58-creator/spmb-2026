import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

// Force override DATABASE_URL from .env (system env may have old SQLite URL)
dotenv.config({ path: path.resolve(process.cwd(), ".env"), override: true });

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
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
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
