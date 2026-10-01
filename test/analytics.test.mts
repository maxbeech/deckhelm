// Verifies the OpenHelm Analytics boundary (lib/openhelm-analytics.tsx,
// lib/openhelm-analytics-mp.ts) and the event names this product's journey
// instrumentation actually emits (DeckCalculator, CostBreakdown, LeadForm,
// CheckoutButton, PlanStudio). Run: npm test
import { track, trackPageView, analyticsEnabled } from "../lib/openhelm-analytics.tsx";
import { buyerRefFromToken } from "../lib/analytics-ref.ts";
import { proToken, sessionIdFromToken } from "../lib/pro.ts";
import { isValidEventName, configFromEnv, sendEvents, validate, userRefFor } from "../lib/openhelm-analytics-mp.ts";

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.error(`  FAIL ${name} ${detail}`); }
}

// --- lib/openhelm-analytics.tsx (server/no-window safety) ---
// This suite runs under plain Node (tsx), so there is no `window`: both
// helpers must degrade to a safe no-op rather than throwing, exactly as they
// do server-side before hydration.
check("track() is a no-op without window", track("calculator_started") === false);
check("trackPageView() is a no-op without window", trackPageView("/") === false);
check(
  "analyticsEnabled reflects NEXT_PUBLIC_GA_MEASUREMENT_ID (unset locally)",
  analyticsEnabled === Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()),
);

// --- every event name this product's journeys emit must be a GA4-legal name ---
// (see components/DeckCalculator.tsx, CostBreakdown.tsx, LeadForm.tsx,
// CheckoutButton.tsx, PlanStudio.tsx, app/api/pro/activate/route.ts)
const JOURNEY_EVENTS = [
  "calculator_started",
  "calculator_result_viewed",
  "advanced_options_opened",
  "framing_plan_printed",
  "affiliate_link_clicked",
  "lead_form_started",
  "lead_form_submitted",
  "lead_form_submit_failed",
  "pro_checkout_started",
  "pro_checkout_redirected",
  "pro_checkout_failed",
  "purchase",
  "pro_checkout_cancelled",
  "purchase_confirmation_failed",
  "plan_studio_viewed",
];
for (const name of JOURNEY_EVENTS) {
  check(`"${name}" is a valid GA4 event name`, isValidEventName(name), name);
}
check("event names are unique (no accidental collision)", new Set(JOURNEY_EVENTS).size === JOURNEY_EVENTS.length);

// --- lib/openhelm-analytics-mp.ts (server-side / non-browser path) ---
check(
  "configFromEnv with no GA vars set is unconfigured",
  configFromEnv({}).measurementId === undefined && configFromEnv({}).apiSecret === undefined,
);

const fakeFetchOk = async () => new Response(null, { status: 204 });
const unconfigured = await sendEvents({}, [{ name: "purchase" }], fakeFetchOk);
check("sendEvents refuses to report success when not configured", unconfigured.sent === false && unconfigured.reason === "not_configured");

const configured = { measurementId: "G-TEST123", apiSecret: "secret", clientId: "123.456" };
const invalidName = await sendEvents(configured, [{ name: "not a valid name!" }], fakeFetchOk);
check("sendEvents rejects an invalid event name before sending", invalidName.sent === false && invalidName.reason === "invalid");

const ok = await sendEvents(configured, [{ name: "purchase" }], fakeFetchOk);
check("sendEvents reports success once configured and the endpoint answers 204", ok.sent === true);

const validateUnconfigured = await validate({}, [{ name: "purchase" }], fakeFetchOk);
check("validate() also refuses when not configured", validateUnconfigured.valid === false);

// --- identity: oh_user_ref is the hashed Stripe session id, never the id ---
check("userRefFor pinned test vector", await userRefFor("00000000-0000-0000-0000-000000000000") === "12b9377cbe7e5c94");
const token = proToken("cs_test_abc123");
check("sessionIdFromToken recovers the session id from a valid token", sessionIdFromToken(token) === "cs_test_abc123");
check("sessionIdFromToken rejects a tampered token", sessionIdFromToken(token.replace("abc", "abd")) === null);
const ref = await buyerRefFromToken(token);
check("buyer ref is 16 hex chars and is not the session id", /^[0-9a-f]{16}$/.test(ref ?? "") && ref === await userRefFor("cs_test_abc123"));
check("no ref without a valid token", await buyerRefFromToken("junk") === null && await buyerRefFromToken(null) === null);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
