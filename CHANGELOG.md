# Changelog

## 2026-07-09: Premium redesign + real Pro fulfilment

A full product-quality overhaul: the site now reads like a seed-funded startup, and the Pro
purchase actually delivers a product.

### Design system (premium elevation, same "spec-plate" identity)
- New shared UI primitives in `components/ui.tsx` (single source of truth): `Section` full-bleed
  tonal bands (paper / dim / deep-ink / rust-tint), `Container`, `PageHeader`, `Eyebrow`,
  `ButtonLink`/`buttonClass`, and `PhotoPlate` (framed, shadowed `next/image`).
- Real deck photography, self-hosted and optimised to WebP in `public/photos/` (hero, timber-framing
  authority band, construction detail, lakeside, fire-pit). `next.config.ts` sets AVIF/WebP + 1yr
  cache. Sourced from Pexels (license-free).
- `app/globals.css`: depth tokens (`--shadow-plate`/`-lg`), `.photo-plate`, dark-band blueprint grid,
  deep-ink colour, print rules that hide site chrome so plans/prints come out clean.
- `components/icons.tsx`: thin line-icon set for value props / steps.
- Refactored `app/layout.tsx`: full-bleed `<main>`, logo mark (joist-and-beam SVG), primary CTA in
  the header, 4-column footer, and a real mobile menu (`components/MobileNav.tsx`).

### Pages
- **Homepage** rebuilt as a landing narrative: hero + photo + honest trust stats → live calculator →
  value props → how-it-works → dark authority/methodology band (real code citations) → calculators →
  why-build-to-code + FAQ → guides → CTA band. No fabricated testimonials.
- Every secondary page (calculators index + `[slug]`, states index + `[slug]`, blog index + `[slug]`,
  methodology, pricing, find-a-builder, 404) re-laid on the new section system with consistent
  headers, elevated cards and hover depth. `find-a-deck-builder` and `pricing` gained photo/visual
  hierarchy.

### Pro fulfilment — the revenue fix
- **Before:** `/pricing` charged $29 (live) and delivered *nothing* — success redirected to a page
  that ignored the status; no PDF existed anywhere. Copy also promised a "stamped" plan, contradicting
  the "not an engineering stamp" disclaimer.
- **Now:** a genuine deliverable. `components/PlanStudio.tsx` renders a permit-submittal packet from
  the buyer's exact deck — editable title block, plan view + new section/elevation drawing
  (`components/ElevationDiagram.tsx`), framing/footing/stair schedules, material list and a
  code-citation appendix, all print-optimised to Letter.
- Verified, non-bypassable access: `app/api/checkout` carries the sized deck in Stripe metadata and
  redirects to `app/api/pro/activate`, which retrieves the session, confirms it was **paid**, then
  grants lifetime access via a signed httpOnly cookie (`lib/pro.ts`). `app/plan` renders the Studio
  for cookie-holders (dev-only `?preview=1` bypass for testing) and a clear locked gate otherwise.
- Fixed all "stamped framing" copy → "code-referenced"; `/pricing` now describes the real packet and
  handles `?checkout=cancelled/error`.
- `components/CheckoutButton.tsx` takes an optional deck; the calculator has a "Create permit-ready
  PDF · $29" CTA that carries the current deck into checkout.
- New `test/pro.test.mts` (17 cases) covers token signing + deck↔metadata serialisation. Full suite:
  148 tests + 14,589 fuzz cases, `npm run build` and `npm run lint` clean.

## 2026-07-09: Live checkout enabled in Production

- **Stripe is now live**: created a live-mode Product (`prod_UqyRDqLbBhGbtx`) and Price
  (`price_1TrGUWLquINEUvRkKGty0M3g`, $29.00 USD one-time) via the Stripe CLI against account
  `acct_1TqZwILquINEUvRk` (confirmed `charges_enabled`/`payouts_enabled`/`details_submitted` all
  true beforehand). `STRIPE_PRICE_ID` is now set in Vercel Production, alongside the existing live
  `STRIPE_SECRET_KEY` — real customers hitting `/pricing` in production can now pay $29 for the Pro
  plan. Local dev and Preview/Development keep using the separate test-mode Product/Price so no
  real charge can ever come from a non-production environment.
