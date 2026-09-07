import { instantiateLevel } from "../engine/LevelLoader";
import { findMovableArrows } from "../engine/HintEngine";
import { attemptMove } from "../engine/MovementEngine";
import { BoardEngine } from "../engine/BoardEngine";
import { getOccupiedCells } from "../engine/ArrowEngine";
import { ALL_LEVELS } from "../levels";

let anyFailure = false;

for (const level of ALL_LEVELS) {
  process.stdout.write(`${level.id} (${level.board.rows}x${level.board.cols}, ${level.arrows.length} arrows): `);
  try {
    const arrows = instantiateLevel(level);

    // Full coverage check
    const covered = new Set<string>();
    let doubled = 0;
    for (const a of arrows) {
      for (const c of getOccupiedCells(a)) {
        const key = `${c.row},${c.col}`;
        if (covered.has(key)) doubled++;
        covered.add(key);
      }
    }
    const totalCells = level.board.rows * level.board.cols;
    const missing = totalCells - covered.size;

    // Solvability check (random-order greedy clear)
    let working = arrows.map((a) => ({ ...a }));
    let iterations = 0;
    const maxIter = arrows.length + 5;
    while (working.some((a) => !a.removed) && iterations < maxIter) {
      iterations++;
      const board = new BoardEngine(level.board, working);
      const movable = findMovableArrows(working, board);
      if (movable.length === 0) break;
      const pick = movable[Math.floor(Math.random() * movable.length)];
      const { nextArrows, outcome } = attemptMove(pick!.id, working, board);
      if (outcome.kind !== "moved") break;
      working = nextArrows;
    }
    const solvable = working.every((a) => a.removed);

    const ok = missing === 0 && doubled === 0 && solvable;
    console.log(
      ok ? "OK" : `ISSUE (missing=${missing}, doubled=${doubled}, solvable=${solvable})`
    );
    if (!ok) anyFailure = true;
  } catch (e) {
    console.log("FAILED TO LOAD:", (e as Error).message);
    anyFailure = true;
  }
}

process.exit(anyFailure ? 1 : 0);
