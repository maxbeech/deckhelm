import * as Sentry from "@sentry/nextjs";
import { sharedSentryOptions } from "@/lib/sentry-options";

/**
 * Browser error reporting. The feedback integration backs the "Send feedback"
 * control in the header and footer, so a report from a person lands in the same
 * Sentry project as the exceptions from the code.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const shared = sharedSentryOptions();

if (dsn) {
  Sentry.init({
    dsn,
    ...shared,
    // Requests go through our own tunnel route (next.config.ts). Required, not
    // cosmetic: a feedback report with a screenshot is sent as a raw ArrayBuffer
    // with NO Content-Type, and the tunnel then receives an empty body and the
    // submit silently fails. See getsentry/sentry-javascript#16112.
    transportOptions: { headers: { "content-type": "application/x-sentry-envelope" } },
    integrations: [
      ...shared.integrations,
      Sentry.feedbackIntegration({
        colorScheme: "light",
        // Opened by our own control; no floating Sentry button over the page.
        autoInject: false,
        showBranding: false,
        formTitle: "Send feedback",
        submitButtonLabel: "Send feedback",
        messagePlaceholder: "A bug, an idea, anything that's on your mind.",
        successMessageText: "Thanks, that has gone straight to us.",
      }),
    ],
  });
} else {
  console.warn("[sentry] NEXT_PUBLIC_SENTRY_DSN is not set: browser errors and feedback will not be reported");
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
