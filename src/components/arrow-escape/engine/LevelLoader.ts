import type { Arrow, LevelDefinition } from "@/components/arrow-escape/types/game";
import { getOccupiedCells, hasSelfIntersection } from "@/components/arrow-escape/engine/ArrowEngine";

/**
 * Converts a raw LevelDefinition (as loaded from JSON) into runtime Arrow[]
 * state, adding the `removed: false` field every arrow starts with.
 *
 * Throws on structurally invalid levels (self-intersecting arrows, duplicate
 * ids, overlapping arrows) rather than silently rendering a broken board —
 * this is a dev-time guard, not something the player should ever see if the
 * authoring pipeline or procedural generator is correct.
 */
export function instantiateLevel(level: LevelDefinition): Arrow[] {
  const seenIds = new Set<number>();
  const occupiedByOtherArrow = new Map<string, number>();

  const arrows: Arrow[] = level.arrows.map((a) => {
    if (seenIds.has(a.id)) {
      throw new Error(`Level ${level.id}: duplicate arrow id ${a.id}`);
    }
    seenIds.add(a.id);

    if (hasSelfIntersection(a)) {
      throw new Error(`Level ${level.id}: arrow ${a.id} self-intersects`);
    }

    for (const cell of getOccupiedCells(a)) {
      const key = `${cell.row},${cell.col}`;
      const occupant = occupiedByOtherArrow.get(key);
      if (occupant !== undefined) {
        throw new Error(
          `Level ${level.id}: arrows ${occupant} and ${a.id} both occupy (${cell.row},${cell.col})`
        );
      }
      occupiedByOtherArrow.set(key, a.id);
    }

    return { ...a, removed: false };
  });
  return arrows;
}

export async function loadLevelById(id: string): Promise<LevelDefinition> {
  const mod = (await import(`@/components/arrow-escape/levels/${id}.json`)) as {
  default: LevelDefinition;
};
  return mod.default;
}
