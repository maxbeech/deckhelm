// Itemized cost + materials panel, rendered from lib/cost.ts. Each line item links
// to a real Amazon search for that material (lib/affiliate.ts is the single source
// of truth for the query + tag).
import Link from "next/link";
import { affiliateQuery, amazonSearchUrl, AMAZON_TAG } from "@/lib/affiliate";
import { DECKING_LABEL, type CostResult, type Decking } from "@/lib/cost";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export default function CostBreakdown({
  cost, decking, onDecking,
}: {
  cost: CostResult; decking: Decking; onDecking: (d: Decking) => void;
}) {
  return (
    <div className="rounded-sm border border-line bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-ink">Estimated cost & materials</div>
        <select aria-label="Decking material" value={decking}
          onChange={(e) => onDecking(e.target.value as Decking)}
          className="rounded-sm border border-line-strong bg-card px-2 py-1 text-xs text-ink focus:border-rust focus:outline-none">
          {(Object.keys(DECKING_LABEL) as Decking[]).map((d) => (
            <option key={d} value={d}>{DECKING_LABEL[d]}</option>
          ))}
        </select>
      </div>
      <table className="mt-3 w-full text-sm">
        <tbody>
          {cost.items.map((it) => {
            const query = affiliateQuery(it.kind, decking);
            return (
              <tr key={it.label} className="border-t border-paper-dim">
                <td className="py-1.5 text-ink-soft">
                  {it.label}
                  <span className="block text-xs text-ink-soft">
                    {it.detail}
                    {query && (
                      <>
                        {" · "}
                        <a href={amazonSearchUrl(query)} target="_blank" rel="noopener noreferrer sponsored"
                          className="text-rust underline hover:text-rust-dark">
                          Shop materials ↗
                        </a>
                      </>
                    )}
                  </span>
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums text-ink-soft">{money(it.low)}–{money(it.high)}</td>
              </tr>
            );
          })}
          <tr className="border-t-2 border-line">
            <td className="py-2 font-semibold text-ink">Total estimate</td>
            <td className="py-2 text-right font-mono font-bold tabular-nums text-ink">{money(cost.totalLow)}–{money(cost.totalHigh)}</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-xs text-ink-soft">
        <div>≈ ${cost.perSqftLow}–${cost.perSqftHigh}/sq ft</div>
        <div className="text-right">≈ {cost.boards16ft} × 16′ boards, {cost.deckScrews.toLocaleString()} screws</div>
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        Low is a DIY material budget; high is contractor-installed with labor. Regional prices vary, so
        treat this as a planning range, not a quote.
      </p>
      {AMAZON_TAG && (
        <p className="mt-2 text-xs text-ink-faint">As an Amazon Associate, we earn from qualifying purchases.</p>
      )}
      <p className="mt-3 border-t border-paper-dim pt-3 text-sm">
        Prefer to hire it out?{" "}
        <Link href="/find-a-deck-builder" className="font-medium text-rust hover:text-rust-dark hover:underline">
          Get free quotes from local deck builders →
        </Link>
      </p>
    </div>
  );
}
