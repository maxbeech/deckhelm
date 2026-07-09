"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/calculators", label: "Calculators" },
  { href: "/states", label: "By state" },
  { href: "/blog", label: "Guides" },
  { href: "/find-a-deck-builder", label: "Find a builder" },
  { href: "/pricing", label: "Pricing" },
];

// Compact menu for < md screens, where the inline nav is hidden. A11y: the
// toggle exposes expanded state and the panel closes on any link tap.
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center border border-line text-ink"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-line bg-paper shadow-[var(--shadow-plate)]">
          <nav className="mx-auto flex max-w-6xl flex-col px-5 py-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-line/60 py-3 font-mono text-sm uppercase tracking-wide text-ink-soft last:border-0 hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/#calculator"
              onClick={() => setOpen(false)}
              className="mt-3 mb-3 bg-ink px-4 py-2.5 text-center font-mono text-sm uppercase tracking-wide text-paper hover:bg-rust"
            >
              Open calculator
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
