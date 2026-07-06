"use client";

import { useMemo, useState } from "react";
import { BALUSTER_LABEL, computeRailing, DEFAULT_RAILING, type BalusterStyle, type RailingInputs } from "@/lib/railing";

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

export default function RailingCalculator() {
  const [inp, setInp] = useState<RailingInputs>(DEFAULT_RAILING);
  const r = useMemo(() => computeRailing(inp), [inp]);
  const set = <K extends keyof RailingInputs>(k: K, v: RailingInputs[K]) => setInp((p) => ({ ...p, [k]: v }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-sm border border-line bg-card p-5">
        <Field label="Total railing length (ft)" hint="Open perimeter that needs a guard">
          <input type="number" min={1} max={300} className={ctl} value={inp.railLengthFt} onFocus={sel}
            onChange={(e) => set("railLengthFt", Math.max(0, +e.target.value || 0))} />
        </Field>
        <Field label="Post spacing (ft)" hint="Center-to-center between rail posts">
          <input type="number" min={2} max={8} step={0.5} className={ctl} value={inp.postSpacingFt} onFocus={sel}
            onChange={(e) => set("postSpacingFt", Math.max(0, +e.target.value || 0))} />
        </Field>
        <Field label="Baluster style">
          <select className={ctl} value={inp.style} onChange={(e) => set("style", e.target.value as BalusterStyle)}>
            {(Object.keys(BALUSTER_LABEL) as BalusterStyle[]).map((s) => (
              <option key={s} value={s}>{BALUSTER_LABEL[s]}</option>
            ))}
          </select>
        </Field>
        <Field label="Target gap (in)" hint="IRC R312: a 4″ sphere must not pass, so keep it under 4″">
          <input type="number" min={2} max={3.9} step={0.25} className={ctl} value={inp.maxGapIn} onFocus={sel}
            onChange={(e) => set("maxGapIn", +e.target.value || 0)} />
        </Field>
        <Field label="Rail post width (in)" hint="4×4 post = 3.5″ actual; 6×6 = 5.5″">
          <input type="number" min={1.5} max={7.5} step={0.5} className={ctl} value={inp.postWidthIn} onFocus={sel}
            onChange={(e) => set("postWidthIn", Math.max(0, +e.target.value || 0))} />
        </Field>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-rust bg-rust-tint p-5">
            <div className="font-mono text-xs font-medium tracking-wide text-ink-soft uppercase">Balusters</div>
            <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-ink">{r.totalBalusters}</div>
            <div className="mt-1 text-sm text-ink-soft">{r.balustersPerSection} per section</div>
          </div>
          <div className={`border-2 p-5 ${r.gapOk ? "border-teal bg-teal-tint" : "border-rose-300 bg-rose-50"}`}>
            <div className="font-mono text-xs font-medium tracking-wide text-ink-soft uppercase">Even gap</div>
            <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-ink">{r.evenGapIn}″</div>
            <div className="mt-1 text-sm text-ink-soft">{r.gapOk ? "Passes (under 4″)" : "Too wide, adjust"}</div>
          </div>
        </div>
        <div className="rounded-sm border border-line bg-card p-5">
          <div className="mb-1 text-sm font-semibold text-ink">Railing layout</div>
          <div className="flex justify-between border-t border-paper-dim py-2"><span className="text-sm text-ink-soft">Rail sections</span><span className="font-mono font-semibold text-ink">{r.sections}</span></div>
          <div className="flex justify-between border-t border-paper-dim py-2"><span className="text-sm text-ink-soft">Rail posts</span><span className="font-mono font-semibold text-ink">{r.totalPosts}</span></div>
          <div className="flex justify-between border-t border-paper-dim py-2"><span className="text-sm text-ink-soft">Clear span per section</span><span className="font-mono font-semibold text-ink">{r.sectionClearIn}″</span></div>
          <div className="flex justify-between border-t border-paper-dim py-2"><span className="text-sm text-ink-soft">Guard height (R312)</span><span className="font-mono font-semibold text-ink">{r.guardHeightIn}″ min</span></div>
          <p className="mt-3 text-xs text-ink-soft">
            Even gap = (section clear, minus balusters times width) divided by (balusters plus 1). Code requires
            the gap to reject a 4″ sphere (IRC R312.1.3); 3½″ is the safe build target. Guards are 36″ min on
            residential decks.
          </p>
        </div>
        {r.warnings.length > 0 && (
          <div className="rounded-sm border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">
            <ul className="list-disc space-y-1 pl-5">{r.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}
