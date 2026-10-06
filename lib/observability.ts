import * as Sentry from "@sentry/nextjs";

/**
 * The one way server code reports a problem.
 *
 * Everything funnels through here rather than calling Sentry directly so that
 * a) scope/tag conventions stay consistent across actions, routes and webhooks,
 * and b) a deployment with no DSN configured degrades to a console line instead
 * of throwing inside an error handler — an error path that can itself error is
 * how a bug becomes invisible.
 */
export function captureServerError(err: unknown, context: Record<string, unknown> = {}): void {
  const scope = typeof context.scope === "string" ? context.scope : "server";
  try {
    if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.withScope((s) => {
        s.setTag("scope", scope);
        for (const [k, v] of Object.entries(context)) {
          if (k === "scope") continue;
          s.setExtra(k, v);
        }
        s.captureException(err instanceof Error ? err : new Error(String(err)));
      });
      return;
    }
  } catch {
    // Never let reporting an error become an error.
  }
  console.error(`[${scope}]`, err, context);
}

/**
 * Report a handled failure that is not an exception — a Supabase error string,
 * a rejected upstream response — so the shape of real-world breakage shows up
 * in the same place as crashes.
 */
export function captureServerMessage(message: string, context: Record<string, unknown> = {}): void {
  const scope = typeof context.scope === "string" ? context.scope : "server";
  try {
    if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.withScope((s) => {
        s.setTag("scope", scope);
        s.setLevel("warning");
        for (const [k, v] of Object.entries(context)) {
          if (k === "scope") continue;
          s.setExtra(k, v);
        }
        s.captureMessage(message);
      });
      return;
    }
  } catch {
    /* see above */
  }
  console.warn(`[${scope}]`, message, context);
}
