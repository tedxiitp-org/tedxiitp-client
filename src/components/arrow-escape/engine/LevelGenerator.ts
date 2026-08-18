import type { Arrow, BoardDimensions, Direction, Position } from "@/components/arrow-escape/types/game";
import { BoardEngine } from "@/components/arrow-escape/engine/BoardEngine";
import { checkCollision } from "@/components/arrow-escape/engine/CollisionEngine";
import { ALL_DIRECTIONS, step as stepPosition } from "@/components/arrow-escape/utils/direction";

/**
 * LevelGenerator — builds a board that is GUARANTEED solvable, using the
 * "reverse generation" technique the spec calls for.
 *
 * The key insight: if arrows are removed in play in some order
 * a_1, a_2, ..., a_n (a_1 clicked first), then when a_k is clicked, the only
 * arrows still on the board are a_{k+1..n}. So a_k just needs its exit sweep
 * to be clear of a_{k+1..n} specifically — arrows that were already removed
 * by that point don't matter at all.
 *
 * So we build the board in the OPPOSITE order: place a_n first (onto an
 * empty board — trivially unblocked, since nothing else exists yet), then
 * a_{n-1}, ..., down to a_1 last. At the moment we place a_k, the board
 * already contains exactly a_{k+1..n} — precisely the arrows that will still
 * be present when the player reaches a_k in forward play. So if we only ever
 * accept a placement whose exit sweep is unblocked AGAINST WHAT'S ALREADY
 * PLACED, every arrow is provably clickable in forward order a_1..a_n by
 * construction. There is no separate "solver" needed — solvability is a
 * structural guarantee of the build process itself.
 */

export interface GeneratorOptions {
  dimensions: BoardDimensions;
  arrowCount: number;
  minPathLength?: number;
  maxPathLength?: number;
  colors?: string[];
  /** How many times to retry placing a single arrow before giving up on it. */
  maxAttemptsPerArrow?: number;
  rng?: () => number;
}

const DEFAULT_COLORS = [
  "#FF5A5F",
  "#3A86FF",
  "#FFB703",
  "#8338EC",
  "#06D6A0",
  "#EF476F",
  "#118AB2",
  "#F72585",
];

function shuffled<T>(arr: readonly T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = tmp;
  }
  return copy;
}

function posKey(p: Position): string {
  return `${p.row},${p.col}`;
}

function inBounds(p: Position, dims: BoardDimensions): boolean {
  return p.row >= 0 && p.row < dims.rows && p.col >= 0 && p.col < dims.cols;
}

/**
 * Random self-avoiding walk from `tail`, stepping only onto cells that are
 * both in-bounds and not already occupied by a previously-placed arrow.
 * Stops early (returning a shorter path) if it gets boxed in — a shorter
 * arrow is still valid, just less dramatic.
 */
function buildRandomPath(
  tail: Position,
  targetLength: number,
  dims: BoardDimensions,
  isFree: (p: Position) => boolean,
  rng: () => number
): Direction[] {
  const path: Direction[] = [];
  const visited = new Set<string>([posKey(tail)]);
  let current = tail;

  for (let i = 0; i < targetLength; i++) {
    const dirs = shuffled(ALL_DIRECTIONS, rng);
    let advanced = false;
    for (const dir of dirs) {
      const next = stepPosition(current, dir);
      if (!inBounds(next, dims)) continue;
      const key = posKey(next);
      if (visited.has(key)) continue;
      if (!isFree(next)) continue;
      path.push(dir);
      visited.add(key);
      current = next;
      advanced = true;
      break;
    }
    if (!advanced) break;
  }

  return path;
}

/**
 * Given a fully-built candidate arrow (tail + path already chosen), find a
 * headDirection whose exit sweep is unblocked against `placedSoFar`. Tries
 * all 4 directions in random order and returns the first that works, or
 * null if none do.
 */
