import type { BoardDimensions, Direction, Position } from "@/components/arrow-escape/types/game";

/**
 * AnimationEngine — pure functions only. Nothing here touches the DOM or
 * React; it answers two questions:
 *   1. How far (in cell units) must an arrow translate in `direction`
 *      before every one of its cells is fully outside the board?
 *   2. Given elapsed time and total duration, what's the eased progress
 *      (0..1) right now?
 *
 * The actual per-frame requestAnimationFrame loop that consumes these lives
 * in hooks/useSlideOutAnimation.ts, since rAF driving + refs are inherently
 * a React/DOM concern and don't belong in a pure engine module.
 */

/** Standard ease-in-out cubic — matches the spec's "ease in/out, smooth". */
export function easeInOutCubic(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

/**
 * Distance (in cell units) the whole arrow must translate in `direction`
 * so that its LAST remaining cell (the one furthest behind, relative to
 * travel direction) has fully left the board.
 *
 * E.g. moving RIGHT: the rearmost cell is the one with the smallest col.
 * It needs to travel until its new col is >= dimensions.cols (one past the
 * last valid index), i.e. distance = dimensions.cols - minCol.
 */
export function getExitDistance(
  cells: readonly Position[],
  direction: Direction,
  dimensions: BoardDimensions
): number {
  if (cells.length === 0) return 0;

  switch (direction) {
    case "RIGHT": {
      const minCol = Math.min(...cells.map((c) => c.col));
      return dimensions.cols - minCol;
    }
    case "LEFT": {
      const maxCol = Math.max(...cells.map((c) => c.col));
      return maxCol + 1;
    }
    case "DOWN": {
      const minRow = Math.min(...cells.map((c) => c.row));
      return dimensions.rows - minRow;
    }
    case "UP": {
      const maxRow = Math.max(...cells.map((c) => c.row));
      return maxRow + 1;
    }
  }
}

/** Suggested slide duration, scaled a bit by distance so long slides aren't instant-feeling. */
export function getSlideDurationMs(distance: number): number {
  const base = 260;
  const perCell = 28;
  const maxDuration = 650;
  return Math.min(maxDuration, base + distance * perCell);
}
