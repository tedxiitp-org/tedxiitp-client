import type { Direction, Position } from "@/components/arrow-escape/types/game";

/** Unit vector (dRow, dCol) for each direction. UP decreases row (moves toward row 0). */
export const DIRECTION_VECTORS: Record<Direction, { dRow: number; dCol: number }> = {
  UP: { dRow: -1, dCol: 0 },
  DOWN: { dRow: 1, dCol: 0 },
  LEFT: { dRow: 0, dCol: -1 },
  RIGHT: { dRow: 0, dCol: 1 },
};

export function step(pos: Position, dir: Direction): Position {
  const v = DIRECTION_VECTORS[dir];
  return { row: pos.row + v.dRow, col: pos.col + v.dCol };
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function positionKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

export const ALL_DIRECTIONS: readonly Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];

/**
 * Same directions expressed as {x, y} unit vectors (x = col axis, y = row
 * axis), for consumers working in SVG/screen coordinate space rather than
 * grid row/col space (rendering, animation).
 */
export const DIRECTION_XY: Record<Direction, { x: number; y: number }> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export function oppositeDirection(dir: Direction): Direction {
  switch (dir) {
    case "UP":
      return "DOWN";
    case "DOWN":
      return "UP";
    case "LEFT":
      return "RIGHT";
    case "RIGHT":
      return "LEFT";
  }
}
