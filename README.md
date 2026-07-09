# DeckHelm

Free deck building code calculator: sizes deck **joists, beams, posts, footings and stairs**
to the real **IRC R507 / AWC DCA6** prescriptive deck code, with each US state's frost depth and a
permit-ready breakdown.

Live: https://deckhelm.com

## What it does

- **Joist & beam sizing** straight from the IRC Table R507.6 (joists) and R507.5 (beams) span
  tables, by lumber size, spacing and species (Southern Pine, Douglas Fir-Larch/Hem-Fir/SPF,
  Redwood/Cedar group). No fabricated numbers; values are transcribed from the code.
- **Footing size** from tributary post load ÷ soil bearing (IRC R507.3), and **footing depth**
  below the frost line for the chosen state (IRC R403.1.4).
- **Ledger fastener spacing** (½″ lag / through-bolt) per IRC Table R507.9.1.3.
- **Stair layout** (risers, treads, total run, landing) to IRC R311.7, **guard height** to R312.
- **Scale framing diagram** (SVG plan view of joists, beam, posts & footings).
- **Itemized cost & materials** (`lib/cost.ts`): decking by material, board/screw counts,
  substructure, footings, railing, stairs, permit, ranging from DIY-material to contractor-installed.
- **Full span tables** (joist R507.6 × 3 species, beam R507.5) rendered from the same data the
  engine uses (single source of truth), and a **/methodology** page citing every code source.

## SEO surface

- Per-calculator pages: deck joist span, deck beam span, deck footing, deck stair, deck cost.
- Per-state deck-code pages (50 states) with local frost depth + permit guidance.
- Deck building guides (blog), sitemap, robots, JSON-LD.

## Monetisation

- **Free** calculator (the SEO wedge).
- **Affiliate commerce**: each cost-breakdown line item (`lib/affiliate.ts`) links to a real Amazon
  search for that material: decking, hardware, concrete, railing, stair stock. Works unconfigured
  (a real, untagged search); set `NEXT_PUBLIC_AMAZON_TAG` (Amazon Associates) to start earning.
- **Contractor lead-gen** (`/find-a-deck-builder`): a homeowner lead form posts to `/api/lead`,
  env-gated on `RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL` (optionally `LEAD_FROM_EMAIL`), degrades to
  a clear 503 + fallback email address when unset, never a silent drop.
- **Pro** ($29 one-time) permit-ready deck plan: Stripe checkout, env-gated
  (`STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`), degrades gracefully when unset. Payment unlocks the
  **Plan Studio** (`/plan`) — a print-ready permit submittal packet (title block, plan + elevation
  drawings, framing/footing/stair schedules, material list, code-citation appendix) generated from
  the buyer's exact deck. Access is granted only after the Stripe session is verified **paid**
  server-side (`app/api/pro/activate` → signed httpOnly cookie, `lib/pro.ts`), then held for life.

None of the above third-party keys are set in this Vercel project yet; see "Go live" below.

## Go live: required environment variables

All optional, all degrade gracefully when unset (free tools and content stay fully functional).
Set in Vercel → Project → Settings → Environment Variables:

| Variable | Used for | Notes |
|---|---|---|
| `NEXT_PUBLIC_AMAZON_TAG` | Affiliate commerce | Your Amazon Associates tracking ID, e.g. `deckhelm-20` |
| `RESEND_API_KEY` | Lead-gen email | From a [Resend](https://resend.com) account |
| `LEAD_NOTIFY_EMAIL` | Lead-gen email | Inbox that receives new homeowner leads |
| `LEAD_FROM_EMAIL` | Lead-gen email | Optional; defaults to Resend's sandbox sender until `deckhelm.com` is verified in Resend |
| `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` | Pro checkout | From a Stripe account |
| `NEXT_PUBLIC_SITE_URL` | Checkout redirects | Optional; the canonical origin for Stripe success/cancel URLs (defaults to the request origin) |
| `PRO_COOKIE_SECRET` | Pro access cookie | Optional; HMAC key for the lifetime-access cookie (falls back to `STRIPE_SECRET_KEY`) |

## Design

A "builder's spec-plate" visual system, not a default Tailwind template: warm paper/ink palette
with a burnt-orange accent (replaces the generic stone/amber defaults), a serif display face
(Fraunces) for headings paired with a technical monospace (IBM Plex Mono) for measurements and
data, sharp-edged cards instead of rounded-everything, and a faint blueprint grid on the page
background. Tokens and depth utilities live in `app/globals.css`.

Pages are composed from a small set of shared primitives (`components/ui.tsx`, single source of
truth): full-bleed tonal `Section` bands (paper / dim / deep-ink / rust-tint) give the site its
vertical rhythm, `PhotoPlate` frames self-hosted deck photography (`public/photos/`, optimised to
WebP; AVIF/WebP + 1-year cache in `next.config.ts`), and `Container`/`PageHeader`/`ButtonLink`/
`Eyebrow` keep every page consistent. A logo mark and a real mobile menu round out the shell.

## Stack

Next.js 16 (App Router) · Tailwind CSS 4 · TypeScript · tsx tests. Free calculator is pure
client-side, no database.

## Develop

```bash
npm install
npm run dev
npm test         # validates the engine against published IRC R507 span tables
npm run build
```

> Planning aid only. Local amendments vary; confirm member sizes, footing depth and connections
> with your building department before you build.
