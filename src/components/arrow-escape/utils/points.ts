"use client";

/**
 * points.ts — the run-level points system, layered on top of useGameSession's
 * hearts/timer/coins. Kept separate on purpose so it can be unit-tested and
 * doesn't disturb the existing coin logic.
 *
 * Rules:
 * 1. Levels 1–10 cleared: 3 points each. Levels 11+ cleared: 5 points each.
 * 2. Bonus only applies once the player has cleared at least 10 levels AND
 *    the game has ended (win, or loss with hearts at 0).
 * 3. "levelsReached" = the level the player was on when the run ended —
 *    equal to levelsCleared on a win, or levelsCleared + 1 on a loss (they
 *    were mid-attempt on the next level when hearts hit 0). This matches the
 *    "lost at level 11 -> average time is 11 minutes" example.
 * 4. averageSeconds = levelsReached * 60 (1 minute/level).
 * 5. Bonus is only awarded if elapsedSeconds < averageSeconds (finished
 *    faster than average). bonusPoints = (averageSeconds - elapsedSeconds)
 *    / 60 * 2, rounded to the nearest whole point.
 */

export const POINTS_PER_LEVEL_FIRST_10 = 3;
export const POINTS_PER_LEVEL_AFTER_10 = 5;
export const LEVEL_THRESHOLD = 10;
export const AVERAGE_SECONDS_PER_LEVEL = 60;
export const BONUS_MULTIPLIER = 2;

export interface PointsBreakdown {
  levelPoints: number;
  bonusPoints: number;
  totalPoints: number;
  bonusEligible: boolean;
}

/** Points earned purely from levels cleared (rule 1). */
export function calculateLevelPoints(levelsCleared: number): number {
  const first10 = Math.min(levelsCleared, LEVEL_THRESHOLD);
  const after10 = Math.max(0, levelsCleared - LEVEL_THRESHOLD);
  return first10 * POINTS_PER_LEVEL_FIRST_10 + after10 * POINTS_PER_LEVEL_AFTER_10;
}

/**
 * Bonus points for finishing faster than the 1-min-per-level average
 * (rules 2–4). Returns 0 if the player never cleared 10 levels, or if they
 * were slower than average.
 */
export function calculateBonusPoints(
  levelsCleared: number,
  elapsedSeconds: number,
  wonGame: boolean
): number {
  if (levelsCleared < LEVEL_THRESHOLD) return 0;

  const levelsReached = wonGame ? levelsCleared : levelsCleared + 1;
  const averageSeconds = levelsReached * AVERAGE_SECONDS_PER_LEVEL;
  if (elapsedSeconds >= averageSeconds) return 0;

  const secondsSaved = averageSeconds - elapsedSeconds;
  return Math.round((secondsSaved / AVERAGE_SECONDS_PER_LEVEL) * BONUS_MULTIPLIER);
}

/**
 * Full breakdown for a finished run (win, or loss with hearts at 0). Call
 * this once the session has left "playing" — it's meaningless mid-run.
 */
export function calculateTotalPoints(
  levelsCleared: number,
  elapsedSeconds: number,
  wonGame: boolean
): PointsBreakdown {
  const levelPoints = calculateLevelPoints(levelsCleared);
  const bonusPoints = calculateBonusPoints(levelsCleared, elapsedSeconds, wonGame);
  return {
    levelPoints,
    bonusPoints,
    totalPoints: levelPoints + bonusPoints,
    bonusEligible: levelsCleared >= LEVEL_THRESHOLD,
  };
}