- Did not execute a real test purchase (would charge an actual card); verified via
  `stripe get /v1/account` and the price/product creation responses instead.
- Resend domain `mail.deckhelm.com` confirmed verified by the user directly in their dashboard
  (the send-only API key still can't be used to check this programmatically — see 2026-07-07 entry).

## 2026-07-07: Live services wired up + scraper-resistant email

- **Resend + Stripe wired up**: `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL`, `LEAD_FROM_EMAIL` (sending
  domain `mail.deckhelm.com`), and `STRIPE_SECRET_KEY` (live in Production, test in Preview/
  Development) are now set in Vercel and in local `.env.local` (gitignored, never committed).
- **Stripe checkout enabled in test mode**: created a test-mode Product (`prod_UqGvCevA4Qlvho`)
  and Price (`price_1TqaNTLT1iVyVaO3fMzPLkj6`, $29.00 USD one-time, matching the Pro plan on
  `/pricing`) via the Stripe CLI. `STRIPE_PRICE_ID` is set in Preview/Development only — Production
  still has no price ID, so live checkout stays in "coming soon" mode until a live-mode Product/
  Price is created and approved. End-to-end verified in a real browser: clicking "Get my
  permit-ready deck plan" redirects to a live Stripe Checkout session for the correct product/amount.
- Resend domain status for `mail.deckhelm.com` could not be verified: the API key provided is
  send-only and Resend rejects domain-management calls from it (`resend-cli domains list` / `doctor`
  confirm this). A full-access key is needed to check or complete domain verification.
- **Obfuscated public email** (`components/ObfuscatedEmail.tsx`): `hello@deckhelm.com` no longer
  appears as plaintext in server-rendered HTML or the client JS bundle on `/pricing` and
  `/find-a-deck-builder`. The address is stored reversed and only decoded client-side, post-hydration,
  via `useEffect`; a `(at)/(dot)` fallback covers no-JS visitors. `test/monetisation.test.mts` asserts
  the reversed constant still matches `SITE.email` so the two can't silently drift.

## 2026-07-06: Rebrand to DeckHelm

- Renamed the product from DeckCalc HQ to **DeckHelm** (`deckhelm.com`) across `lib/site.ts`
  (single source of truth for name/domain/url), `package.json`, header/footer/OG image, all
  metadata descriptions, contact email references (`hello@deckhelm.com`), and docs (README,
  changelog, SEO content plan).
- Renamed the GitHub repository and Vercel project from `deckcalchq` to `deckhelm`, updated the
  `origin` git remote, and renamed the local project folder to match.

## 2026-07-06: Premium redesign, AI-voice cleanup, and a real code-compliance bug fix

- **Joist count fix** (`lib/deck.ts`): the joist-count formula used `Math.floor`, which under-provided
  joists for any deck width that wasn't an exact multiple of the spacing, so the actual on-center
  spacing exceeded the code table's value the span was checked against (e.g. a 13 ft-wide deck at
  16" o.c. got 17.33" actual spacing instead of ≤16"). Switched to `Math.ceil`; added a regression
  test in `test/deck.test.mts` covering six non-exact widths.
- **Input-validation guard** for `species`/`spacing` in `computeDeck` (previously unvalidated, unlike
  every other field), and a clamp on `RailingInputs.postWidthIn` (previously used unclamped).
- **Exposed rail post width** in `RailingCalculator.tsx`: the engine already accepted a configurable
  post width but the UI had no field for it, silently pinning every layout to a 4×4 post.
- **Controlled-input display bug**: clearing the width/projection/soil-bearing fields showed a
  literal "0" while `computeDeck` silently clamped the value elsewhere, so the input box and the
  visible results disagreed. Inputs now display blank instead of a misleading 0 mid-edit.
- **Found and fixed a real whitespace-eating bug**: in this Next.js/Turbopack version, any JSX text
  node that starts immediately after a tag or `{expression}` loses its leading space if that same
  text node also contains an HTML entity (`&apos;`, `&quot;`, `&amp;`) anywhere within it (e.g.
  `{s.name} Deck Code` rendered as `New YorkDeck Code` on all 50 state pages; the homepage hero read
  "deck codein seconds"). Root-caused via a scratch test route, then removed HTML entities from JSX
  text sitewide in favor of literal `'`/`"`/`&` (valid and correctly rendered by React), and relaxed
  `react/no-unescaped-entities` in `eslint.config.mjs` to only flag `>` and `}` (the two that are
  genuinely ambiguous in JSX), so the fix doesn't get silently reverted by `npm run lint`.
- **Full visual redesign** off the generic default-Tailwind look (stone/amber palette, Arial body
  font, rounded-xl everywhere, shadow-sm cards) into a distinct "builder's spec-plate" identity: warm
  paper/ink color tokens with a burnt-orange accent, a serif display face (Fraunces) for headings, a
  technical monospace (IBM Plex Mono) for measurements/data/nav, sharp-edged cards, and a faint
  blueprint grid on the page background. New tokens live in `app/globals.css`; applied across every
  page and component.
- **Copy pass**: removed every em dash sitewide (128 instances across code comments and user-facing
  copy, including all 11 blog posts in `lib/posts.ts`) in favor of varied punctuation, and dropped an
  unsubstantiated "licensed" contractor claim from `/find-a-deck-builder` (the lead-gen network has
  no verification mechanism; same reasoning as the earlier removal of "vetted").
- Reworded a `lib/calculators.ts` comment that called static, typed-in-once search-volume strings
  "live" data.

## 2026-06-30: Affiliate commerce + contractor lead-gen

- Added `kind` to `CostItem` (`lib/cost.ts`) so cost-breakdown line items can be mapped to a
  product category without parsing label strings.
- New `lib/affiliate.ts`: single source of truth for Amazon search-link generation per cost item.
  Env-gated on `NEXT_PUBLIC_AMAZON_TAG`; produces a real, working Amazon search even when unset
  (just untagged, no fake/placeholder links).
- `CostBreakdown.tsx` now shows a "Shop materials ↗" link per relevant line item, an FTC affiliate
  disclosure (shown only when a tag is actually configured), and a CTA to `/find-a-deck-builder`.
- New `lib/lead.ts`: pure validation + HTML-rendering for the contractor lead form, independent of
  the Next.js request runtime so it's directly unit-testable.
- New `app/api/lead/route.ts`: homeowner lead capture, sends via the Resend REST API
  (`RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL`, optional `LEAD_FROM_EMAIL`). Mirrors the existing Stripe
  checkout route's graceful-degradation pattern: explicit 503 + fallback email when unconfigured,
  never a silent drop. Includes server-side validation and a honeypot anti-spam field.
- New `components/LeadForm.tsx` + `app/find-a-deck-builder/page.tsx`: homeowner-facing lead form,
  ISR `revalidate = 604800` (1 week), JSON-LD (`Service` + `FAQPage`), honest copy (no fabricated
  contractor counts or reviews).
- Wired into navigation (header/footer), `/pricing` (new "hire it out" CTA, contractor-recruitment
  blurb softened, dropping the unsubstantiated "vetted" claim), and `app/sitemap.ts`.
- Fixed a pre-existing rendering bug in `/methodology` (`42\")` rendered a literal backslash instead
  of a quote mark, now `42")`), which also cleared the only `npm run lint` failure.
- New `test/monetisation.test.mts`: covers affiliate query/URL generation and lead validation
  (required fields, email format, honeypot, HTML-escaping of user input). Wired into `npm test`.

No third-party keys (`NEXT_PUBLIC_AMAZON_TAG`, `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL`,
`STRIPE_SECRET_KEY`) are set in the Vercel project yet; see README "Go live" section.

## 2026-06-14 to 2026-06-29: Initial build

See git log for the calculator engine, span tables, state pages, blog and Pro checkout scaffold
built before this changelog was introduced.
