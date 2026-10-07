/* eslint-disable @typescript-eslint/no-explicit-any */
// Sentry scrubbing, shared options, capture helper and feedback control. Run: npm test
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { scrubString, scrubValue, scrubEvent, scrubLog, scrubBreadcrumb, scrubTransaction, stripQuery } from "../lib/scrub.ts";
import { sharedSentryOptions } from "../lib/sentry-options.ts";
import { captureServerError, captureServerMessage, safeContext } from "../lib/observability.ts";
import { FeedbackButton } from "../components/FeedbackButton.tsx";

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.error(`  FAIL ${name} ${detail}`); }
}

const secrets = [
  "sk_live_abcdef1234567890", "pk_test_abcdef1234567890", "whsec_abcdef123456", "hlm_sk_abcdef123456",
  "sntrys_abcdef123456", "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.c2lnbmF0dXJl", "Bearer abcdef1234567890",
  "jane.doe@example.com", "+1 415 555 0132", "(415) 555-0132", "re_abcdefgh12345678",
];
for (const s of secrets) {
  const out = scrubString(`failed for ${s} at step 3`);
  check(`scrubString redacts ${s.slice(0, 8)}…`, !out.includes(s.replace("Bearer ", "")) && !out.includes(s), out);
}
check("keeps ordinary text", scrubString("joist span 12 ft at 16 in o.c.") === "joist span 12 ft at 16 in o.c.");
check("redacts key=value pairs", !scrubString("password=hunter2&x=1").includes("hunter2"));
check("redacts JSON-in-string", !scrubString('{"password":"hunter2","ok":1}').includes("hunter2") && scrubString('{"password":"hunter2","ok":1}').includes('"ok":1'));

const obj = scrubValue({ Authorization: "Bearer x", STRIPE_SECRET_KEY: "sk_live_x", nested: { email: "a@b.co", note: "mail me at a@b.co" }, keep: "visible", arr: [{ token: "t" }] }) as any;
check("scrubValue redacts keys", obj.Authorization === "[redacted]" && obj.STRIPE_SECRET_KEY === "[redacted]" && obj.nested.email === "[redacted]" && obj.arr[0].token === "[redacted]");
check("scrubValue scrubs strings in values", !obj.nested.note.includes("a@b.co") && obj.keep === "visible");
check("stripQuery", stripQuery("https://x.com/a?b=1#c") === "https://x.com/a");

const ev: any = scrubEvent({
  request: { url: "https://x.com/plan?session_id=cs_live_1", cookies: { a: "b" }, headers: { cookie: "x", accept: "y" } },
  exception: { values: [{ type: "Error", value: "Stripe said sk_live_abcdef1234567890 for jane@example.com" }] },
  extra: { apiKey: "k", detail: "call +1 415 555 0132" },
  breadcrumbs: [{ message: "GET jane@example.com", data: { url: "/x?token=abc", to: "/y?z=1" } }],
} as any)!;
check("event url query stripped", ev.request.url === "https://x.com/plan" && !ev.request.cookies);
check("event exception scrubbed", !ev.exception.values[0].value.includes("sk_live") && !ev.exception.values[0].value.includes("jane@"));
check("event extra scrubbed", ev.extra.apiKey === "[redacted]" && !ev.extra.detail.includes("415"));
check("event breadcrumbs scrubbed", !ev.breadcrumbs[0].message.includes("jane@") && ev.breadcrumbs[0].data.url === "/x" && ev.breadcrumbs[0].data.to === "/y");

const bc = scrubBreadcrumb({ message: "token sk_live_abcdef1234567890", data: { from: "/a?b=1", password: "p" } })!;
check("breadcrumb message+data", !bc.message!.includes("sk_live") && bc.data!.from === "/a" && bc.data!.password === "[redacted]");

const tx: any = scrubTransaction({
  type: "transaction", transaction: "GET /plan?x=1",
  request: { url: "https://x.com/plan?session_id=cs_1" },
  contexts: { trace: { data: { "http.url": "https://x.com/api?k=1", "url.query": "k=1" } } },
  spans: [{ description: "GET https://x.com/api?email=a@b.co", data: { "http.url": "https://x.com/api?email=a@b.co", "url.query": "email=a@b.co", url: "/z?q=1" } }],
} as any)!;
check("transaction request url + name", tx.request.url === "https://x.com/plan" && tx.transaction === "GET /plan");
check("transaction span data", tx.spans[0].data["http.url"] === "https://x.com/api" && !("url.query" in tx.spans[0].data) && tx.spans[0].data.url === "/z" && !tx.spans[0].description.includes("a@b.co"));
check("transaction trace data", tx.contexts.trace.data["http.url"] === "https://x.com/api" && !("url.query" in tx.contexts.trace.data));

