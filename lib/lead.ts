// Pure validation + email-rendering for the contractor lead form. Kept separate
// from app/api/lead/route.ts so it's testable without the Next.js request runtime.
export interface LeadInput {
  name: string; email: string; phone: string; zip: string; state: string;
  projectType: string; budget: string; timeline: string; details: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function isHoneypotFilled(body: Record<string, unknown>): boolean {
  return str(body.company) !== "";
}

export function parseLead(body: Record<string, unknown>): LeadInput {
  return {
    name: str(body.name), email: str(body.email), phone: str(body.phone),
    zip: str(body.zip), state: str(body.state), projectType: str(body.projectType),
    budget: str(body.budget), timeline: str(body.timeline), details: str(body.details),
  };
}

// Returns an error message, or null when the lead is valid.
export function validateLead(lead: LeadInput): string | null {
  if (!lead.name || lead.name.length > 200) return "Enter your name.";
  if (!EMAIL_RE.test(lead.email) || lead.email.length > 320) return "Enter a valid email.";
  if (!lead.zip || lead.zip.length > 20) return "Enter your ZIP code.";
  if (!lead.projectType) return "Tell us what you need.";
  return null;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function leadEmailHtml(lead: LeadInput): string {
  return `
    <h2>New deck-builder lead</h2>
    <p><strong>${esc(lead.name)}</strong> &lt;${esc(lead.email)}&gt;${lead.phone ? ` · ${esc(lead.phone)}` : ""}</p>
    <p>${esc(lead.zip)}${lead.state ? `, ${esc(lead.state)}` : ""}</p>
    <p><strong>Project:</strong> ${esc(lead.projectType)}</p>
    ${lead.budget ? `<p><strong>Budget:</strong> ${esc(lead.budget)}</p>` : ""}
    ${lead.timeline ? `<p><strong>Timeline:</strong> ${esc(lead.timeline)}</p>` : ""}
    ${lead.details ? `<p><strong>Details:</strong> ${esc(lead.details)}</p>` : ""}
  `.trim();
}
