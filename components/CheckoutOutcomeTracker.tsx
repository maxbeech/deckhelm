"use client";

import { useEffect } from "react";
import { track } from "@/lib/openhelm-analytics";

// /pricing is where Stripe sends a buyer who cancelled (?checkout=cancelled) and
// where the activate route sends one whose paid session could not be verified
// (?checkout=error). Without these events both look like a buyer who just left.
export default function CheckoutOutcomeTracker({ outcome }: { outcome?: string }) {
  useEffect(() => {
    if (outcome === "cancelled") track("pro_checkout_cancelled");
    else if (outcome === "error") track("purchase_confirmation_failed");
  }, [outcome]);
  return null;
}
