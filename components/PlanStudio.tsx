"use client";

import { useMemo, useState } from "react";
import { computeDeck, type DeckInputs } from "@/lib/deck";
import { computeCost, DECKING_LABEL, DEFAULT_DECKING, type Decking } from "@/lib/cost";
import { BEAM_SIZES, JOIST_SIZES, SPECIES_LABEL, ftIn, type BeamSize, type JoistSize, type Spacing, type Species } from "@/lib/deck-tables";
import { US_STATES } from "@/lib/frost";
import { SITE } from "@/lib/site";
import { Container } from "@/components/ui";
import FramingDiagram from "./FramingDiagram";
import ElevationDiagram from "./ElevationDiagram";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const ctl = "mt-1 w-full rounded-sm border border-line-strong bg-card px-3 py-2 text-sm text-ink focus:border-rust focus:ring-2 focus:ring-rust-line focus:outline-none";
const sel = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-ink-soft">{label}</span>{children}</label>;
}

// One row of the schedule tables in the printed document.
function SRow({ k, v, cite }: { k: string; v: string; cite?: string }) {
  return (
    <tr className="border-t border-line">
      <td className="py-1.5 pr-3 text-ink-soft">{k}</td>
      <td className="py-1.5 pr-3 text-right font-mono font-semibold tabular-nums text-ink">{v}</td>
      <td className="py-1.5 text-right font-mono text-[11px] text-ink-faint">{cite ?? ""}</td>
    </tr>
  );
}

