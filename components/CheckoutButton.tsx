"use client";

import { useState } from "react";
import type { DeckInputs } from "@/lib/deck";
import { buttonClass } from "@/components/ui";

// Starts Stripe Checkout for the Pro permit plan. An optional `deck` is sent so
// the Plan Studio can pre-load the exact deck the buyer sized. Degrades to a
// clear message when checkout is unavailable (keys unset / network error).
export default function CheckoutButton({
  deck, label = "Get my permit-ready deck plan", variant = "primary", className = "",
}: {
  deck?: DeckInputs; label?: string; variant?: "primary" | "onDark"; className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deck ? { deck } : {}),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setMsg(data.error ?? "Checkout is not available yet. Please check back soon.");
    } catch {
      setMsg("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={start} disabled={loading} className={buttonClass(variant, `w-full ${className}`)}>
        {loading ? "Starting…" : label}
      </button>
      {msg && <p className="mt-2 text-center text-xs text-ink-soft">{msg}</p>}
    </div>
  );
}
