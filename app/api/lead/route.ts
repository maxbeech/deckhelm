import { NextResponse } from "next/server";
import { isHoneypotFilled, leadEmailHtml, parseLead, validateLead } from "@/lib/lead";

// Homeowner → contractor lead capture. Mirrors the checkout route's pattern:
// env-gated on RESEND_API_KEY + LEAD_NOTIFY_EMAIL, degrades to a clear 503 instead
// of silently dropping the lead when unconfigured. LEAD_FROM_EMAIL is optional:
// Resend requires the "from" address to be on a domain verified in that account,
// so it defaults to Resend's own sandbox sender until deckhelm.com is verified.
export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.LEAD_NOTIFY_EMAIL;
  const fromEmail = process.env.LEAD_FROM_EMAIL ?? "DeckHelm Leads <onboarding@resend.dev>";

  if (!apiKey || !notifyEmail) {
    return NextResponse.json(
      { error: "Contractor matching is launching shortly. Email hello@deckhelm.com with your project details for now." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field; bots that fill every
  // field do. Pretend success so the bot doesn't learn to look elsewhere.
  if (isHoneypotFilled(body)) return NextResponse.json({ ok: true });

  const lead = parseLead(body);
  const error = validateLead(lead);
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromEmail,
        to: [notifyEmail],
        reply_to: lead.email,
        subject: `New deck lead: ${lead.name} (${lead.zip})`,
        html: leadEmailHtml(lead),
      }),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      return NextResponse.json({ error: errBody?.message ?? "Could not send your details. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not reach the lead service." }, { status: 502 });
  }
}