function DocSection({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid border-t-2 border-ink pt-4">
      <h3 className="flex items-baseline gap-2 font-display text-base font-semibold text-ink">
        <span className="font-mono text-xs text-rust">{n}</span>{title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

const CODE_APPENDIX = [
  ["IRC R507.6", "Deck joist maximum spans (size × spacing × species)"],
  ["IRC R507.5", "Deck beam maximum spans by supported joist span"],
  ["IRC R507.3", "Footing area from tributary load ÷ soil bearing"],
  ["IRC R403.1.4", "Footing depth below the frost line"],
  ["IRC R507.9.1.3", "Ledger lag / through-bolt fastener spacing"],
  ["IRC R507.4", "Deck post size and connections"],
  ["IRC R311.7", "Stair riser, tread and run limits"],
  ["IRC R312", "Guard height and 4″ sphere baluster rule"],
  ["IRC R401.4.1", "Presumptive soil load-bearing values"],
  ["AWC DCA6", "Prescriptive Residential Wood Deck Construction Guide"],
];

export default function PlanStudio({ initialDeck }: { initialDeck: DeckInputs }) {
  const [inp, setInp] = useState<DeckInputs>(initialDeck);
  const [decking, setDecking] = useState<Decking>(DEFAULT_DECKING);
  const [meta, setMeta] = useState({ project: "", address: "", preparedFor: "", permit: "" });
  const set = <K extends keyof DeckInputs>(k: K, v: DeckInputs[K]) => setInp((p) => ({ ...p, [k]: v }));

  const r = useMemo(() => computeDeck(inp), [inp]);
  const sw = Math.min(60, Math.max(2, inp.width || 0));
  const sp = Math.min(40, Math.max(2, inp.projection || 0));
  const cost = useMemo(() => computeCost({
    width: sw, projection: sp, decking, postCount: r.postCount,
    needsGuard: r.needsGuard, stairTreads: r.stairs?.treads ?? 0, hasStairs: !!r.stairs,
  }), [sw, sp, decking, r.postCount, r.needsGuard, r.stairs]);

  const today = useMemo(() => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), []);
  const stateName = US_STATES.find((s) => s.slug === inp.state)?.name ?? inp.state;

  return (
    <Container className="pb-20 pt-6">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* CONTROLS — screen only */}
        <aside className="plan-controls space-y-5 self-start rounded-sm border border-line bg-card p-5 lg:sticky lg:top-24 print:hidden">
          <div>
            <div className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">Project details</div>
            <div className="mt-3 space-y-3">
              <Field label="Project name"><input className={ctl} value={meta.project} placeholder="Backyard deck" onChange={(e) => setMeta((m) => ({ ...m, project: e.target.value }))} /></Field>
              <Field label="Site address"><input className={ctl} value={meta.address} placeholder="123 Main St, City, ST" onChange={(e) => setMeta((m) => ({ ...m, address: e.target.value }))} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prepared for"><input className={ctl} value={meta.preparedFor} placeholder="Owner" onChange={(e) => setMeta((m) => ({ ...m, preparedFor: e.target.value }))} /></Field>
                <Field label="Permit #"><input className={ctl} value={meta.permit} placeholder="—" onChange={(e) => setMeta((m) => ({ ...m, permit: e.target.value }))} /></Field>
              </div>
            </div>
          </div>
          <div className="border-t border-line pt-4">
            <div className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">Deck</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Width (ft)"><input type="number" min={2} max={60} className={ctl} value={inp.width || ""} onFocus={sel} onChange={(e) => set("width", Math.max(0, +e.target.value || 0))} /></Field>
              <Field label="Projection (ft)"><input type="number" min={2} max={40} className={ctl} value={inp.projection || ""} onFocus={sel} onChange={(e) => set("projection", Math.max(0, +e.target.value || 0))} /></Field>
              <Field label="Joist spacing"><select className={ctl} value={inp.spacing} onChange={(e) => set("spacing", +e.target.value as Spacing)}><option value={12}>12&quot; o.c.</option><option value={16}>16&quot; o.c.</option><option value={24}>24&quot; o.c.</option></select></Field>
              <Field label="Height (ft)"><input type="number" min={0} max={40} step={0.5} className={ctl} value={inp.heightFt} onFocus={sel} onChange={(e) => set("heightFt", Math.max(0, +e.target.value || 0))} /></Field>
            </div>
            <div className="mt-3 space-y-3">
              <Field label="Species"><select className={ctl} value={inp.species} onChange={(e) => set("species", e.target.value as Species)}>{(Object.keys(SPECIES_LABEL) as Species[]).map((s) => <option key={s} value={s}>{SPECIES_LABEL[s]}</option>)}</select></Field>
              <Field label="State (frost depth)"><select className={ctl} value={inp.state} onChange={(e) => set("state", e.target.value)}>{US_STATES.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select></Field>
              <Field label="Decking material"><select className={ctl} value={decking} onChange={(e) => setDecking(e.target.value as Decking)}>{(Object.keys(DECKING_LABEL) as Decking[]).map((d) => <option key={d} value={d}>{DECKING_LABEL[d]}</option>)}</select></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Joist override"><select className={ctl} value={inp.joist} onChange={(e) => set("joist", e.target.value as JoistSize | "auto")}><option value="auto">Auto</option>{JOIST_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
                <Field label="Beam override"><select className={ctl} value={inp.beam} onChange={(e) => set("beam", e.target.value as BeamSize | "auto")}><option value="auto">Auto</option>{BEAM_SIZES.map((s) => <option key={s} value={s}>{s.replace("-", " × ")}</option>)}</select></Field>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => window.print()} className="w-full rounded-sm bg-rust px-4 py-2.5 text-sm font-medium text-white hover:bg-rust-dark">
            Print / save as PDF
          </button>
          <p className="text-xs text-ink-faint">Tip: in the print dialog, set margins to Default and enable “Background graphics” for the framing diagrams.</p>
        </aside>

        {/* DOCUMENT */}
        <div className="plan-doc mx-auto w-full max-w-[850px] border border-line bg-white p-6 plate-lg sm:p-10 print:border-0 print:p-0 print:shadow-none">
          {/* Title block */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-4">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-rust">Permit-ready deck plan</div>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{meta.project || "Residential deck"}</h2>
              <p className="mt-1 text-sm text-ink-soft">{meta.address || "Site address —"}</p>
            </div>
            <div className="text-right">
              <div className="font-display text-lg font-semibold text-ink">Deck<span className="text-rust">Helm</span></div>
              <dl className="mt-1 space-y-0.5 font-mono text-[11px] text-ink-soft">
                <div>Date: {today}</div>
                <div>Prepared for: {meta.preparedFor || "—"}</div>
                <div>Permit #: {meta.permit || "—"}</div>
              </dl>
            </div>
          </div>

          {/* Summary strip */}
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-4">
            {[
              ["Deck size", `${sw}′ × ${sp}′`],
              ["Area", `${cost.deckAreaSqft} ft²`],
              ["Height", ftIn(inp.heightFt * 12)],
              ["Location", stateName],
            ].map(([k, v]) => (
              <div key={k} className="bg-white px-3 py-2 text-center">
                <div className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">{k}</div>
                <div className="font-mono text-sm font-semibold text-ink">{v}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-6">
            {/* Drawings */}
            <DocSection n="01" title="Framing plan & elevation">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-line p-2">
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-ink-faint">Plan view</div>
                  <FramingDiagram width={sw} projection={sp} joistCount={r.joistCount} postCount={r.postCount} joistSize={r.joistSize} beamSize={r.beamSize} postSpacingIn={r.postSpacingIn} valid={r.valid} />
                </div>
                <div className="border border-line p-2">
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-ink-faint">Section / elevation</div>
                  <ElevationDiagram heightFt={inp.heightFt} footingDepthIn={r.footingDepthIn} beamSize={r.beamSize} joistSize={r.joistSize} needsGuard={r.needsGuard} guardHeightIn={r.guardHeightIn} stairs={r.stairs} />
                </div>
              </div>
            </DocSection>

            <DocSection n="02" title="Framing schedule">
              <table className="w-full text-sm">
                <tbody>
                  <SRow k="Joists" v={`${r.joistCount} × ${r.joistSize ?? "—"} @ ${inp.spacing}″ o.c.`} cite="R507.6" />
                  <SRow k="Max joist span" v={ftIn(r.joistMaxSpanIn)} cite="R507.6" />
                  <SRow k="Beam" v={r.beamSize.replace("-", " × ")} cite="R507.5" />
                  <SRow k="Support posts" v={`${r.postCount} × ${r.postSize.split(" ")[0]} @ ${ftIn(r.postSpacingIn)} o.c.`} cite="R507.4" />
                  <SRow k="Ledger fasteners" v={`½″ lag @ ${r.ledgerLagSpacingIn}″ (or ½″ bolt @ ${r.ledgerBoltSpacingIn}″)`} cite="R507.9" />
                  <SRow k="Species / grade" v={`No. 2 ${SPECIES_LABEL[inp.species]}`} />
                  <SRow k="Design load" v="40 psf live + 10 psf dead" />
                </tbody>
              </table>
            </DocSection>

            <DocSection n="03" title="Footing schedule">
              <table className="w-full text-sm">
                <tbody>
                  <SRow k="Footings" v={`${r.postCount} required`} cite="R507.3" />
                  <SRow k="Diameter" v={`${r.footingDiameterIn}″ (${r.footingAreaSqft} ft² bearing)`} cite="R507.3" />
                  <SRow k="Depth below grade" v={`${r.footingDepthIn}″ (frost line, ${stateName})`} cite="R403.1.4" />
                  <SRow k="Load per footing" v={`${r.footingLoadLb} lb`} />
                  <SRow k="Soil bearing" v={`${inp.soilBearing} psf`} cite="R401.4.1" />
                  <SRow k="Concrete" v={`${r.concreteBags80} × 80-lb bags (${r.footingConcreteCuFt} ft³/pier)`} />
                </tbody>
              </table>
            </DocSection>

            {(r.stairs || r.needsGuard) && (
              <DocSection n="04" title="Stairs & guards">
                <table className="w-full text-sm">
                  <tbody>
                    {r.stairs && <SRow k="Stair risers" v={`${r.stairs.risers} @ ${r.stairs.riserIn}″`} cite="R311.7" />}
                    {r.stairs && <SRow k="Stair treads" v={`${r.stairs.treads} @ ${r.stairs.treadRunIn}″ run · ${ftIn(r.stairs.totalRunIn)} total`} cite="R311.7" />}
                    <SRow k="Guardrail" v={r.needsGuard ? `${r.guardHeightIn}″ min, 4″ sphere rule` : "Not required (≤30″ above grade)"} cite="R312" />
                  </tbody>
                </table>
              </DocSection>
            )}

            <DocSection n={r.stairs || r.needsGuard ? "05" : "04"} title="Material list & budget">
              <table className="w-full text-sm">
                <tbody>
                  {cost.items.map((it) => (
                    <tr key={it.label} className="border-t border-line">
                      <td className="py-1.5 pr-3 text-ink-soft">{it.label}<span className="block text-[11px] text-ink-faint">{it.detail}</span></td>
                      <td className="py-1.5 text-right font-mono tabular-nums text-ink">{money(it.low)}–{money(it.high)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-ink"><td className="py-2 font-semibold text-ink">Estimated total</td><td className="py-2 text-right font-mono font-bold tabular-nums text-ink">{money(cost.totalLow)}–{money(cost.totalHigh)}</td></tr>
                </tbody>
              </table>
              <p className="mt-2 font-mono text-[11px] text-ink-faint">≈ {cost.boards16ft} × 16′ deck boards · {cost.deckScrews.toLocaleString()} screws · ${cost.perSqftLow}–${cost.perSqftHigh}/ft². Planning range, not a quote.</p>
            </DocSection>

            {r.warnings.length > 0 && (
              <DocSection n={r.stairs || r.needsGuard ? "06" : "05"} title="Notes & flags">
                <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
                  {r.warnings.map((w) => <li key={w}>{w}</li>)}
                </ul>
              </DocSection>
            )}

            <DocSection n="A" title="Code citation appendix">
              <table className="w-full text-sm">
                <tbody>
                  {CODE_APPENDIX.map(([code, what]) => (
                    <tr key={code} className="border-t border-line">
                      <td className="w-32 py-1.5 pr-3 font-mono font-semibold text-ink">{code}</td>
                      <td className="py-1.5 text-ink-soft">{what}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DocSection>
          </div>

          <p className="mt-6 border-t border-line pt-4 text-[11px] leading-relaxed text-ink-faint">
            Prepared with {SITE.name} ({SITE.domain}) from the IRC R507 / AWC DCA6 prescriptive deck tables. This is a
            planning aid, not an engineering stamp. Local amendments vary — confirm member sizes, footing depth, guard
            height and connections with your building department before construction. Spans beyond the prescriptive
            tables require a licensed engineer.
          </p>
        </div>
      </div>
    </Container>
  );
}
