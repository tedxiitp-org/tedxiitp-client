/**
 * Core type definitions for Arrow Escape.
 *
 * Design principle: an Arrow is stored as (tail + path + headDirection) ONLY.
 * Occupied cells are always DERIVED, never stored, so there is a single
 * source of truth and no risk of desync between "shape" and "position".
 */

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

/** Row/column grid coordinate. row = y (0 = top), col = x (0 = left). */
export interface Position {
  row: number;
  col: number;
}

/**
 * An Arrow's identity and shape.
 *
 * - `tail` is the fixed starting cell of the body (the END the player does
 *   NOT click to move, i.e. the opposite end from the head).
 * - `path` is the sequence of unit steps FROM the tail that generates every
 *   subsequent occupied cell, in order. The final cell reached is the head.
 * - `headDirection` is the direction the arrowhead visually points and,
 *   crucially, the direction the ENTIRE arrow slides when activated. This is
 *   independent of the last step in `path` (an arrow can bend right up to
 *   its head and still point, say, UP).
 */
export interface Arrow {
  id: number;
  tail: Position;
  path: Direction[];
  headDirection: Direction;
  removed: boolean;
  color: string;
}

/** Board dimensions. Square or rectangular boards are both supported. */
export interface BoardDimensions {
  rows: number;
  cols: number;
}

/** A single level definition, loadable from JSON. */
export interface LevelDefinition {
  id: string;
  index: number;
  board: BoardDimensions;
  arrows: Omit<Arrow, "removed">[];
  timeLimitSeconds: number;
  coinReward: number;
}

/** Runtime status of the active level attempt. */
export type LevelStatus = "playing" | "won" | "lost-hearts" | "lost-time";

/** Result of attempting to move an arrow. */
export type MoveOutcome =
  | {
      kind: "moved";
      arrowId: number;
      direction: Direction;
      exitCellCount: number;
      sweptCells: Position[];
    }
  | { kind: "blocked"; arrowId: number; direction: Direction; blockedAtCells: Position[] }
  | { kind: "already-removed"; arrowId: number };

/** Player-facing progress state for the current attempt. */
export interface GameProgress {
  cleared: number;
  total: number;
  hearts: number;
  maxHearts: number;
  coins: number;
  elapsedSeconds: number;
  timeLimitSeconds: number;
  status: LevelStatus;
}

/** Booster inventory + selection state. */
export type BoosterType = "hint" | "eraser" | "grid";

export interface BoosterState {
  hintCount: number;
  eraserCount: number;
  gridEnabled: boolean;
  activeBooster: Exclude<BoosterType, "grid"> | null;
}

/** Persisted player data (localStorage). */
export interface PersistedState {
  coins: number;
  currentLevelIndex: number;
  boosters: {
    hintCount: number;
    eraserCount: number;
  };
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
}
