"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { computeDeck, DEFAULT_DECK, type DeckInputs } from "@/lib/deck";
import { computeCost, DEFAULT_DECKING, type Decking } from "@/lib/cost";
import { BEAM_SIZES, JOIST_SIZES, SPECIES_LABEL, ftIn, type BeamSize, type JoistSize, type Spacing, type Species } from "@/lib/deck-tables";
import { US_STATES } from "@/lib/frost";
import { track } from "@/lib/openhelm-analytics";
import FramingDiagram from "./FramingDiagram";
import CostBreakdown from "./CostBreakdown";
import CheckoutButton from "./CheckoutButton";
import type { Focus } from "@/lib/calculators";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-0.5 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}
const ctl = "mt-1 w-full rounded-sm border border-line-strong bg-card px-3 py-2 text-sm text-ink focus:border-rust focus:ring-2 focus:ring-rust-line focus:outline-none";
const sel = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

function Row({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-t border-paper-dim py-2">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-right">
        <span className={`font-mono font-semibold tabular-nums ${accent ? "text-rust" : "text-ink"}`}>{value}</span>
        {sub && <span className="ml-2 text-xs text-ink-soft">{sub}</span>}
      </span>
    </div>
  );
}

export default function DeckCalculator({ initialState, focus }: { initialState?: string; focus?: Focus }) {
  const [inp, setInp] = useState<DeckInputs>({ ...DEFAULT_DECK, state: initialState ?? DEFAULT_DECK.state });
  const [decking, setDecking] = useState<Decking>(DEFAULT_DECKING);
  const [adv, setAdv] = useState(false);
  const r = useMemo(() => computeDeck(inp), [inp]);
  // Sanitised dimensions (same clamp the engine applies) so the diagram, cost and
  // labels never display a negative, zero or out-of-range value mid-edit.
  const sw = Math.min(60, Math.max(2, inp.width || 0));
  const sp = Math.min(40, Math.max(2, inp.projection || 0));
  const cost = useMemo(() => computeCost({
    width: sw, projection: sp, decking, postCount: r.postCount,
    needsGuard: r.needsGuard, stairTreads: r.stairs?.treads ?? 0, hasStairs: !!r.stairs,
  }), [sw, sp, decking, r.postCount, r.needsGuard, r.stairs]);
  const set = <K extends keyof DeckInputs>(k: K, v: DeckInputs[K]) => {
    if (!startedRef.current) {
      startedRef.current = true;
      track("calculator_started", { field: k });
    }
    setInp((p) => ({ ...p, [k]: v }));
  };
  // Fires once per mount: activation is "reached a valid, code-compliant
  // result", not merely "loaded the page" (which page_view already covers).
  const startedRef = useRef(false);
  const resultSeenRef = useRef(false);
  useEffect(() => {
    if (resultSeenRef.current) return;
    if (!r.valid) return;
    resultSeenRef.current = true;
    track("calculator_result_viewed", { joist_size: r.joistSize ?? "none", valid: r.valid });
  }, [r.valid, r.joistSize]);

  const headline = (() => {
    if (focus === "footing") return ["Footing", `${r.footingDiameterIn}″ dia. × ${r.footingDepthIn}″ deep`, `${r.footingLoadLb} lb/post · ${r.footingAreaSqft} ft² bearing`];
    if (focus === "stair" && r.stairs) return ["Stairs", `${r.stairs.risers} risers @ ${r.stairs.riserIn}″`, `${r.stairs.treads} treads · ${ftIn(r.stairs.totalRunIn)} total run`];
    if (focus === "beam") return ["Beam", r.beamSize.replace("-", " × "), `posts ≤ ${ftIn(r.beamMaxPostSpacingIn)} apart · ${r.postCount} posts`];
    if (focus === "ledger") return ["Ledger fasteners", `½″ lags @ ${r.ledgerLagSpacingIn}″`, `or ½″ bolts @ ${r.ledgerBoltSpacingIn}″ o.c.`];
    if (focus === "cost") return ["Estimated cost", `${money(cost.totalLow)}–${money(cost.totalHigh)}`, `${cost.deckAreaSqft} ft² · $${cost.perSqftLow}–${cost.perSqftHigh}/ft²`];
    return ["Joists", `${r.joistSize ?? "—"} @ ${inp.spacing}″ o.c.`, `spans ${ftIn(r.joistMaxSpanIn)} max`];
  })();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 self-start rounded-sm border border-line bg-card p-5 md:sticky md:top-20 print:hidden">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Deck width (ft)" hint="Along the house">
            <input type="number" min={2} max={60} className={ctl} value={inp.width || ""} onFocus={sel}
              onChange={(e) => set("width", Math.max(0, +e.target.value || 0))} />
          </Field>
          <Field label="Projection (ft)" hint="Out from the house = joist span">
            <input type="number" min={2} max={40} className={ctl} value={inp.projection || ""} onFocus={sel}
              onChange={(e) => set("projection", Math.max(0, +e.target.value || 0))} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Joist spacing">
            <select className={ctl} value={inp.spacing} onChange={(e) => set("spacing", +e.target.value as Spacing)}>
              <option value={12}>12" o.c.</option>
              <option value={16}>16" o.c.</option>
              <option value={24}>24" o.c.</option>
            </select>
          </Field>
          <Field label="Deck height (ft)" hint="Surface above grade">
            <input type="number" min={0} max={40} step={0.5} className={ctl} value={inp.heightFt} onFocus={sel}
              onChange={(e) => set("heightFt", Math.max(0, +e.target.value || 0))} />
          </Field>
        </div>
        <Field label="Lumber species" hint="No. 2 grade, pressure-treated for ground contact">
          <select className={ctl} value={inp.species} onChange={(e) => set("species", e.target.value as Species)}>
            {(Object.keys(SPECIES_LABEL) as Species[]).map((s) => <option key={s} value={s}>{SPECIES_LABEL[s]}</option>)}
          </select>
        </Field>
        <Field label="State" hint="Sets the footing depth below the frost line">
          <select className={ctl} value={inp.state} onChange={(e) => set("state", e.target.value)}>
            {US_STATES.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
        </Field>
        <button type="button" onClick={() => setAdv((v) => { const next = !v; if (next) track("advanced_options_opened"); return next; })} className="text-xs font-medium text-rust hover:text-rust-dark">
          {adv ? "− Hide" : "+ Show"} advanced (override sizes, soil)
        </button>
        {adv && (
          <div className="grid grid-cols-2 gap-4 rounded-sm bg-paper p-3">
            <Field label="Joist size">
              <select className={ctl} value={inp.joist} onChange={(e) => set("joist", e.target.value as JoistSize | "auto")}>
                <option value="auto">Auto (smallest that passes)</option>
                {JOIST_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Beam">
              <select className={ctl} value={inp.beam} onChange={(e) => set("beam", e.target.value as BeamSize | "auto")}>
                <option value="auto">Auto</option>
                {BEAM_SIZES.map((s) => <option key={s} value={s}>{s.replace("-", " × ")}</option>)}
              </select>
            </Field>
            <Field label="Soil bearing (psf)" hint="IRC R401.4.1, 1,500 default">
              <input type="number" min={1500} step={500} className={ctl} value={inp.soilBearing || ""} onFocus={sel}
                onChange={(e) => set("soilBearing", +e.target.value || 0)} />
            </Field>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {focus && (
          <div className="border border-ink bg-ink p-5 text-paper">
            <div className="font-mono text-xs font-medium tracking-wide text-paper/60 uppercase">{headline[0]}</div>
            <div className="mt-1 font-mono text-3xl font-semibold tabular-nums">{headline[1]}</div>
            <div className="mt-1 text-sm text-paper/70">{headline[2]}</div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className={`border-2 p-5 ${r.joistOk ? "border-teal bg-teal-tint" : "border-rose-300 bg-rose-50"}`}>
            <div className="font-mono text-xs font-medium tracking-wide text-ink-soft uppercase">Joists</div>
            {r.joistSize ? (
              <>
                <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-ink">{r.joistSize}</div>
                <div className="mt-1 text-sm text-ink-soft">{inp.spacing}" o.c., spans {ftIn(r.joistMaxSpanIn)} max</div>
              </>
            ) : (
              <>
                <div className="mt-1 text-lg font-semibold text-rose-700">No prescriptive size</div>
                <div className="mt-1 text-sm text-ink-soft">Projection exceeds the R507.6 table; see “Heads up” below.</div>
              </>
            )}
          </div>
          <div className="border-2 border-rust bg-rust-tint p-5">
            <div className="font-mono text-xs font-medium tracking-wide text-ink-soft uppercase">Beam</div>
            <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-ink">{r.beamSize.replace("-", " × ")}</div>
            <div className="mt-1 text-sm text-ink-soft">posts ≤ {ftIn(r.beamMaxPostSpacingIn)} apart</div>
          </div>
        </div>

        <div className="rounded-sm border border-line bg-card p-5">
          <div className="mb-1 flex items-center justify-between">
            <div className="text-sm font-semibold text-ink">Code-compliant framing plan</div>
            <button type="button" onClick={() => { track("framing_plan_printed"); window.print(); }} className="text-xs font-medium text-rust hover:text-rust-dark print:hidden">Print / save PDF</button>
          </div>
          <FramingDiagram width={sw} projection={sp} joistCount={r.joistCount}
            postCount={r.postCount} joistSize={r.joistSize} beamSize={r.beamSize} postSpacingIn={r.postSpacingIn} valid={r.valid} />
          <Row label="Joists" value={`${r.joistCount} × ${r.joistSize ?? "—"}`} sub={`${r.joistLinealFt} lin ft`} accent={focus === "joist"} />
          <Row label="Beam" value={r.beamSize.replace("-", " × ")} sub="IRC R507.5" accent={focus === "beam"} />
          <Row label="Support posts" value={`${r.postCount} × 6x6`} sub={`${ftIn(r.postSpacingIn)} apart`} />
          <Row label="Footing size" value={`${r.footingDiameterIn}″ dia.`} sub={`${r.footingAreaSqft} ft² · ${r.footingLoadLb} lb/post`} accent={focus === "footing"} />
          <Row label="Footing depth" value={`${r.footingDepthIn}″`} sub="below grade (frost line)" accent={focus === "footing"} />
          <Row label="Concrete" value={`${r.concreteBags80} × 80-lb bags`} sub={`${r.footingConcreteCuFt} ft³ per pier`} accent={focus === "footing"} />
          <Row label="Ledger fasteners" value={`½″ lag @ ${r.ledgerLagSpacingIn}″`} sub={`or bolt @ ${r.ledgerBoltSpacingIn}″ · R507.9`} accent={focus === "ledger"} />
          {r.stairs && <Row label="Stairs" value={`${r.stairs.risers} risers @ ${r.stairs.riserIn}″`} sub={`${r.stairs.treads} treads · ${ftIn(r.stairs.totalRunIn)} run`} accent={focus === "stair"} />}
          <Row label="Guardrail" value={r.needsGuard ? `${r.guardHeightIn}″ required` : "Optional (≤30″)"} sub="IRC R312" />
          <p className="mt-3 text-xs text-ink-soft">
            Member sizes read from the IRC R507.6 (joists) and R507.5 (beams) tables for No.&nbsp;2
            {" "}{SPECIES_LABEL[inp.species]} at 40&nbsp;psf live + 10&nbsp;psf dead. Footings from tributary load ÷
            soil bearing (R507.3); ledger fasteners per R507.9. Confirm with your local building department.
          </p>
        </div>

        <CostBreakdown cost={cost} decking={decking} onDecking={setDecking} />

        {/* Pro upsell: turn this exact deck into a permit-ready packet. */}
        <div className="flex flex-col gap-3 border border-rust-line bg-rust-tint p-5 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
            <div className="text-sm font-semibold text-ink">Need it for a permit?</div>
            <p className="mt-0.5 text-xs text-ink-soft">
              Turn this deck into a permit-ready PDF: title block, elevation, framing &amp; footing schedules, code citations.
            </p>
          </div>
          <div className="shrink-0 sm:w-56">
            <CheckoutButton deck={{ ...inp, width: sw, projection: sp }} label="Create permit-ready PDF · $29" />
          </div>
        </div>

        {r.warnings.length > 0 && (
          <div className="rounded-sm border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <div className="font-semibold">Heads up</div>
            <ul className="mt-1 list-disc space-y-1 pl-5">{r.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}