function findValidHeadDirection(
  tail: Position,
  path: Direction[],
  placedSoFar: readonly Arrow[],
  dimensions: BoardDimensions,
  rng: () => number
): Direction | null {
  const board = new BoardEngine(dimensions, placedSoFar);
  for (const dir of shuffled(ALL_DIRECTIONS, rng)) {
    const candidate: Arrow = {
      id: -1,
      tail,
      path,
      headDirection: dir,
      removed: false,
      color: "#000000",
    };
    if (!checkCollision(candidate, board).blocked) {
      return dir;
    }
  }
  return null;
}

/**
 * Generates `arrowCount` arrows (or as many as it can place — see note
 * below) for a board of the given dimensions. The returned arrows are
 * ALWAYS fully solvable: every one of them, at the moment it was placed,
 * was verified to have a clear exit against every arrow already on the
 * board at that point.
 *
 * If the board is too small/dense to fit the requested count, the generator
 * degrades gracefully — it returns fewer arrows rather than ever producing
 * an unsolvable board. This is intentional: per spec, "do NOT generate
 * impossible puzzles" takes priority over hitting an exact arrow count.
 */
export function generateLevel(options: GeneratorOptions): Arrow[] {
  const {
    dimensions,
    arrowCount,
    minPathLength = 1,
    maxPathLength = 5,
    colors = DEFAULT_COLORS,
    maxAttemptsPerArrow = 40,
    rng = Math.random,
  } = options;

  const placed: Arrow[] = [];
  const occupied = new Set<string>();

  const isFree = (p: Position) => !occupied.has(posKey(p));

  const allCells: Position[] = [];
  for (let r = 0; r < dimensions.rows; r++) {
    for (let c = 0; c < dimensions.cols; c++) {
      allCells.push({ row: r, col: c });
    }
  }

  let nextId = 1;

  for (let arrowIndex = 0; arrowIndex < arrowCount; arrowIndex++) {
    let placedThisArrow = false;

    for (let attempt = 0; attempt < maxAttemptsPerArrow; attempt++) {
      const freeCells = shuffled(
        allCells.filter((c) => isFree(c)),
        rng
      );
      const tail = freeCells[0];
      if (!tail) break; // board is full, nothing left to try

      const targetLength =
        minPathLength + Math.floor(rng() * (maxPathLength - minPathLength + 1));
      const path = buildRandomPath(tail, targetLength, dimensions, isFree, rng);

      const headDirection = findValidHeadDirection(tail, path, placed, dimensions, rng);
      if (!headDirection) continue; // this shape/tail doesn't work, try another

      const color = colors[(nextId - 1) % colors.length] ?? "#FFFFFF";
      const arrow: Arrow = {
        id: nextId,
        tail,
        path,
        headDirection,
        removed: false,
        color,
      };

      // Commit: mark cells occupied, add to placed set.
      let cur = tail;
      occupied.add(posKey(cur));
      for (const dir of path) {
        cur = stepPosition(cur, dir);
        occupied.add(posKey(cur));
      }
      placed.push(arrow);
      nextId += 1;
      placedThisArrow = true;
      break;
    }

    if (!placedThisArrow) {
      // Board has no more room for a guaranteed-solvable arrow — stop here
      // rather than force an unsolvable one in.
      break;
    }
  }

  return placed;
}

/** Convenience wrapper producing just the arrow list for a given size/count. */
export function generateLevelArrows(
  dimensions: BoardDimensions,
  arrowCount: number,
  rng?: () => number
): Arrow[] {
  return generateLevel({ dimensions, arrowCount, rng });
}

