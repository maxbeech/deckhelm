import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // This guide was never published with complete editorial metadata. A
        // close, substantive ledger guide is a better destination than a 404.
        source: "/blog/deck-ledger-flashing-guide",
        destination: "/blog/deck-ledger-board-attachment",
        permanent: true,
      },
    ];
  },
  images: {
    // Self-hosted /public photography, optimised to AVIF/WebP on demand and
    // cached for a year (static brand imagery never changes under a given path).
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
