import { withSentryConfig } from "@sentry/nextjs";
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

/**
 * Sentry wraps the build to upload source maps (skipped without an auth token,
 * so `npm run build` still works unconfigured) and routes browser requests via
 * our own domain. `tunnelRoute: true` picks a random path per build, because a
 * fixed "/monitoring" is on ad-blocker lists.
 */
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "maxed-labs",
  project: process.env.SENTRY_PROJECT || "deckhelm_web",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
});
