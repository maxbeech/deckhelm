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
/** Longest string we run a regex over; anything beyond is cut first (ReDoS guard). */
export const MAX_SCRUB_CHARS = 10_000;

// Every rule below is linear-time by construction: repetition is bounded and no
// two adjacent quantifiers can match the same characters.
const STRING_RULES: [RegExp, string][] = [
  [/\bBearer\s+[A-Za-z0-9._~+/=-]{8,2000}/gi, "Bearer [redacted]"],
  [/\beyJ[A-Za-z0-9_-]{5,2000}\.[A-Za-z0-9_-]{5,2000}\.[A-Za-z0-9_-]{0,2000}/g, REDACTED], // JWT
  [/\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{6,200}/g, REDACTED], // Stripe
  [/\b(?:sk|pk|rk)_[A-Za-z0-9]{12,200}/g, REDACTED],
  [/\bwhsec_[A-Za-z0-9]{6,200}/g, REDACTED],
  [/\bhlm_sk_[A-Za-z0-9_-]{6,200}/g, REDACTED], // Helm7
  [/\bsntry[su]_[A-Za-z0-9_+/=-]{6,300}/g, REDACTED], // Sentry auth tokens
  [/\bre_[A-Za-z0-9_]{16,200}/g, REDACTED], // Resend
  [/\bgh[pousr]_[A-Za-z0-9]{20,200}/g, REDACTED], // GitHub
  [/\bxox[abprs]-[A-Za-z0-9-]{10,200}/g, REDACTED], // Slack
  [/\bAKIA[0-9A-Z]{16}\b/g, REDACTED], // AWS
  [/https?:\/\/[^\s@/:]{1,200}:[^\s@/]{1,200}@/g, "https://[redacted]@"], // credentials in a URL
  // key=value / "key":"value" pairs for sensitive-looking keys.
  [
    /(["']?\b[\w-]{0,40}(?:pass(?:word|wd)?|secret|token|authorization|api[-_]?key|private[-_]?key|access[-_]?key|signature|credential|cookie|session[-_]?id)[\w-]{0,40}["']?\s{0,3}[:=]\s{0,3})(?:"[^"]{0,500}"|'[^']{0,500}'|[^\s,;&}\]]{1,500})/gi,
    "$1[redacted]",
  ],
  [/[A-Z0-9._%+-]{1,64}@[A-Z0-9-]{1,63}(?:\.[A-Z0-9-]{1,63}){1,8}/gi, REDACTED], // email
  [/(?<![\w.])\+?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}(?![\w.])/g, REDACTED], // phone
];

/** Cut a string to the matching budget before any regex runs. */
export function truncateForScrub(s: string): string {
  return s.length > MAX_SCRUB_CHARS ? `${s.slice(0, MAX_SCRUB_CHARS)}...[truncated]` : s;
}

/** Drop the query string and fragment from a URL or path. */
export function stripQuery(url: string): string {
  const i = url.search(/[?#]/);
  return i === -1 ? url : url.slice(0, i);
}

/** Redact secrets and PII inside free text. Serialised JSON is parsed and scrubbed structurally. */
export function scrubString(raw: string): string {
  const input = truncateForScrub(raw);
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

/** Sentry `beforeBreadcrumb`: message and data scrubbed, query strings stripped. Fails closed (drops). */
export function scrubBreadcrumb(b: Breadcrumb): Breadcrumb | null {
  try {
    return {
      ...b,
      ...(typeof b.message === "string" ? { message: scrubString(b.message) } : {}),
      ...(b.data ? { data: scrubData(b.data) } : {}),
    };
  } catch {
    return null;
  }
}

/** Sentry `beforeSendLog`: message and attributes. Fails closed (drops). */
export function scrubLog(log: Log): Log | null {
  try {
    const message = typeof log.message === "string" ? scrubString(log.message) : log.message;
    const attributes = log.attributes ? (scrubValue(log.attributes) as Log["attributes"]) : log.attributes;
    return { ...log, message, attributes };
  } catch {
    return null;
  }
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

function isFeedback(event: Event): boolean {
  return (event as { type?: string }).type === "feedback" || Boolean(event.contexts?.feedback);
}

/** Request, extra, contexts, tags, user, breadcrumbs: shared by errors, feedback and transactions. */
function scrubCommon(event: Event) {
  // A feedback report is the one place a person's own name/email/message are sent on
  // purpose. Only those reporter fields are kept; everything else is scrubbed as normal.
  const feedback = isFeedback(event);
  const fbContext = feedback ? event.contexts?.feedback : undefined;
  const fbUser = feedback ? event.user : undefined;
  scrubRequest(event);
  if (event.message) event.message = scrubString(event.message);
  if (event.logentry?.message) event.logentry.message = scrubString(event.logentry.message);
  if (event.extra) event.extra = scrubValue(event.extra) as Record<string, unknown>;
  if (event.tags) event.tags = scrubValue(event.tags) as typeof event.tags;
  if (event.contexts) {
    event.contexts = scrubValue(event.contexts) as typeof event.contexts;
    if (fbContext) event.contexts.feedback = fbContext;
  }
  if (event.user) event.user = feedback ? fbUser : (scrubValue(event.user) as typeof event.user);
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((b) => scrubBreadcrumb(b)).filter((b): b is Breadcrumb => b !== null);
  }
  if (event.transaction) event.transaction = scrubString(stripQuery(event.transaction));
}

/** Sentry `beforeSend`. Feedback keeps only the reporter's contexts.feedback/user. Fails closed (drops). */
export function scrubEvent(event: ErrorEvent): ErrorEvent | null {
  try {
    scrubCommon(event);
    for (const ex of event.exception?.values ?? []) {
      if (typeof ex.value === "string") ex.value = scrubString(ex.value);
      for (const f of ex.stacktrace?.frames ?? []) {
        if (f.vars) f.vars = scrubValue(f.vars) as typeof f.vars;
      }
    }
    return event;
  } catch {
    return null;
  }
}

/** Sentry `beforeSendTransaction`: request url, transaction name and span urls/data. Fails closed (drops). */
export function scrubTransaction<T extends Event>(event: T): T | null {
  try {
    scrubCommon(event);
    const clean = (span: { description?: string; data?: Record<string, unknown> }) => {
      if (span.description) span.description = scrubString(span.description.replace(/\?[^\s]{0,2000}/g, ""));
      if (span.data) span.data = scrubData(span.data);
    };
    clean((event.contexts?.trace ?? {}) as Parameters<typeof clean>[0]);
    for (const span of event.spans ?? []) clean(span as never);
    return event;
  } catch {
    return null;
  }
}
