# DeckHelm

Free deck building code calculator: sizes deck **joists, beams, posts, footings and stairs**
to the real **IRC R507 / AWC DCA6** prescriptive deck code, with each US state's frost depth and a
permit-ready breakdown.

Live: https://www.deckhelm.com

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
- State frost-depth calculator presets (50 states), kept available for builders but excluded from search until each can be supported by jurisdiction-level primary sources.
- Deck building guides (blog): 26 long-form posts (`lib/posts.ts`) across Academy/News/Reviews
  categories, each with a featured photo, TL;DR, one data table, one FAQ block (feeds `FAQPage`
  JSON-LD), and `BlogPosting`/`HowTo` JSON-LD, auto-generated table of contents, sitemap, robots.

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

None of the above third-party keys are required to run the site; see "Go live" below.

## Go live: required environment variables

All optional, all degrade gracefully when unset (free tools and content stay fully functional).
Set as variables on the Helm7 product (production environment):

| Variable | Used for | Notes |
|---|---|---|
| `NEXT_PUBLIC_AMAZON_TAG` | Affiliate commerce | Your Amazon Associates tracking ID, e.g. `deckhelm-20` |
| `RESEND_API_KEY` | Lead-gen email | From a [Resend](https://resend.com) account |
| `LEAD_NOTIFY_EMAIL` | Lead-gen email | Inbox that receives new homeowner leads |
| `LEAD_FROM_EMAIL` | Lead-gen email | Optional; defaults to Resend's sandbox sender until `deckhelm.com` is verified in Resend |
| `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` | Pro checkout | From a Stripe account |
| `NEXT_PUBLIC_SITE_URL` | Checkout redirects | Optional; the canonical origin for Stripe success/cancel URLs (defaults to the request origin) |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN` | Error, log and feedback reporting | Project `deckhelm_web` in the `maxed-labs` Sentry org. `SENTRY_ORG` and `SENTRY_PROJECT` are also set; `SENTRY_AUTH_TOKEN` (build only) uploads source maps |
| `PRO_COOKIE_SECRET` | Pro access cookie | Optional; HMAC key for the lifetime-access cookie (falls back to `STRIPE_SECRET_KEY`) |

## Error tracking and feedback

Sentry (`deckhelm_web`) receives exceptions, console logs and user feedback. Everything passes through the
scrubber in `lib/scrub.ts` first (emails, phone numbers, tokens and keys redacted; URL query strings
stripped; strings capped at 10k characters; if scrubbing throws the item is dropped, never sent raw; feedback keeps only the reporter's own fields). Server code reports failures with `captureServerError` from `lib/observability.ts` (context is ids, codes and counts only). The
"Send feedback" control lives in `components/FeedbackButton.tsx`. Browser traffic goes through a randomised
tunnel route so ad blockers do not drop it.

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

Hosted on Helm7 (`npm start` honours `$PORT`). Bare `deckhelm.com` redirects to `www.deckhelm.com`.

## Develop

```bash
npm install
npm run dev
npm test         # validates the engine against published IRC R507 span tables
npm run build
```

> Planning aid only. Local amendments vary; confirm member sizes, footing depth and connections
> with your building department before you build.
