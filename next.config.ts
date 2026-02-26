import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "export",
  reactCompiler: true,
  outputFileTracingRoot: path.join(__dirname),
  images: {
    unoptimized: true,
    formats: ["image/webp"],
    deviceSizes: [640, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
};

export default nextConfig;
