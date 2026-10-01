// Server-only. DeckHelm has no accounts, so the buyer's internal id is their
// paid Stripe checkout session id. GA only ever receives its truncated hash
// (oh_user_ref), never the session id itself.
import { userRefFor } from "./openhelm-analytics-mp";
import { isValidProToken, sessionIdFromToken } from "./pro";

/** oh_user_ref for the buyer behind a Pro cookie, or null when it is not valid. */
export async function buyerRefFromToken(token?: string | null): Promise<string | null> {
  if (!isValidProToken(token)) return null;
  const sessionId = sessionIdFromToken(token);
  return sessionId ? userRefFor(sessionId) : null;
}
