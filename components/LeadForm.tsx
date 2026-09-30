"use client";

import { useRef, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { US_STATES } from "@/lib/frost";
import { track } from "@/lib/openhelm-analytics";

const PROJECT_TYPES = [
  "New deck construction",
  "Deck replacement",
  "Deck repair",
  "Composite decking install",
  "Railing / guard install",
  "Other",
];
const BUDGETS = ["Under $5,000", "$5,000–$15,000", "$15,000–$30,000", "$30,000+", "Not sure yet"];
const TIMELINES = ["ASAP", "Within 1–3 months", "3–6 months", "Just researching"];

const ctl = "mt-1 w-full rounded-sm border border-line-strong bg-card px-3 py-2 text-sm text-ink focus:border-rust focus:ring-2 focus:ring-rust-line focus:outline-none";

export default function LeadForm() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  // Fires once per form: "started" means a real visitor engaged with the
  // fields, not just landed on the page (page_view already covers that).
  const startedRef = useRef(false);
  const onFieldChange = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    track("lead_form_started");
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        track("lead_form_submitted");
        setResult({ ok: true, message: "Got it. We'll be in touch about contractors in your area." });
        e.currentTarget.reset();
      } else {
        // A handled failure (validation, 503 unconfigured, upstream error), not
        // a thrown exception — still worth a low-severity Sentry breadcrumb so a
        // spike in failed submissions is visible without a user ever reporting it.
        Sentry.captureMessage(`Lead form submission rejected: ${data.error ?? "unknown"}`, "warning");
        track("lead_form_submit_failed", { reason: data.error ?? "rejected", status: res.status });
        setResult({ ok: false, message: data.error ?? "Something went wrong. Please try again." });
      }
    } catch (err) {
      Sentry.captureException(err);
      track("lead_form_submit_failed", { reason: "network_error" });
      setResult({ ok: false, message: "Could not reach the server. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="border-2 border-teal bg-teal-tint p-6 text-center">
        <div className="text-lg font-semibold text-ink">Thanks, you're on the list</div>
        <p className="mt-2 text-sm text-ink-soft">{result.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onChange={onFieldChange} className="space-y-4 rounded-sm border border-line bg-card p-6">
      {/* Honeypot: hidden from real users via CSS, bots fill every field they see in the DOM */}
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm font-medium text-ink">Name</span>
          <input required name="name" type="text" maxLength={200} className={ctl} />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-ink">Email</span>
          <input required name="email" type="email" maxLength={320} className={ctl} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm font-medium text-ink">Phone <span className="font-normal text-ink-faint">(optional)</span></span>
          <input name="phone" type="tel" maxLength={30} className={ctl} />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-ink">ZIP code</span>
          <input required name="zip" type="text" maxLength={20} className={ctl} />
        </label>
      </div>
      <label className="block">
        <span className="block text-sm font-medium text-ink">State</span>
        <select name="state" defaultValue="" className={ctl}>
          <option value="">Select a state</option>
          {US_STATES.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="block text-sm font-medium text-ink">Project</span>
        <select required name="projectType" defaultValue="" className={ctl}>
          <option value="" disabled>Select a project type</option>
          {PROJECT_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm font-medium text-ink">Budget <span className="font-normal text-ink-faint">(optional)</span></span>
          <select name="budget" defaultValue="" className={ctl}>
            <option value="">Prefer not to say</option>
            {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-ink">Timeline <span className="font-normal text-ink-faint">(optional)</span></span>
          <select name="timeline" defaultValue="" className={ctl}>
            <option value="">Not sure</option>
            {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="block text-sm font-medium text-ink">Project details <span className="font-normal text-ink-faint">(optional)</span></span>
        <textarea name="details" maxLength={2000} rows={3} className={ctl} />
      </label>

      <button type="submit" disabled={submitting}
        className="w-full rounded-sm bg-rust px-4 py-2 text-sm font-medium text-white hover:bg-rust-dark disabled:opacity-60">
        {submitting ? "Sending…" : "Get matched with a builder"}
      </button>
      {result && !result.ok && <p className="text-center text-sm text-rose-600">{result.message}</p>}
      <p className="text-center text-xs text-ink-soft">
        We'll only use your details to pass your project to deck contractors in your area. No spam.
      </p>
    </form>
  );
}
