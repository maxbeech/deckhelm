// Verifies the Pro access-token signing and the deck ↔ Stripe-metadata
// serialisation (lib/pro.ts) that gate and pre-load the permit Plan Studio.
// Run: npm test
import { proToken, isValidProToken, deckToMetadata, metadataToDeck } from "../lib/pro.ts";
import { DEFAULT_DECK, type DeckInputs } from "../lib/deck.ts";

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.error(`  FAIL ${name} ${detail}`); }
}

// --- access token (bound to the paid Stripe session, not a shared constant) ---
const sid = "cs_test_a1b2c3";
const tok = proToken(sid);
check("proToken embeds the session id", tok.includes(sid));
check("proToken is deterministic per session", proToken(sid) === tok);
check("different sessions get different tokens", proToken("cs_test_other") !== tok);
check("valid token verifies", isValidProToken(tok));
check("empty token rejected", !isValidProToken(""));
check("undefined token rejected", !isValidProToken(undefined));
check("tampered signature rejected", !isValidProToken(tok.slice(0, -4) + "0000"));
check("forged payload rejected", !isValidProToken("v2:cs_test_forged:" + "0".repeat(64)));
check("old constant-token format rejected", !isValidProToken("0".repeat(64)));

// --- deck ↔ metadata ---
const deck: DeckInputs = { ...DEFAULT_DECK, width: 20, projection: 14, state: "texas", species: "sp", joist: "auto" };
const meta = deckToMetadata(deck);
check("metadata keys are deck_ prefixed", Object.keys(meta).every((k) => k.startsWith("deck_")));
check("metadata values are all strings", Object.values(meta).every((v) => typeof v === "string"));
check("metadata carries width as string", meta.deck_width === "20");

const round = metadataToDeck(meta);
check("round-trip width is a number", round.width === 20);
check("round-trip projection is a number", round.projection === 14);
check("round-trip soilBearing is a number", round.soilBearing === deck.soilBearing);
check("round-trip state is a string", round.state === "texas");
check("round-trip species is a string", round.species === "sp");

check("metadataToDeck ignores non-deck keys", Object.keys(metadataToDeck({ foo: "bar", deck_width: "12" })).join() === "width");
check("metadataToDeck handles null", Object.keys(metadataToDeck(null)).length === 0);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
