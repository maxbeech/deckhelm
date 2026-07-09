import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Self-hosted /public photography, optimised to AVIF/WebP on demand and
    // cached for a year (static brand imagery never changes under a given path).
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
