// Run with: npx tsx scripts/verify-generator.ts
// Imports the REAL engine modules (not a reimplementation) to catch actual bugs.
import { generateLevel, generateFullCoverageLevel } from "../engine/LevelGenerator";
import { findMovableArrows } from "../engine/HintEngine";
import { attemptMove } from "../engine/MovementEngine";
import { BoardEngine } from "../engine/BoardEngine";
import { getOccupiedCells } from "../engine/ArrowEngine";
import type { BoardDimensions } from "../types/game";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface TestCase {
  dims: BoardDimensions;
  arrowCount: number;
}

const cases: TestCase[] = [
  { dims: { rows: 6, cols: 6 }, arrowCount: 4 },
  { dims: { rows: 8, cols: 8 }, arrowCount: 10 },
  { dims: { rows: 10, cols: 10 }, arrowCount: 18 },
  { dims: { rows: 10, cols: 10 }, arrowCount: 40 }, // deliberately over-dense
  { dims: { rows: 20, cols: 20 }, arrowCount: 60 },
  { dims: { rows: 30, cols: 30 }, arrowCount: 120 },
  { dims: { rows: 50, cols: 50 }, arrowCount: 300 },
];

let totalRuns = 0;
let totalFailures = 0;
let totalArrowsGenerated = 0;

for (const testCase of cases) {
  for (let trial = 0; trial < 8; trial++) {
    totalRuns++;
    const seed = testCase.dims.rows * 100000 + testCase.arrowCount * 100 + trial;
    const rng = mulberry32(seed);

    const arrows = generateLevel({
      dimensions: testCase.dims,
      arrowCount: testCase.arrowCount,
      rng,
    });
    totalArrowsGenerated += arrows.length;

    // 1. Structural check: no two arrows may occupy the same cell.
    const seen = new Set<string>();
    let overlapFound = false;
    for (const a of arrows) {
      let cur = a.tail;
      const cells = [cur];
      for (const dir of a.path) {
        const v = { UP: [-1, 0], DOWN: [1, 0], LEFT: [0, -1], RIGHT: [0, 1] }[dir];
        cur = { row: cur.row + (v?.[0] ?? 0), col: cur.col + (v?.[1] ?? 0) };
        cells.push(cur);
      }
      for (const c of cells) {
        const key = `${c.row},${c.col}`;
        if (seen.has(key)) {
          overlapFound = true;
        }
        seen.add(key);
      }
    }
    if (overlapFound) {
      console.error(`FAIL (overlap) case=${JSON.stringify(testCase)} trial=${trial}`);
      totalFailures++;
      continue;
    }

    // 2. Solvability check: greedily clear movable arrows in RANDOM order
    //    (not the construction order) until stuck or cleared.
    let working = arrows.map((a) => ({ ...a }));
    let iterations = 0;
    const maxIterations = arrows.length + 5;

    while (working.some((a) => !a.removed) && iterations < maxIterations) {
      iterations++;
      const board = new BoardEngine(testCase.dims, working);
      const movable = findMovableArrows(working, board);
      if (movable.length === 0) break; // deadlock — should never happen

      // Pick a RANDOM movable arrow each time (adversarial-ish vs. the
      // construction order) to test the order-independence property.
      const pick = movable[Math.floor(rng() * movable.length)];
      if (!pick) break;
      const { nextArrows, outcome } = attemptMove(pick.id, working, board);
      if (outcome.kind !== "moved") {
        console.error(`FAIL (hint engine picked a blocked arrow!) case=${JSON.stringify(testCase)}`);
        totalFailures++;
        break;
      }
      working = nextArrows;
    }

    const allCleared = working.every((a) => a.removed);
    if (!allCleared) {
      console.error(
        `FAIL (deadlock) case=${JSON.stringify(testCase)} trial=${trial} remaining=${working.filter((a) => !a.removed).length}/${arrows.length}`
      );
      totalFailures++;
    }
  }
}

