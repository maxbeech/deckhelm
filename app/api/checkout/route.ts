import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";
import { deckToMetadata } from "@/lib/pro";

// Base URL for Stripe redirect targets. Prefer the real request origin (so
// preview deploys and localhost work), falling back to the canonical site URL.
function originFrom(req: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  try {
    return new URL(req.url).origin;
  } catch {
    return SITE.url;
  }
}

// Stripe Checkout for the Pro permit-ready deck plan. Keys arrive as environment
// variables (STRIPE_SECRET_KEY, STRIPE_PRICE_ID). When absent, before the Stripe
// account is wired, the route degrades gracefully (503 + early-access note)
// instead of throwing, so the free calculator is never affected. The optional
// request body carries the deck the buyer sized, so the Plan Studio can
// pre-load it after payment.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_ID;
  const base = originFrom(req);

  if (!secret || !price) {
    return NextResponse.json(
      { error: "Pro deck plans are launching shortly. Email hello@deckhelm.com for early access." },
      { status: 503 },
    );
  }

  // Deck metadata is best-effort: a malformed/missing body must not block checkout.
  let deckMeta: Record<string, string> = {};
  try {
    const json = await req.json();
    if (json && typeof json.deck === "object") deckMeta = deckToMetadata(json.deck);
  } catch {
    /* no body — buyer will configure the deck in the Plan Studio */
  }

  try {
    const body = new URLSearchParams({
      "mode": "payment",
      "line_items[0][price]": price,
      "line_items[0][quantity]": "1",
      "success_url": `${base}/api/pro/activate?session_id={CHECKOUT_SESSION_ID}`,
      "cancel_url": `${base}/pricing?checkout=cancelled`,
      "allow_promotion_codes": "true",
    });
    for (const [k, v] of Object.entries(deckMeta)) body.set(`metadata[${k}]`, v);
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const session = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: session?.error?.message ?? "Stripe error" }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Could not reach Stripe." }, { status: 502 });
  }
}
