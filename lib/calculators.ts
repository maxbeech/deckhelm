// Programmatic per-tool calculator pages. Each renders the same deck engine with
// keyword-targeted copy and a `focus` that foregrounds the relevant result.
// Search volumes are static US Google Ads estimates as of 2026-06-14, shown for transparency.

export type Focus = "joist" | "beam" | "footing" | "stair" | "cost" | "ledger" | "railing";

export interface Calc {
  slug: string;
  name: string;
  h1: string;
  keyword: string;
  volume: string;
  meta: string;
  intro: string;
  notes: string[];
  focus: Focus;
}

export const CALCS: Calc[] = [
  {
    slug: "deck-joist-span-calculator",
    focus: "joist",
    name: "Deck Joist Span",
    h1: "Deck Joist Span Calculator (IRC R507.6)",
    keyword: "deck joist span calculator",
    volume: "2,400/mo",
    meta: "Free deck joist span calculator: find the maximum span for 2x6, 2x8, 2x10 and 2x12 joists at 12, 16 or 24 inch spacing, straight from the IRC R507.6 deck table.",
    intro:
      "How far can a deck joist span? It depends on the joist size, the on-center spacing and the lumber species. Enter your deck below and the calculator reads the maximum span straight from IRC Table R507.6, the same table your plans examiner uses.",
    notes: [
      "Spans are clear, face-of-support to face-of-support, for No. 2 grade lumber at 40 psf live + 10 psf dead load.",
      "Tighter spacing spans further: a 2x8 Southern Pine goes 13'1\" at 12\" o.c. but only 9'8\" at 24\" o.c.",
      "Joist cantilevers past the beam are limited to 1/4 of the back-span (IRC R507.6.1).",
    ],
  },
  {
    slug: "deck-beam-span-calculator",
    focus: "beam",
    name: "Deck Beam Span",
    h1: "Deck Beam Span Calculator (IRC R507.5)",
    keyword: "deck beam span calculator",
    volume: "720/mo",
    meta: "Free deck beam span calculator: how far a 2-ply or 3-ply 2x8/2x10/2x12 deck beam can span between posts, from the IRC R507.5 table, based on the joist span it carries.",
    intro:
      "A deck beam's allowable span between posts depends on the beam size and the joist span it supports. Enter your deck and the calculator pulls the maximum post spacing from IRC Table R507.5 and tells you how many posts you need.",
    notes: [
      "Beam span is driven by the supported joist span: the longer the joists, the more load on the beam, the shorter it can span.",
      "A 3-ply beam spans noticeably further than a 2-ply of the same depth, often the cheapest way to drop a post.",
      "Built-up beams must be fastened per IRC R507.5.2; a dropped beam needs post-to-beam connectors rated for uplift.",
    ],
  },
  {
    slug: "deck-footing-calculator",
    focus: "footing",
    name: "Deck Footing",
    h1: "Deck Footing Size & Depth Calculator",
    keyword: "deck footing calculator",
    volume: "1,300/mo",
    meta: "Free deck footing calculator: get the footing diameter from your post load and soil bearing, the depth below your state's frost line, and the concrete (bags) each pier needs (IRC R507.3).",
    intro:
      "Each deck post carries a tributary slice of the deck down to a footing. This calculator works out the load on each footing, the bearing area it needs over your soil, how deep it must go below the frost line in your state, and how much concrete to buy.",
    notes: [
      "Footing area = post load ÷ soil bearing. The default 1,500 psf is the IRC presumptive value for sand/silt/clay; gravel can bear far more.",
      "The footing bottom must sit below the local frost line so it can't heave. That's why a Minnesota footing is 5 ft deep and a Florida one is 12\".",
      "Concrete per pier = π × radius² × depth; an 80-lb bag of mix yields about 0.6 cubic feet. Even frost-free regions need at least 12\" to reach undisturbed soil.",
    ],
  },
  {
    slug: "deck-stair-calculator",
    focus: "stair",
    name: "Deck Stair",
    h1: "Deck Stair Calculator: Risers, Treads & Stringers",
    keyword: "deck stair calculator",
    volume: "3,600/mo",
    meta: "Free deck stair calculator: enter your deck height to get the number of risers, the exact riser height, tread run and total stair run to IRC R311.7 code.",
    intro:
      "Deck stairs have to land on a code-legal riser height and tread depth or they fail inspection. Enter your deck height and the calculator lays out the risers, treads and total run to IRC R311.7.",
    notes: [
      "Maximum riser height is 7¾\"; minimum tread depth is 10\" (IRC R311.7.5). Every riser in a flight must be within 3/8\" of the others.",
      "Stair width must be at least 36\". A graspable handrail 34–38\" high is required on stairs with four or more risers.",
      "Cut stringers are typically 2x12; check the maximum unsupported stringer span and add a mid-span support for long flights.",
    ],
  },
  {
    slug: "deck-cost-calculator",
    focus: "cost",
    name: "Deck Cost",
    h1: "Deck Cost Calculator: What Will My Deck Cost?",
    keyword: "deck cost calculator",
    volume: "1,600/mo",
    meta: "Free deck cost calculator: estimate the cost to build your deck by size and material, from a DIY lumber budget up to a contractor-installed price.",
    intro:
      "Deck cost scales with size, material and whether you DIY or hire out. Enter your deck dimensions and species for a realistic build-cost range, plus a full code-compliant framing plan so your estimate is grounded in real lumber.",
    notes: [
      "Pressure-treated pine is the cheapest framing; cedar and redwood cost more but resist rot and look better as decking.",
      "Labor is roughly half a contractor-built deck's cost. Doing your own framing is where the savings are.",
      "Footings, stairs, railings and permits add up fast; this estimate covers the structure, not built-ins or grading.",
    ],
  },
  {
    slug: "deck-material-calculator",
    focus: "cost",
    name: "Deck Material",
    h1: "Deck Material Calculator: Boards, Screws & Lumber",
    keyword: "deck material calculator",
    volume: "1,900/mo",
    meta: "Free deck material calculator: how many deck boards, screws and lineal feet of framing your deck needs, plus a material cost estimate by decking type.",
    intro:
      "Work out the materials your deck takes (deck boards, screws and framing lumber) from its size and decking type. Change the decking material to see how the board count and budget shift.",
    notes: [
      "Board count assumes 5/4×6 decking (5.5\" wide) with a 1/4\" gap and ~10% cutting waste; order full lengths to minimise seams.",
      "Composite and hardwood need hidden fasteners or pre-drilling; budget more time and a specific screw or clip system.",
      "Always order framing and decking from the same yard run so the lumber matches in moisture and size.",
    ],
  },
  {
    slug: "deck-railing-calculator",
    focus: "railing",
    name: "Deck Railing & Baluster",
    h1: "Deck Railing & Baluster Spacing Calculator",
    keyword: "baluster calculator",
    volume: "1,600/mo",
    meta: "Free deck railing & baluster spacing calculator: get the exact number of balusters and an even gap that passes the IRC 4-inch sphere rule for your railing length.",
    intro:
      "Lay out your deck railing so the baluster gaps are even AND code-legal. Enter your railing length and post spacing and the calculator solves the baluster count and the exact even gap that keeps a 4-inch sphere out (IRC R312).",
    notes: [
      "The code test is a 4\" sphere: the clear gap between balusters (and between a baluster and a post) must be under 4\". Build to 3½\" so you're never on the line at inspection.",
      "Residential deck guards must be at least 36\" tall, measured from the deck surface to the top of the rail.",
      "Even spacing = (section clear width − total baluster width) ÷ (number of gaps). The calculator does this per section so every bay matches.",
    ],
  },
];

export function getCalc(slug: string): Calc | undefined {
  return CALCS.find((c) => c.slug === slug);
}
