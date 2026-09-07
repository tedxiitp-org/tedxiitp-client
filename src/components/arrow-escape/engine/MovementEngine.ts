import type { Arrow, MoveOutcome } from "@/components/arrow-escape/types/game";
import { BoardEngine } from "@/components/arrow-escape/engine/BoardEngine";
import { checkCollision } from "@/components/arrow-escape/engine/CollisionEngine";

/**
 * MovementEngine — the decision layer between "player clicked an arrow" and
 * "board state changes". It does NOT animate anything (that's AnimationEngine,
 * a later step) and does NOT touch React state directly. It answers: what
 * happened, and what should the new arrow list look like?
 */

/**
 * Attempt to activate an arrow. Returns the outcome plus (if moved) the new
 * arrows array with that arrow marked removed. The caller is responsible for
 * feeding the new array back into BoardEngine.rebuild() and for driving any
 * animation/sound/heart-loss side effects based on the outcome.
 */
export function attemptMove(
  arrowId: number,
  arrows: readonly Arrow[],
  board: BoardEngine
): { outcome: MoveOutcome; nextArrows: Arrow[] } {
  const arrow = arrows.find((a) => a.id === arrowId);

  if (!arrow || arrow.removed) {
    return {
      outcome: { kind: "already-removed", arrowId },
      nextArrows: arrows as Arrow[],
    };
  }

  const collision = checkCollision(arrow, board);

  if (collision.blocked) {
    return {
      outcome: {
        kind: "blocked",
        arrowId,
        direction: collision.direction,
        blockedAtCells: collision.blockingCells,
      },
      nextArrows: arrows as Arrow[],
    };
  }

  const nextArrows = arrows.map((a) => (a.id === arrowId ? { ...a, removed: true } : a));

  return {
    outcome: {
      kind: "moved",
      arrowId,
      direction: collision.direction,
      exitCellCount: collision.arrowLength,
      sweptCells: collision.sweptCells,
    },
    nextArrows,
  };
}

/** Convenience: are there any arrows left that haven't been cleared? */
export function isBoardCleared(arrows: readonly Arrow[]): boolean {
  return arrows.every((a) => a.removed);
}
