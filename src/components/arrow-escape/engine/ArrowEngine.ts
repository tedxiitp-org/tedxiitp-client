import type { Arrow, Position } from "@/components/arrow-escape/types/game";
import { step } from "@/components/arrow-escape/utils/direction";

/**
 * ArrowEngine — pure functions that derive an arrow's geometry from its
 * canonical representation (tail + path + headDirection). Nothing here is
 * stateful; nothing here stores cells. Every consumer (rendering, collision,
 * movement) calls into this module to get a fresh, always-correct cell list.
 */

/**
 * Generate every cell the arrow occupies, in order from tail (index 0) to
 * head (last index). The path is guaranteed continuous by construction: each
 * entry is a single unit step from the previous cell.
 */
export function getOccupiedCells(arrow: Pick<Arrow, "tail" | "path">): Position[] {
  const cells: Position[] = [arrow.tail];
  let current = arrow.tail;
  for (const dir of arrow.path) {
    current = step(current, dir);
    cells.push(current);
  }
  return cells;
}

/** The head is always the last generated cell. */
export function getHeadCell(arrow: Pick<Arrow, "tail" | "path">): Position {
  const cells = getOccupiedCells(arrow);
  const head = cells[cells.length - 1];
  // getOccupiedCells always returns at least [tail], so this is safe.
  return head as Position;
}

/** The tail is simply arrow.tail, exposed here for API symmetry/readability. */
export function getTailCell(arrow: Pick<Arrow, "tail">): Position {
  return arrow.tail;
}

/** Total number of cells the arrow occupies (body length, tail inclusive). */
export function getArrowLength(arrow: Pick<Arrow, "tail" | "path">): number {
  return arrow.path.length + 1;
}

/**
 * Validate that an arrow's path never revisits a cell (no self-intersection).
 * Used by the level generator and as a runtime safety check on hand-authored
 * or loaded level JSON.
 */
export function hasSelfIntersection(arrow: Pick<Arrow, "tail" | "path">): boolean {
  const cells = getOccupiedCells(arrow);
  const seen = new Set<string>();
  for (const c of cells) {
    const key = `${c.row},${c.col}`;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}
