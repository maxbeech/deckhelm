import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { computeDeck, DEFAULT_DECK } from "../lib/deck.ts";
import { createResultReporter } from "../lib/calculator-value.ts";

test("a valid seeded example does not establish visitor value", () => {
  const events: unknown[] = [];
  const report = createResultReporter(p => events.push(p));
  assert.equal(report(false, computeDeck(DEFAULT_DECK)), false);
  assert.deepEqual(events, []);
});
test("an invalid custom design waits for a valid calculation and then counts once", () => {
  const events: unknown[] = [];
  const report = createResultReporter(p => events.push(p));
  assert.equal(report(true, computeDeck({ ...DEFAULT_DECK, projection: 30 })), false);
  const result = computeDeck({ ...DEFAULT_DECK, width: 18 });
  assert.equal(result.valid, true);
  assert.equal(report(true, result), true);
  assert.deepEqual(events, [{ joist_size: result.joistSize, valid: true }]);
  assert.equal(report(true, computeDeck({ ...DEFAULT_DECK, width: 20 })), false);
  assert.equal(events.length, 1);
});
test("the UI reports on result changes, including changes that keep the same joist size", () => {
  const source = readFileSync(new URL("../components/DeckCalculator.tsx", import.meta.url), "utf8");
  assert.ok(source.includes("resultReporter.current!(startedRef.current, r)"));
  assert.ok(source.includes("}, [r, cost])"));
});
