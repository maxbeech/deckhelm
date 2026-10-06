"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

// Segment boundary: a render error in any page keeps the header and footer and
// is reported as a Sentry Issue before the fallback shows.
export default function SegmentError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-3 text-ink-soft">That one is on us, and we have been told. Please try again.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={reset} className="border border-ink bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-rust hover:border-rust">
          Try again
        </button>
        <Link href="/" className="border border-ink px-5 py-2.5 text-sm font-medium text-ink hover:bg-ink hover:text-paper">
          Back to the calculator
        </Link>
      </div>
    </div>
  );
}
