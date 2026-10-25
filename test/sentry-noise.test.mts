/* eslint-disable @typescript-eslint/no-explicit-any */
// Scanner probes and injected-bridge rejections stay out of Sentry. Run: npm test
import { hasRealActionId, isScannerProbeHeaders, rejectExploitProbe } from "../lib/scanner-probe.ts";
import { isInjectedBridgeNoise, isKnownNoise, isScannerProbeEvent, withoutKnownNoise } from "../lib/sentry-noise.ts";
import { sharedSentryOptions } from "../lib/sentry-options.ts";

let fail = 0;
function check(name: string, cond: boolean) {
  if (cond) console.log(`  ok   ${name}`);
  else { fail++; console.error(`  FAIL ${name}`); }
}

const REAL_ID = "7f3a9c1e5b2d4f60a8c7e9d1b3a5f7c9e1d3b5a7f9";
const probeHeaders = { Accept: "text/x-component", "Next-Action": "cachefn", "X-Middleware-Subrequest": "src/middleware:middleware" };
const ev = (headers?: Record<string, string>, value?: string): any => ({ request: { headers }, exception: value ? { values: [{ type: "Error", value }] } : undefined });
const rsc = "Invariant: Expected RSC response, got text/plain. This is a bug in Next.js.";
const missing = "Failed to find Server Action. This request might be from an older or newer deployment.";
const bridge = "Non-Error promise rejection captured with value: Object Not Found Matching Id:2, MethodName:update, ParamCount:4";

check("exploit header flagged in any casing", isScannerProbeHeaders({ "x-middleware-subrequest": "middleware" }) && isScannerProbeHeaders(probeHeaders));
check("made-up Next-Action flagged", isScannerProbeHeaders({ "next-action": "cachefn" }) && isScannerProbeHeaders({ "Next-Action": "" }));
check("real action id and ordinary requests kept", !isScannerProbeHeaders({ "next-action": REAL_ID }) && !isScannerProbeHeaders({ accept: "text/html" }) && !isScannerProbeHeaders(undefined));
check("hasRealActionId", hasRealActionId({ "next-action": REAL_ID }) && !hasRealActionId({ "next-action": "cachefn" }) && !hasRealActionId({}));
check("proxy answer is 400 for the exploit header only", rejectExploitProbe({ headers: new Headers({ "x-middleware-subrequest": "m" }) })?.status === 400 && rejectExploitProbe({ headers: new Headers({ accept: "text/html" }) }) === null);
check("probe's RSC invariant dropped", isScannerProbeEvent(ev(probeHeaders, rsc)));
check("same invariant from an ordinary request kept", !isScannerProbeEvent(ev({ accept: "text/html" }, rsc)) && !isScannerProbeEvent(ev(undefined, rsc)));
check("missing Server Action: no real id dropped, real id kept", isScannerProbeEvent(ev({ "content-type": "multipart/form-data" }, missing)) && !isScannerProbeEvent(ev({ "next-action": REAL_ID }, missing)));
check("bridge rejection matched by shape", isInjectedBridgeNoise(ev(undefined, bridge)) && isInjectedBridgeNoise({ message: bridge } as any));
check("real rejections kept", !isInjectedBridgeNoise(ev(undefined, "Non-Error promise rejection captured with value: Object Not Found")) && !isInjectedBridgeNoise(ev(undefined, "TypeError: x is undefined")));
let ran = false;
check("wrapper drops noise before the hook runs", withoutKnownNoise((e: any) => { ran = true; return e; })(ev(probeHeaders), {}) === null && !ran && isKnownNoise(ev(undefined, bridge)));
const real = ev({ "next-action": REAL_ID });
check("wrapper passes other events through", withoutKnownNoise((e: any) => e)(real, {}) === real);
check("sharedSentryOptions.beforeSend drops a probe", (sharedSentryOptions().beforeSend as any)(ev(probeHeaders, rsc), {}) === null);
check("sharedSentryOptions.beforeSend still scrubs an ordinary event", !String(((sharedSentryOptions().beforeSend as any)({ message: "failed for jane@example.com" }, {}) as any).message).includes("jane@example.com"));

if (fail) { console.error(`${fail} failed`); process.exit(1); }
