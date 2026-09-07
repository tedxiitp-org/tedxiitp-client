import type { Direction, Position } from "@/components/arrow-escape/types/game";
import { DIRECTION_XY } from "@/components/arrow-escape/utils/direction";

/**
 * Coordinate space convention: all geometry here is expressed in "cell
 * units" (1 unit = 1 grid cell), with the SVG's viewBox set to
 * `0 0 cols rows`. This means the renderer never needs to know the actual
 * pixel size of the board — it scales for free with the container, at any
 * zoom level, without recomputing a single coordinate. Pixel size only
 * matters for stroke-width-in-user-units, which we also express as a
 * fraction of a cell so it scales too.
 */

export interface Point {
  x: number;
  y: number;
}

/** Center point of a grid cell, in cell-unit coordinates. */
export function cellCenter(pos: Position): Point {
  return { x: pos.col + 0.5, y: pos.row + 0.5 };
}

/**
 * Builds an SVG path `d` string that runs through the center of every
 * occupied cell in order (tail -> head). Rendered with
 * stroke-linecap="round" and stroke-linejoin="round", a polyline through
 * cell centers reads as one continuous thick line with cleanly rounded
 * corners — no manual corner-arc math needed, and it can never desync from
 * the underlying cell list since it's generated directly from it.
 */
export function buildArrowPathD(cells: readonly Position[]): string {
  if (cells.length === 0) return "";
  const points = cells.map(cellCenter);
  const [first, ...rest] = points;
  if (!first) return "";
  const commands = [`M ${first.x} ${first.y}`];
  for (const p of rest) {
    commands.push(`L ${p.x} ${p.y}`);
  }
  return commands.join(" ");
}

export interface ArrowheadOptions {
  /** How far the tip extends past the head cell center, in cell units. */
  length?: number;
  /** Half-width of the triangle's base, in cell units. */
  halfWidth?: number;
  /** How far forward (toward the direction) the base sits from head cell center. */
  baseOffset?: number;
}

/**
 * Builds the `points` attribute for a triangular arrowhead anchored at the
 * head cell, pointing in `direction`.
 *
 * Deliberately takes `direction` as an independent parameter rather than
 * deriving it from the path's last segment — this is what lets the head
 * point a direction unrelated to how the body approaches it, per spec.
 */
export function buildArrowheadPoints(
  headCell: Position,
  direction: Direction,
  options: ArrowheadOptions = {}
): string {
  const { length = 0.5, halfWidth = 0.28, baseOffset = 0.12 } = options;
  const center = cellCenter(headCell);
  const dir = DIRECTION_XY[direction];
  // Perpendicular to (dx, dy) is (-dy, dx); since dir is always axis-aligned
  // unit vector, this is exact with no normalization needed.
  const perp: Point = { x: -dir.y, y: dir.x };

  const baseCenter: Point = {
    x: center.x + dir.x * baseOffset,
    y: center.y + dir.y * baseOffset,
  };
  const tip: Point = {
    x: baseCenter.x + dir.x * length,
    y: baseCenter.y + dir.y * length,
  };
  const base1: Point = {
    x: baseCenter.x + perp.x * halfWidth,
    y: baseCenter.y + perp.y * halfWidth,
  };
  const base2: Point = {
    x: baseCenter.x - perp.x * halfWidth,
    y: baseCenter.y - perp.y * halfWidth,
  };

  return [tip, base1, base2].map((p) => `${p.x},${p.y}`).join(" ");
}
