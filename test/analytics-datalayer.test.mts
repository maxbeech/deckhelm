// gtag.js ignores plain arrays in dataLayer, so identify()/track() must push
// `arguments` objects. Needs the measurement id set BEFORE the module loads,
// hence its own file. Run: npm test
let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.error(`  FAIL ${name}`); }
}

// --- identify()/track() push gtag `arguments` objects, never plain arrays ---
const dl: unknown[] = [];
Object.assign(globalThis, { window: { dataLayer: dl, location: { href: "https://x.test/" } } });
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
const fresh = await import("../lib/openhelm-analytics.tsx");
check("identify() sends oh_user_ref and oh_plan as user_properties", fresh.identify({ userRef: "12b9377cbe7e5c94", plan: "paid" }) === true
  && JSON.stringify(Array.from(dl[0] as ArrayLike<unknown>)) === JSON.stringify(["set", "user_properties", { oh_user_ref: "12b9377cbe7e5c94", oh_plan: "paid" }]));
check("track() sends the purchase event", fresh.track("purchase", { currency: "USD" }) === true
  && JSON.stringify(Array.from(dl[1] as ArrayLike<unknown>)) === JSON.stringify(["event", "purchase", { currency: "USD" }]));
check("dataLayer entries are arguments objects, not arrays", dl.every((e) => !Array.isArray(e) && Object.prototype.toString.call(e) === "[object Arguments]"));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
