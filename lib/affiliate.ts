// Amazon Associates affiliate links. Single source of truth for the product search
// query behind each cost-breakdown line item. NEXT_PUBLIC_AMAZON_TAG is optional:
// without it, links still point at a real, working Amazon search (no commission is
// earned, but nothing is fake or broken). Set the tag in Vercel to start earning.
import type { CostKind, Decking } from "./cost";

export const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "";

const DECKING_QUERY: Record<Decking, string> = {
  pt: "pressure treated decking boards",
  cedar: "cedar decking boards",
  composite: "composite decking boards",
  hardwood: "ipe hardwood decking boards",
};

const KIND_QUERY: Partial<Record<CostKind, string>> = {
  substructure: "deck joist hangers framing hardware",
  footings: "concrete mix 80 lb bags",
  railing: "deck railing kit",
  stairs: "deck stair stringers",
};

// Returns the product-search query for a cost-breakdown line item, or null when
// there's nothing sensible to sell against it (e.g. the permit/misc allowance).
export function affiliateQuery(kind: CostKind, decking?: Decking): string | null {
  if (kind === "decking") return decking ? DECKING_QUERY[decking] : null;
  return KIND_QUERY[kind] ?? null;
}

export function amazonSearchUrl(query: string): string {
  const url = new URL("https://www.amazon.com/s");
  url.searchParams.set("k", query);
  if (AMAZON_TAG) url.searchParams.set("tag", AMAZON_TAG);
  return url.toString();
}
