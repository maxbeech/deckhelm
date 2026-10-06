// Server-only helpers for the Pro permit-plan flow. A purchase is verified
// against the real Stripe checkout session; access is then carried by a signed,
// httpOnly cookie so the buyer keeps lifetime access to the Plan Studio without
// re-paying. Deck inputs chosen before checkout ride along in session metadata
// so the plan can pre-load the exact deck the buyer sized.
import { createHmac, timingSafeEqual } from "node:crypto";
import { captureServerError, captureServerMessage } from "@/lib/observability";
import type { DeckInputs } from "./deck";

export const PRO_COOKIE = "dh_pro";
export const DECK_COOKIE = "dh_deck";

function secret(): string {
  return process.env.PRO_COOKIE_SECRET || process.env.STRIPE_SECRET_KEY || "deckhelm-dev-secret";
}

const TOKEN_VERSION = "v2";

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

// Access token bound to the buyer's specific paid Stripe session, so it is NOT
// a single shared credential (every buyer gets a distinct, verifiable token
// tied to their purchase). No expiry — Pro is lifetime, as advertised. The
// signature is over `version:sessionId`, so the payload can't be forged without
// the server secret.
export function proToken(sessionId: string): string {
  const payload = `${TOKEN_VERSION}:${sessionId}`;
  return `${payload}:${sign(payload)}`;
}

export function isValidProToken(token?: string | null): boolean {
  if (!token) return false;
  const cut = token.lastIndexOf(":");
  if (cut <= 0) return false;
  const payload = token.slice(0, cut);
  const sig = token.slice(cut + 1);
  if (!payload.startsWith(`${TOKEN_VERSION}:`) || payload.length <= TOKEN_VERSION.length + 1) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

// Deck inputs ↔ Stripe metadata (all values must be strings).
export function deckToMetadata(deck: Partial<DeckInputs>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(deck)) {
    if (v !== undefined && v !== null) out[`deck_${k}`] = String(v);
  }
  return out;
}

const NUM_KEYS = new Set(["width", "projection", "spacing", "heightFt", "soilBearing"]);

export function metadataToDeck(meta: Record<string, string> | null | undefined): Partial<DeckInputs> {
  if (!meta) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (!k.startsWith("deck_")) continue;
    const key = k.slice(5);
    out[key] = NUM_KEYS.has(key) ? Number(v) : v;
  }
  return out as Partial<DeckInputs>;
}

// Retrieve a Stripe Checkout Session and report whether it was actually paid.
// Uses the REST API directly (no SDK dependency), matching the checkout route.
export async function retrieveCheckoutSession(
  id: string,
): Promise<{ paid: boolean; metadata: Record<string, string> } | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !id) return null;
  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!res.ok) {
      captureServerMessage("Stripe session lookup failed", { scope: "pro.session", status: res.status });
      return null;
    }
    const session = await res.json();
    const paid = session?.payment_status === "paid" || session?.status === "complete";
    return { paid, metadata: session?.metadata ?? {} };
  } catch (err) {
    // Without this capture, a Stripe API outage looks identical to "no
    // session_id" to the caller: the buyer is bounced to a generic error page
    // and nobody is told a paying customer got stuck.
    captureServerError(err, { scope: "pro.session" });
    return null;
  }
}

// The Stripe session a valid Pro token was minted for, or null. Only call after
// isValidProToken: it reads the payload without re-checking the signature.
export function sessionIdFromToken(token?: string | null): string | null {
  if (!isValidProToken(token)) return null;
  const payload = token!.slice(0, token!.lastIndexOf(":"));
  return payload.slice(TOKEN_VERSION.length + 1);
}