const log: any = scrubLog({ level: "info", message: "user jane@example.com paid with sk_live_abcdef1234567890", attributes: { token: "t", note: "+1 415 555 0132" } } as any);
check("log message+attributes", !log.message.includes("jane@") && !log.message.includes("sk_live") && log.attributes.token === "[redacted]" && !log.attributes.note.includes("415"));

const opts: any = sharedSentryOptions();
check("shared options wire every scrubber and logs", opts.enableLogs === true && opts.beforeSend === scrubEvent && opts.beforeSendLog === scrubLog && opts.beforeSendTransaction === scrubTransaction && opts.beforeBreadcrumb === scrubBreadcrumb && opts.sendDefaultPii === false);
check("console forwarding integration present", opts.integrations.some((i: any) => /console/i.test(i.name)));

// Capture helper degrades to a console line without a DSN, never throws.
delete process.env.SENTRY_DSN; delete process.env.NEXT_PUBLIC_SENTRY_DSN;
const seen: string[] = []; const origErr = console.error, origWarn = console.warn;
console.error = (...a: unknown[]) => { seen.push(`e:${a[0]}`); }; console.warn = (...a: unknown[]) => { seen.push(`w:${a[0]}`); };
captureServerError(new Error("boom"), { scope: "test" }); captureServerMessage("hmm", { scope: "test" });
console.error = origErr; console.warn = origWarn;
check("capture helper falls back visibly without a DSN", seen.includes("e:[test]") && seen.includes("w:[test]"), seen.join(","));

// Fail closed: a scrubber that throws drops the item, never sends it raw.
const hostile: any = { get message() { throw new Error("boom"); } };
const boom = { get data() { throw new Error("boom"); } } as any;
check("throwing beforeSend drops event", scrubEvent({ request: { get url() { throw new Error("x"); } } } as any) === null);
check("throwing beforeSendTransaction drops event", scrubTransaction({ type: "transaction", get request() { throw new Error("x"); } } as any) === null);
check("throwing beforeSendLog drops log", scrubLog(hostile) === null);
check("throwing beforeBreadcrumb drops breadcrumb", scrubBreadcrumb(boom) === null);

// Long adversarial strings: truncated, and finish quickly.
const t0 = Date.now();
const evil = ["a".repeat(200_000) + "@", "1".repeat(200_000), "password" + "-".repeat(200_000), "a@".repeat(100_000), "eyJ" + "a".repeat(200_000), "x.".repeat(100_000) + "@"];
const outs = evil.map((e) => scrubString(e));
check("adversarial strings are truncated and fast", Date.now() - t0 < 2000 && outs.every((o) => o.length <= 10_100), `${Date.now() - t0}ms`);
check("secret past the cut is not shipped", !scrubString("x".repeat(20_000) + " sk_live_abcdef1234567890").includes("sk_live"));

// Feedback must not bypass the scrubber; only reporter fields survive.
const fb: any = scrubEvent({
  type: "feedback",
  contexts: { feedback: { name: "Jane", contact_email: "jane@example.com", message: "love it" }, other: { token: "t", note: "jane@example.com" } },
  user: { email: "jane@example.com" },
  request: { url: "https://x.com/a?token=1", headers: { cookie: "c" } },
  extra: { apiKey: "k" },
  tags: { who: "jane@example.com" },
  breadcrumbs: [{ message: "visited jane@example.com", data: { url: "/x?token=1" } }],
} as any)!;
check("feedback keeps reporter name/email/message", fb.contexts.feedback.contact_email === "jane@example.com" && fb.contexts.feedback.message === "love it" && fb.user.email === "jane@example.com");
check("feedback other fields still scrubbed", fb.contexts.other.token === "[redacted]" && !fb.contexts.other.note.includes("jane@") && fb.request.url === "https://x.com/a" && fb.extra.apiKey === "[redacted]" && !fb.tags.who.includes("jane@") && !fb.breadcrumbs[0].message.includes("jane@") && fb.breadcrumbs[0].data.url === "/x");

// Capture context is ids/codes/counts only.
const ctx = safeContext({ scope: "x", status: 502, ok: false, id: "cs_123", email: "jane@example.com", body: { a: 1 }, note: "free text with spaces" });
check("capture context keeps ids only", ctx.status === 502 && ctx.ok === false && ctx.id === "cs_123" && !("email" in ctx) && !("body" in ctx) && !("note" in ctx) && !("scope" in ctx));

const html = renderToString(createElement(FeedbackButton, {}));
check("feedback control renders a labelled button", html.includes("Send feedback") && html.includes("<button"));
check("footer variant renders", renderToString(createElement(FeedbackButton, { variant: "footer" })).includes("Send feedback"));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
