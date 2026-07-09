# DeckHelm — QA coverage matrix

Last verified: **2026-07-09**. Living document — update when flows or coverage change.

Legend: ✅ automated + verified · 🧪 unit/integration test · 👤 human/agent E2E (browser) · ⚠️ manual step required

**Comprehensive browser E2E (2026-07-09):** a self-contained Playwright harness exercised 23 checks
across all flows on a live server — homepage (desktop+mobile, hero image, no NaN), calculator edge
cases (60×40 no-prescriptive, projection>18 engineered warning, empty width, height 0), **both Pro
payments completed with a Stripe test card** (path A /pricing → unlock + lifetime revisit; path B
calculator 22×8 Minnesota → plan pre-loaded with 60″ frost depth), locked gate, lead form (submit +
graceful degradation), print media hides site chrome, mobile-menu navigation, secondary pages —
**0 console/pageerrors**. Two initially-red checks were confirmed to be test-harness artifacts
(a too-short wait during a Resend throttle; a selector miss), with the underlying flows re-verified
working. An independent Sonnet browser agent also passed the read-only flows with zero blockers.

## Free user journeys

| Flow | How it's covered | Status |
|---|---|---|
| Homepage renders (hero, bands, photos, CTAs) | Sonnet E2E browser pass; screenshots; axe | ✅ 👤 |
| Deck calculator — live recompute on every input | Browser E2E (change width/projection/species/state/advanced) | ✅ 👤 |
| Calculator engine correctness vs IRC tables | `test/deck.test.mts` (110 assertions) | 🧪 |
| Calculator invariants across full input space | `test/fuzz.test.mts` (14,589 cases, 0 bad) | 🧪 |
| Calculator boundary/edge behaviour (clamps, engineered flags, guard/stair thresholds, invalid-input fallbacks) | `test/boundary.test.mts` (21 assertions) | 🧪 |
| Per-calculator pages (joist/beam/footing/stair/cost/material/railing) | Browser E2E; ISR `revalidate=1w` | ✅ 👤 |
| Span tables render from same data as engine | Renders from `lib/deck-tables` (single source) | ✅ |
| State pages (50) — frost depth preset | Browser E2E (Texas 12″, Minnesota 60″); `generateStaticParams` | ✅ 👤 |
| Blog guides index + posts | Browser E2E; ISR `revalidate=1w` | ✅ 👤 |
| Methodology page | Browser E2E | ✅ 👤 |
| Print / save-PDF (free result) | Print CSS hides chrome; `window.print()` | ✅ |
| Mobile nav (hamburger → panel → navigate) | Browser E2E (390px) | ✅ 👤 |
| Accessibility (WCAG 2.1 A/AA) | axe-core: 8 pages × desktop+mobile = **0 serious/critical** | ✅ |
| 404 / not-found | Route returns 404 + helpful links | ✅ |
| SEO surface (sitemap, robots, JSON-LD, canonical, OG) | Present for all routes; sitemap covers calc/state/blog | ✅ |

## Revenue-generating journeys

| Flow | How it's covered | Status |
|---|---|---|
| **Pro checkout → payment → unlock** (from /pricing) | Full browser E2E with Stripe **test-mode** card 4242…: pay → `/api/pro/activate` verifies paid session → `/plan` Plan Studio unlocks (not the gate) | ✅ 👤 |
| **Pro checkout carrying the sized deck** (from calculator) | Full browser E2E: configured 24×10 Texas → paid → Plan Studio pre-loaded with that exact deck (240 ft², Texas 12″ frost) | ✅ 👤 |
| Lifetime access (revisit /plan without re-paying) | Browser E2E: fresh page, same cookie → still unlocked | ✅ 👤 |
| Access is not bypassable | `/plan` gates on a signed, per-session cookie; `LockedGate` for non-buyers | ✅ 🧪 |
| Pro access token security | `test/pro.test.mts` (19 cases): per-session binding, forged/tampered rejection | 🧪 |
| Checkout session creation (prod) | Live: POST /api/checkout → real `checkout.stripe.com` session with deck metadata | ✅ |
| Graceful degradation when Stripe unset | 503 + early-access message (never throws) | 🧪 |
| **Contractor lead-gen** (`/find-a-deck-builder`) | Lead API E2E: valid submit → 200 + **Resend email delivered**; edge cases (missing name/zip, bad email, overlong, malformed JSON, honeypot bot) all return correct JSON | ✅ 👤 |
| Lead validation + HTML-escaping | `test/monetisation.test.mts` | 🧪 |
| Graceful degradation when Resend unset | 503 + fallback email (never silent-drops) | 🧪 |
| **Affiliate commerce** (Shop materials) | Server-rendered links resolve to real `amazon.com/s?k=…` searches; untagged & graceful when no tag set | ✅ 🧪 |

## Agent-readiness (usable by AI agents)

| Aspect | Notes | Status |
|---|---|---|
| API endpoints return clear JSON | `/api/checkout`, `/api/lead`, `/api/pro/activate` — typed success/error JSON, correct HTTP codes | ✅ |
| Forms have semantic labels + `name` attributes | Lead form + calculator inputs are labelled and named | ✅ |
| Structured data (JSON-LD) | WebApplication, FAQPage, Article, BreadcrumbList, Service | ✅ |
| Deterministic, transparent engine | Pure functions; every result carries its code citation | ✅ |

## Known manual steps / limitations

- **Live-mode real payment**: proven end-to-end in Stripe **test mode** (identical code paths); a single real-money purchase on production has not been run (would incur a real $29 charge). The code is identical to the verified test-mode path.
- Cost figures are planning ranges from typical 2026 US prices (documented on-page), not quotes.
- Frost depths are typical per-state permit values; each state page instructs confirming locally.
