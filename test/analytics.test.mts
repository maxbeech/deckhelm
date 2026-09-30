// Verifies the OpenHelm Analytics boundary (lib/openhelm-analytics.tsx,
// lib/openhelm-analytics-mp.ts) and the event names this product's journey
// instrumentation actually emits (DeckCalculator, CostBreakdown, LeadForm,
// CheckoutButton, PlanStudio). Run: npm test
import { track, trackPageView, analyticsEnabled } from "../lib/openhelm-analytics.tsx";
import { isValidEventName, configFromEnv, sendEvents, validate } from "../lib/openhelm-analytics-mp.ts";

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
  "pro_purchase_completed",
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
const unconfigured = await sendEvents({}, [{ name: "pro_purchase_completed" }], fakeFetchOk);
check("sendEvents refuses to report success when not configured", unconfigured.sent === false && unconfigured.reason === "not_configured");

const configured = { measurementId: "G-TEST123", apiSecret: "secret", clientId: "123.456" };
const invalidName = await sendEvents(configured, [{ name: "not a valid name!" }], fakeFetchOk);
check("sendEvents rejects an invalid event name before sending", invalidName.sent === false && invalidName.reason === "invalid");

const ok = await sendEvents(configured, [{ name: "pro_purchase_completed" }], fakeFetchOk);
check("sendEvents reports success once configured and the endpoint answers 204", ok.sent === true);

const validateUnconfigured = await validate({}, [{ name: "pro_purchase_completed" }], fakeFetchOk);
check("validate() also refuses when not configured", validateUnconfigured.valid === false);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
