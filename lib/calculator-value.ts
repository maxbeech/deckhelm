import type { DeckResult } from "./deck";

export const CALCULATOR_VALUE_EVENT = "calculator_completed";

/** A seeded example is not evidence that a visitor completed their own calculation. */
export function createResultReporter(emit: (params: { joist_size: string; valid: boolean }) => void) {
  let recorded = false;
  return (hasUserChange: boolean, result: Pick<DeckResult, "valid" | "joistSize">): boolean => {
    if (recorded || !hasUserChange || !result.valid) return false;
    emit({ joist_size: result.joistSize ?? "none", valid: true });
    recorded = true;
    return true;
  };
}
