"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

/**
 * The one user-facing feedback control, used in the header, mobile menu and
 * footer. It opens Sentry's feedback form, so a report from a visitor lands in
 * the same Sentry project as the exceptions from the code. The SDK is imported
 * lazily so it stays out of the initial bundle.
 */
export function FeedbackButton({
  className = "",
  variant = "nav",
  onOpen,
}: {
  className?: string;
  variant?: "nav" | "footer";
  onOpen?: () => void;
}) {
  const [unavailable, setUnavailable] = useState(false);

  const open = async () => {
    onOpen?.();
    const Sentry = await import("@sentry/nextjs");
    const feedback = Sentry.getFeedback();
    if (!feedback) {
      // No DSN on this deployment: say so rather than a button that does nothing.
      setUnavailable(true);
      return;
    }
    const form = await feedback.createForm();
    form.appendToDom();
    form.open();
  };

  if (unavailable) {
    return (
      <span className={className}>
        Feedback isn&apos;t set up here. Email{" "}
        <a className="underline underline-offset-2" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </span>
    );
  }

  const base =
    variant === "footer"
      ? "text-ink-soft transition-colors hover:text-rust"
      : "inline-flex items-center gap-1.5 transition-colors hover:text-ink";

  return (
    <button type="button" onClick={open} data-testid="feedback-button" className={`${base} ${className}`}>
      {variant === "nav" && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
        </svg>
      )}
      Send feedback
    </button>
  );
}
