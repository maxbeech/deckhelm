import type { Breadcrumb, ErrorEvent, Event, Log } from "@sentry/nextjs";

/**
 * The one scrubber for everything DeckHelm sends to Sentry: error events, logs,
 * breadcrumbs, and transactions/spans. Visitors enter emails, phone numbers and
 * (via Stripe) payment sessions, and none of it is ours to ship to a third party.
 */

const REDACTED = "[redacted]";

// Keys whose values never leave the process, matched as case-insensitive substrings.
const SENSITIVE_KEY =
  /(pass(word|wd)?|secret|token|authorization|auth_?header|cookie|api[-_]?key|private[-_]?key|access[-_]?key|signature|credential|dsn|session|email|phone|bearer|jwt)|(^|[-_.])key$/i;

// Patterns that betray a secret or PII inside free text.
const STRING_RULES: [RegExp, string][] = [
  [/\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi, "Bearer [redacted]"],
  [/\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]*/g, REDACTED], // JWT
  [/\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{6,}/g, REDACTED], // Stripe
  [/\b(?:sk|pk|rk)_[A-Za-z0-9]{12,}/g, REDACTED],
  [/\bwhsec_[A-Za-z0-9]{6,}/g, REDACTED],
  [/\bhlm_sk_[A-Za-z0-9_-]{6,}/g, REDACTED], // Helm7
  [/\bsntry[su]_[A-Za-z0-9_+/=-]{6,}/g, REDACTED], // Sentry auth tokens
  [/\bre_[A-Za-z0-9_]{16,}/g, REDACTED], // Resend
  [/\bgh[pousr]_[A-Za-z0-9]{20,}/g, REDACTED], // GitHub
  [/\bxox[abprs]-[A-Za-z0-9-]{10,}/g, REDACTED], // Slack
  [/\bAKIA[0-9A-Z]{16}\b/g, REDACTED], // AWS
  [/https?:\/\/[^\s@/]+:[^\s@/]+@/g, "https://[redacted]@"], // credentials in a URL
  // key=value / "key":"value" pairs for sensitive-looking keys.
  [
    /(["']?\b[\w-]*(?:pass(?:word|wd)?|secret|token|authorization|api[-_]?key|private[-_]?key|access[-_]?key|signature|credential|cookie|session[-_]?id)[\w-]*["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;&}\]]+)/gi,
    "$1[redacted]",
  ],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, REDACTED], // email
  [/(?<![\w.])\+?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}(?![\w.])/g, REDACTED], // phone
];

/** Drop the query string and fragment from a URL or path. */
export function stripQuery(url: string): string {
  return url.split(/[?#]/)[0];
}

/** Redact secrets and PII inside free text. Serialised JSON is parsed and scrubbed structurally. */
export function scrubString(input: string): string {
  const t = input.trim();
  if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))) {
    try {
      return JSON.stringify(scrubValue(JSON.parse(t)));
    } catch {
      /* not JSON, fall through to the pattern rules */
    }
  }
  return STRING_RULES.reduce((s, [re, rep]) => s.replace(re, rep), input);
}

/** Recursively redact sensitive values, preserving structure for debugging. */
export function scrubValue(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (typeof value === "string") return scrubString(value);
  if (typeof value !== "object") return value;
  if (depth > 8) return REDACTED;
  if (Array.isArray(value)) return value.map((v) => scrubValue(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SENSITIVE_KEY.test(k) ? REDACTED : scrubValue(v, depth + 1);
  }
  return out;
}

const URL_KEYS = new Set(["url", "to", "from", "http.url", "url.full", "http.target", "url.path", "request.url"]);
const QUERY_KEYS = new Set(["http.query", "url.query", "http.fragment", "url.fragment", "query_string", "query"]);

/** scrubValue plus: strip query strings from url-ish keys and drop query-ish keys. */
function scrubData(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (QUERY_KEYS.has(k)) continue;
    if (URL_KEYS.has(k) && typeof v === "string") out[k] = scrubString(stripQuery(v));
    else out[k] = SENSITIVE_KEY.test(k) ? REDACTED : scrubValue(v);
  }
  return out;
}

/** Sentry `beforeBreadcrumb`: message and data scrubbed, query strings stripped from urls. */
export function scrubBreadcrumb(b: Breadcrumb): Breadcrumb {
  return {
    ...b,
    ...(typeof b.message === "string" ? { message: scrubString(b.message) } : {}),
    ...(b.data ? { data: scrubData(b.data) } : {}),
  };
}

/** Sentry `beforeSendLog`: message and attributes. */
export function scrubLog(log: Log): Log {
  const message = typeof log.message === "string" ? scrubString(log.message) : log.message;
  const attributes = log.attributes ? (scrubValue(log.attributes) as Log["attributes"]) : log.attributes;
  return { ...log, message, attributes };
}

function scrubRequest(event: Event) {
  const req = event.request;
  if (!req) return;
  if (req.url) req.url = scrubString(stripQuery(req.url));
  delete req.cookies;
  req.query_string = undefined;
  if (req.headers) req.headers = scrubValue(req.headers) as Record<string, string>;
  if (req.data) req.data = scrubValue(req.data);
}

/** Sentry `beforeSend` for error events. Feedback items are left intact: the person chose to send them. */
export function scrubEvent(event: ErrorEvent): ErrorEvent | null {
  scrubRequest(event);
  if (event.message) event.message = scrubString(event.message);
  if (event.logentry?.message) event.logentry.message = scrubString(event.logentry.message);
  for (const ex of event.exception?.values ?? []) {
    if (typeof ex.value === "string") ex.value = scrubString(ex.value);
  }
  if (event.extra) event.extra = scrubValue(event.extra) as Record<string, unknown>;
  if (event.contexts) event.contexts = scrubValue(event.contexts) as typeof event.contexts;
  if (event.breadcrumbs) event.breadcrumbs = event.breadcrumbs.map(scrubBreadcrumb);
  if (event.user) event.user = scrubValue(event.user) as typeof event.user;
  if (event.transaction) event.transaction = stripQuery(event.transaction);
  return event;
}

/** Sentry `beforeSendTransaction`: request url, transaction name and span urls/data. */
export function scrubTransaction<T extends Event>(event: T): T | null {
  scrubRequest(event);
  if (event.transaction) event.transaction = stripQuery(event.transaction);
  if (event.extra) event.extra = scrubValue(event.extra) as Record<string, unknown>;
  if (event.contexts) event.contexts = scrubValue(event.contexts) as typeof event.contexts;
  if (event.breadcrumbs) event.breadcrumbs = event.breadcrumbs.map(scrubBreadcrumb);
  const clean = (span: { description?: string; data?: Record<string, unknown> }) => {
    if (span.description) span.description = scrubString(span.description.replace(/\?[^\s]*/g, ""));
    if (span.data) span.data = scrubData(span.data);
  };
  clean((event.contexts?.trace ?? {}) as Parameters<typeof clean>[0]);
  for (const span of event.spans ?? []) clean(span as never);
  return event;
}
