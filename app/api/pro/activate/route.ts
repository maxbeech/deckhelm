import { NextResponse } from "next/server";
import { PRO_COOKIE, DECK_COOKIE, proToken, retrieveCheckoutSession } from "@/lib/pro";

// Stripe redirects here after a successful checkout. We verify the session was
// actually PAID (never trust the redirect alone), then grant lifetime Pro access
// via a signed httpOnly cookie and stash the sized deck for the Plan Studio to
// pre-load. Verification happens server-side against the Stripe API.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  const planUrl = new URL("/plan", url.origin);
  const failUrl = new URL("/pricing?checkout=error", url.origin);

  if (!sessionId) return NextResponse.redirect(failUrl);

  const session = await retrieveCheckoutSession(sessionId);
  if (!session || !session.paid) return NextResponse.redirect(failUrl);

  const res = NextResponse.redirect(planUrl);
  const oneYear = 60 * 60 * 24 * 365;
  res.cookies.set(PRO_COOKIE, proToken(sessionId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: oneYear,
  });
  // Deck metadata is small and non-sensitive; a readable cookie lets the Plan
  // Studio pre-load the buyer's deck. Bounded to avoid oversized headers.
  const deckMeta = Object.fromEntries(
    Object.entries(session.metadata).filter(([k]) => k.startsWith("deck_")),
  );
  if (Object.keys(deckMeta).length) {
    res.cookies.set(DECK_COOKIE, JSON.stringify(deckMeta).slice(0, 800), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: oneYear,
    });
  }
  return res;
}
