/**
 * Security-scanner probes against Next.js, and the one place that recognises
 * them. Crawlers and scanners POST to any URL with `Accept: text/x-component`,
 * a made-up `Next-Action` id (for example `cachefn`) and the
 * `X-Middleware-Subrequest` header from the CVE-2025-29927 exploit. The app
 * already refuses them; Next then logs "Invariant: Expected RSC response, got
 * text/plain" for the refusal. That is the scanner's noise, not our bug: the
 * proxy answers the exploit header with a 400 and lib/sentry-noise.ts keeps the
 * probe out of Sentry.
 */

/** Real Server Action ids are long hex hashes; a probe sends a word like `cachefn`. */
const REAL_ACTION_ID = /^[0-9a-f]{32,128}$/i;

type HeaderBag = Record<string, unknown> | undefined;

function headerValue(headers: HeaderBag, name: string): string | undefined {
  if (!headers) return undefined;
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== name) continue;
    const first = Array.isArray(value) ? value[0] : value;
    return typeof first === "string" ? first : "";
  }
  return undefined;
}

/** True when the request names a Server Action id that could be a real one. */
export function hasRealActionId(headers: HeaderBag): boolean {
  const action = headerValue(headers, "next-action");
  return action !== undefined && REAL_ACTION_ID.test(action.trim());
}

/**
 * True for a request carrying the middleware-bypass exploit header (which no
 * legitimate client ever sends) or a `Next-Action` id that cannot be a real one.
 */
export function isScannerProbeHeaders(headers: HeaderBag): boolean {
  if (headerValue(headers, "x-middleware-subrequest") !== undefined) return true;
  return headerValue(headers, "next-action") !== undefined && !hasRealActionId(headers);
}

/** The proxy's answer to the exploit header: a plain 400, before any auth or page work. */
export function rejectExploitProbe(request: { headers: Headers }): Response | null {
  return request.headers.has("x-middleware-subrequest")
    ? new Response("Bad request", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } })
    : null;
}