/**
 * generateFullCoverageLevel — produces a board where EVERY cell is occupied
 * by some arrow (no empty cells), while remaining provably fully solvable.
 *
 * Construction: process each row independently (or each column, if
 * orientation is "column"). Every row is a straight line of cells; cut each
 * row into random-length consecutive chunks — a strict partition of that
 * row, so full coverage and non-overlap are automatic. Each chunk becomes
 * one arrow, with headDirection set to that row's own traversal direction
 * (alternating per row, like mowing a lawn, purely for visual variety —
 * rows don't interact with each other).
 *
 * Solvability falls out for free: a chunk's straight-line exit sweep in its
 * row's direction can only ever hit OTHER chunks later in that SAME row
 * (the sweep is horizontal, so it can never leave its row) before reaching
 * the board edge. So within each row there's a strict, well-defined removal
 * order — clear from the row's far end backward — under which every chunk
 * is unblocked when its turn comes. Rows never depend on each other (a
 * chunk never spans two rows), so this holds simultaneously for the whole
 * board. And because removing an arrow only ever frees cells, never
 * occupies new ones, collision status is monotonic — so once one valid
 * order exists, EVERY order a player might actually click in also fully
 * clears the board (the same property generateLevel() relies on).
 */
export interface TilingOptions {
  dimensions: BoardDimensions;
  minChunkLength?: number;
  maxChunkLength?: number;
  orientation?: "row" | "column";
  rng?: () => number;
  color?: string;
}

function directionBetween(a: Position, b: Position): Direction {
  if (b.row === a.row - 1 && b.col === a.col) return "UP";
  if (b.row === a.row + 1 && b.col === a.col) return "DOWN";
  if (b.col === a.col - 1 && b.row === a.row) return "LEFT";
  if (b.col === a.col + 1 && b.row === a.row) return "RIGHT";
  throw new Error(`generateFullCoverageLevel: non-adjacent cells (${a.row},${a.col}) -> (${b.row},${b.col})`);
}

export function generateFullCoverageLevel(options: TilingOptions): Arrow[] {
  const {
    dimensions,
    minChunkLength = 2,
    maxChunkLength = 6,
    orientation = "row",
    rng = Math.random,
    color = "#FFFFFF",
  } = options;

  // Build lines (rows, or columns) and cut chunks STRICTLY WITHIN a single
  // line, never spanning into the next one. This is the piece that makes
  // the solvability argument above actually hold: a chunk's exit sweep must
  // only ever encounter cells later in its OWN line or the board edge. A
  // chunk straddling two lines would need both lines' downstream cells
  // clear simultaneously, which isn't guaranteed and can deadlock.
  const lineCount = orientation === "row" ? dimensions.rows : dimensions.cols;
  const lineLength = orientation === "row" ? dimensions.cols : dimensions.rows;

  const arrows: Arrow[] = [];
  let nextId = 1;

  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const forward = lineIndex % 2 === 0;

    const lineCells: Position[] = [];
    for (let i = 0; i < lineLength; i++) {
      const pos = forward ? i : lineLength - 1 - i;
      lineCells.push(
        orientation === "row" ? { row: lineIndex, col: pos } : { row: pos, col: lineIndex }
      );
    }

    let idx = 0;
    while (idx < lineCells.length) {
      const remaining = lineCells.length - idx;
      const targetLen = minChunkLength + Math.floor(rng() * (maxChunkLength - minChunkLength + 1));
      let len = Math.min(targetLen, remaining);

      // Avoid stranding a tiny leftover (shorter than minChunkLength) as its
      // own trivial chunk — fold it into the arrow we just built instead, by
      // extending THIS chunk to consume the rest of the line whenever what
      // would be left over afterwards is too small to stand on its own.
      if (remaining - len > 0 && remaining - len < minChunkLength) {
        len = remaining;
      }

      const chunk = lineCells.slice(idx, idx + len);
      idx += len;

      const tail = chunk[0];
      const headCell = chunk[chunk.length - 1];
      if (!tail || !headCell) continue;

      const path: Direction[] = [];
      for (let i = 1; i < chunk.length; i++) {
        const prev = chunk[i - 1];
        const cur = chunk[i];
        if (!prev || !cur) continue;
        path.push(directionBetween(prev, cur));
      }

      const headDirection: Direction =
        orientation === "row" ? (forward ? "RIGHT" : "LEFT") : forward ? "DOWN" : "UP";

      arrows.push({ id: nextId, tail, path, headDirection, removed: false, color });
      nextId += 1;
    }
  }

  return arrows;
}