console.log(`\n=== Generator verification ===`);
console.log(`Total runs: ${totalRuns}`);
console.log(`Total arrows generated across all runs: ${totalArrowsGenerated}`);
console.log(`Failures: ${totalFailures}`);
console.log(totalFailures === 0 ? "ALL PASS ✔" : "SOME FAILED ✘");

// ============================================================
// Full-coverage tiling generator: verify (a) EVERY cell is covered exactly
// once, and (b) solvability, in both orientations, at all target sizes.
// ============================================================
console.log(`\n=== Full-coverage generator verification ===`);

const tilingCases: { dims: BoardDimensions; orientation: "row" | "column" }[] = [
  { dims: { rows: 8, cols: 8 }, orientation: "row" },
  { dims: { rows: 8, cols: 8 }, orientation: "column" },
  { dims: { rows: 12, cols: 12 }, orientation: "row" },
  { dims: { rows: 12, cols: 12 }, orientation: "column" },
  { dims: { rows: 16, cols: 16 }, orientation: "row" },
  { dims: { rows: 16, cols: 16 }, orientation: "column" },
  { dims: { rows: 7, cols: 13 }, orientation: "row" }, // non-square, odd dims
  { dims: { rows: 20, cols: 20 }, orientation: "row" },
];

let tilingRuns = 0;
let tilingFailures = 0;

for (const tc of tilingCases) {
  for (let trial = 0; trial < 5; trial++) {
    tilingRuns++;
    const seed = tc.dims.rows * 7919 + tc.dims.cols * 104729 + trial;
    const rng = mulberry32(seed);
    const arrows = generateFullCoverageLevel({ dimensions: tc.dims, orientation: tc.orientation, rng });

    // (a) Full coverage + no overlap: every cell covered exactly once.
    const coverage = new Map<string, number>();
    for (const a of arrows) {
      for (const cell of getOccupiedCells(a)) {
        const key = `${cell.row},${cell.col}`;
        coverage.set(key, (coverage.get(key) ?? 0) + 1);
      }
    }
    const totalCells = tc.dims.rows * tc.dims.cols;
    let missing = 0;
    let doubled = 0;
    for (let r = 0; r < tc.dims.rows; r++) {
      for (let c = 0; c < tc.dims.cols; c++) {
        const count = coverage.get(`${r},${c}`) ?? 0;
        if (count === 0) missing++;
        if (count > 1) doubled++;
      }
    }
    if (missing > 0 || doubled > 0) {
      console.error(
        `FAIL (coverage) case=${JSON.stringify(tc)} trial=${trial} missing=${missing} doubled=${doubled} totalCells=${totalCells}`
      );
      tilingFailures++;
      continue;
    }

    // (b) Solvability: greedy-random clear, same as the sparse generator test.
    let working = arrows.map((a) => ({ ...a }));
    let iterations = 0;
    const maxIterations = arrows.length + 5;
    while (working.some((a) => !a.removed) && iterations < maxIterations) {
      iterations++;
      const board = new BoardEngine(tc.dims, working);
      const movable = findMovableArrows(working, board);
      if (movable.length === 0) break;
      const pick = movable[Math.floor(rng() * movable.length)];
      if (!pick) break;
      const { nextArrows, outcome } = attemptMove(pick.id, working, board);
      if (outcome.kind !== "moved") {
        console.error(`FAIL (bad hint pick) case=${JSON.stringify(tc)}`);
        tilingFailures++;
        break;
      }
      working = nextArrows;
    }
    const allCleared = working.every((a) => a.removed);
    if (!allCleared) {
      console.error(
        `FAIL (deadlock) case=${JSON.stringify(tc)} trial=${trial} remaining=${working.filter((a) => !a.removed).length}/${arrows.length}`
      );
      tilingFailures++;
    }
  }
}

console.log(`Tiling runs: ${tilingRuns}`);
console.log(`Tiling failures: ${tilingFailures}`);
console.log(tilingFailures === 0 ? "ALL PASS ✔" : "SOME FAILED ✘");

process.exit(totalFailures === 0 && tilingFailures === 0 ? 0 : 1);
