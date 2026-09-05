// Run with: npx tsx scripts/verify-head-only-collision.ts
import { checkCollision } from "../engine/CollisionEngine";
import { BoardEngine } from "../engine/BoardEngine";
import type { Arrow } from "../types/game";

const dims = { rows: 6, cols: 6 };

// Arrow A: bendy shape whose BODY passes through row 2 (cells (2,0),(2,1))
// then bends and its HEAD ends up in row 4, pointing RIGHT.
//   tail (2,0) -> RIGHT -> (2,1) -> DOWN -> (3,1) -> DOWN -> (4,1)
// headDirection RIGHT, head cell = (4,1).
const arrowA: Arrow = {
  id: 1,
  tail: { row: 2, col: 0 },
  path: ["RIGHT", "DOWN", "DOWN"],
  headDirection: "RIGHT",
  removed: false,
  color: "#FFFFFF",
};

// Blocker sitting in row 2 (would have blocked the OLD per-line-across-body
// rule, since arrow A occupies row 2 too) but NOT in row 4 (the head's own
// row) — so under the NEW head-only rule, arrow A should be movable.
const blockerInRowTwo: Arrow = {
  id: 2,
  tail: { row: 2, col: 4 },
  path: [],
  headDirection: "UP",
  removed: false,
  color: "#FFFFFF",
};

const board1 = new BoardEngine(dims, [arrowA, blockerInRowTwo]);
const result1 = checkCollision(arrowA, board1);
console.log("Test 1: blocker in BODY's row (2), not head's row (4)");
console.log("  blocked:", result1.blocked, "-- expected: false (only head's row/4 matters)");

// Now put a blocker directly in the HEAD's own row (row 4), ahead of it.
const blockerInHeadRow: Arrow = {
  id: 3,
  tail: { row: 4, col: 3 },
  path: [],
  headDirection: "UP",
  removed: false,
  color: "#FFFFFF",
};
const board2 = new BoardEngine(dims, [arrowA, blockerInHeadRow]);
const result2 = checkCollision(arrowA, board2);
console.log("\nTest 2: blocker directly ahead of the HEAD (row 4)");
console.log("  blocked:", result2.blocked, "-- expected: true");

const pass1 = result1.blocked === false;
const pass2 = result2.blocked === true;
console.log("\n" + (pass1 && pass2 ? "ALL PASS ✔ — only the head's path determines blocking" : "FAIL ✘"));
process.exit(pass1 && pass2 ? 0 : 1);
