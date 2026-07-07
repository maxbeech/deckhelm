"use client";

import { useEffect, useState } from "react";

// Reversed rather than imported from SITE.email: importing the plain address
// into a client component would still ship it verbatim in the JS bundle even
// after a runtime transform, since bundlers inline the source string as-is.
// Keeping the address out of both the server HTML and the bundle text means
// authoring the reversed form directly here. test/monetisation.test.mts
// asserts this matches SITE.email so the two can't silently drift.
export const REVERSED_EMAIL = "moc.mlehkced@olleh";

export default function ObfuscatedEmail({ className }: { className?: string }) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Must run post-hydration, not during render: computing this eagerly
    // (even via a lazy useState initializer) would either leak the address
    // into the server-rendered HTML or mismatch between server and client
    // render output, since `window`-gated logic differs across the two.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmail(REVERSED_EMAIL.split("").reverse().join(""));
  }, []);

  if (!email) {
    return (
      <span className={className} aria-label="email address hidden, enable JavaScript to view">
        hello (at) deckhelm (dot) com
      </span>
    );
  }

  return (
    <a href={`mailto:${email}`} className={className}>
      {email}
    </a>
  );
}
