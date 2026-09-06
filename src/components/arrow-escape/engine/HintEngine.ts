import type { Arrow } from "@/components/arrow-escape/types/game";
import type { BoardEngine } from "@/components/arrow-escape/engine/BoardEngine";
import { checkCollision } from "@/components/arrow-escape/engine/CollisionEngine";

/**
 * HintEngine — deliberately thin. It does no new geometry of its own; it
 * just asks CollisionEngine "is this blocked?" for every still-active arrow
 * and returns the ones that aren't. Keeping hint logic built directly on
 * top of the same collision check the player's click uses guarantees the
 * hint can never suggest a move that would actually be blocked.
 */

/** Every arrow currently on the board that could be tapped and would exit cleanly. */
export function findMovableArrows(arrows: readonly Arrow[], board: BoardEngine): Arrow[] {
  return arrows.filter((a) => !a.removed && !checkCollision(a, board).blocked);
}

/**
 * Picks one movable arrow to highlight. Random among the candidates (rather
 * than always "the first") so repeated hints on the same board don't feel
 * robotic, and so hint usage doesn't inadvertently teach players to always
 * scan arrows in id order.
 */
export function findHintArrow(arrows: readonly Arrow[], board: BoardEngine): Arrow | null {
  const movable = findMovableArrows(arrows, board);
  if (movable.length === 0) return null;
  const index = Math.floor(Math.random() * movable.length);
  return movable[index] ?? null;
}
