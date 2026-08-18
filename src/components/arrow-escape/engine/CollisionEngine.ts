import type { Arrow, Direction, Position } from "@/components/arrow-escape/types/game";
import { BoardEngine, EMPTY_CELL } from "@/components/arrow-escape/engine/BoardEngine";
import { getOccupiedCells } from "@/components/arrow-escape/engine/ArrowEngine";
import { DIRECTION_VECTORS } from "@/components/arrow-escape/utils/direction";

/**
 * CollisionEngine — pure, stateless logic that answers exactly one question:
 * "if this arrow slides in its headDirection, is the path directly ahead of
 * its HEAD clear all the way to the board edge?"
 *
 * Rule: only the head's own exit line matters. Other cells in the arrow's
 * body do not independently block the move, even if they sit in a row/column
 * that has something in it — the check is a single ray cast forward from the
 * head cell to the board edge.
 */

export interface CollisionResult {
  blocked: boolean;
  /** Every in-bounds cell directly ahead of the head, out to the board edge (for the flash animation). */
  sweptCells: Position[];
  /** If blocked, the specific cells where another arrow was hit. */
  blockingCells: Position[];
  /** Total cells the arrow itself occupies (used for scoring/animation distance). */
  arrowLength: number;
  direction: Direction;
}

/** Sweeps from (exclusive of) a starting cell to the board edge, collecting in-bounds cells. */
function sweepToEdge(from: Position, direction: Direction, board: BoardEngine): Position[] {
  const { dRow, dCol } = DIRECTION_VECTORS[direction];
  const result: Position[] = [];
  let current: Position = { row: from.row + dRow, col: from.col + dCol };
  while (board.isInBounds(current)) {
    result.push(current);
    current = { row: current.row + dRow, col: current.col + dCol };
  }
  return result;
}

export function checkCollision(arrow: Arrow, board: BoardEngine): CollisionResult {
  const ownCells = getOccupiedCells(arrow);
  const direction = arrow.headDirection;
  const headCell = ownCells[ownCells.length - 1] ?? arrow.tail;

  const sweptCells: Position[] = [];
  const blockingCells: Position[] = [];

  for (const cell of sweepToEdge(headCell, direction, board)) {
    sweptCells.push(cell);
    const occupantId = board.getArrowIdAt(cell);
    // A cell belonging to this same arrow (its own body looping back into
    // the head's path) never blocks it — the whole arrow moves together.
    if (occupantId !== EMPTY_CELL && occupantId !== arrow.id) {
      blockingCells.push(cell);
    }
  }

  return {
    blocked: blockingCells.length > 0,
    sweptCells,
    blockingCells,
    arrowLength: ownCells.length,
    direction,
  };
}
