import type { Arrow, BoardDimensions, Position } from "@/components/arrow-escape/types/game";
import { getOccupiedCells } from "@/components/arrow-escape/engine/ArrowEngine";

/**
 * BoardEngine owns the occupancy grid: occupancy[row][col] = arrowId | -1.
 * This is the single structure that gives O(1) "what's in this cell" lookups
 * for collision detection, hint search, and rendering helpers.
 *
 * The grid is a plain 2D array (not a Map) for cache-friendly, allocation-free
 * reads on every collision check, which matters once boards reach 50x50 with
 * many arrows and per-frame movement checks.
 */
export const EMPTY_CELL = -1;

export class BoardEngine {
  readonly dimensions: BoardDimensions;
  private occupancy: Int32Array; // flattened row-major, length rows*cols

  constructor(dimensions: BoardDimensions, arrows: readonly Arrow[]) {
    this.dimensions = dimensions;
    this.occupancy = new Int32Array(dimensions.rows * dimensions.cols).fill(EMPTY_CELL);
    this.rebuild(arrows);
  }

  private index(pos: Position): number {
    return pos.row * this.dimensions.cols + pos.col;
  }

  isInBounds(pos: Position): boolean {
    return (
      pos.row >= 0 &&
      pos.row < this.dimensions.rows &&
      pos.col >= 0 &&
      pos.col < this.dimensions.cols
    );
  }

  /** O(1) lookup of which arrow (if any) occupies a cell. */
  getArrowIdAt(pos: Position): number {
    if (!this.isInBounds(pos)) return EMPTY_CELL;
    return this.occupancy[this.index(pos)] ?? EMPTY_CELL;
  }

  /**
   * Fully recompute the occupancy grid from scratch. Called whenever the set
   * of active arrows changes (arrow removed, level loaded/regenerated).
   * O(total occupied cells), not O(rows*cols*arrows) — cheap even at 50x50.
   */
  rebuild(arrows: readonly Arrow[]): void {
    this.occupancy.fill(EMPTY_CELL);
    for (const arrow of arrows) {
      if (arrow.removed) continue;
      for (const cell of getOccupiedCells(arrow)) {
        if (this.isInBounds(cell)) {
          this.occupancy[this.index(cell)] = arrow.id;
        }
        // Out-of-bounds cells are allowed to exist only transiently during
        // animation; a resting, playable level should never author one.
      }
    }
  }

  /** Snapshot for debugging / dev tools. */
  toGrid(): number[][] {
    const { rows, cols } = this.dimensions;
    const grid: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) {
        row.push(this.occupancy[r * cols + c] ?? EMPTY_CELL);
      }
      grid.push(row);
    }
    return grid;
  }
}
