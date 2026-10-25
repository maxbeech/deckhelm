import type { ErrorEvent, EventHint } from "@sentry/nextjs";
import { hasRealActionId, isScannerProbeHeaders } from "@/lib/scanner-probe";

/**
 * Events that are not ours to fix, dropped before they are scrubbed or sent.
 * Kept narrow and by shape, so a real failure of the same kind still reports:
 *
 * - A scanner probe: the exploit header or a made-up `Next-Action` id (see
 *   lib/scanner-probe.ts), and "Failed to find Server Action" from a request
 *   with no real action id (a WordPress-style form post). A real id with this
 *   error is a genuine deploy-skew client and still reports.
 * - "Object Not Found Matching Id:N, MethodName:update, ParamCount:4", a
 *   rejection thrown by a native bridge injected into some in-app browsers and
 *   WebViews. It has no frame of ours.
 */

const SERVER_ACTION_MISSING = /^Failed to find Server Action\b/;
const INJECTED_BRIDGE_REJECTION = /Object Not Found Matching Id:\d+, MethodName:\w+, ParamCount:\d+/;

type Candidate = {
  request?: { headers?: unknown };
  message?: unknown;
  exception?: { values?: Array<{ value?: unknown }> };
};

function requestHeaders(event: Candidate): Record<string, unknown> | undefined {
  const headers = event.request?.headers;
  return typeof headers === "object" && headers !== null ? (headers as Record<string, unknown>) : undefined;
}

function messages(event: Candidate): string[] {
  const out: string[] = [];
  if (typeof event.message === "string") out.push(event.message);
  for (const ex of event.exception?.values ?? []) if (typeof ex.value === "string") out.push(ex.value);
  return out;
}

/** True when the event's own request is a scanner probe, so its error is the scanner's. */
export function isScannerProbeEvent(event: Candidate): boolean {
  const headers = requestHeaders(event);
  if (isScannerProbeHeaders(headers)) return true;
  return messages(event).some((m) => SERVER_ACTION_MISSING.test(m.trim())) && !hasRealActionId(headers);
}

/** True for the injected native-bridge rejection described above. */
export function isInjectedBridgeNoise(event: Candidate): boolean {
  return messages(event).some((m) => INJECTED_BRIDGE_REJECTION.test(m));
}

export function isKnownNoise(event: Candidate): boolean {
  return isScannerProbeEvent(event) || isInjectedBridgeNoise(event);
}

/** Wrap a `beforeSend` so known noise is dropped before anything else runs on it. */
export function withoutKnownNoise<R>(
  beforeSend: (event: ErrorEvent, hint: EventHint) => R,
): (event: ErrorEvent, hint: EventHint) => R | null {
  return (event, hint) => (isKnownNoise(event) ? null : beforeSend(event, hint));
}
