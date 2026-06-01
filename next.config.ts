import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    deviceSizes: [480, 768, 1024],
    imageSizes: [64, 128, 256],
    formats: ["image/webp"],
    minimumCacheTTL: 86400,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
