"use client";

import { useCallback, useEffect, useState } from "react";
import type { LevelDefinition } from "@/components/arrow-escape/types/game";

export type SessionStatus = "playing" | "won" | "lost-hearts";

export interface UseGameSessionOptions {
  totalHearts: number;
}

/**
 * useGameSession — owns everything that spans MULTIPLE levels: hearts,
 * which level is currently active, ONE shared timer for the whole run, and
 * total coins earned.
 *
 * Timing model: a single timer starts the moment level 1 begins and keeps
 * running continuously through every level transition — it is never reset
 * or restarted per level. It only stops when the session ends (win or
 * loss), and the final value is "the time it took to finish all levels".
 *
 * Losing (hearts hit 0) ends the whole run — the only way to play again is
 * resetSession(), which starts fresh from level 1 with a fresh timer.
 */
export function useGameSession(levels: LevelDefinition[], options: UseGameSessionOptions) {
  const { totalHearts } = options;

  const [levelIndex, setLevelIndex] = useState(0);
  const [hearts, setHearts] = useState(totalHearts);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("playing");

  const currentLevel = levels[Math.min(levelIndex, levels.length - 1)];

  // ONE timer for the entire run. Ticks continuously across every level
  // transition (levelIndex is deliberately NOT a dependency here) and stops
  // the instant the session leaves "playing".
  useEffect(() => {
    if (sessionStatus !== "playing") return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStatus]);

  const handleBlocked = useCallback(() => {
    setHearts((h) => {
      const next = Math.max(0, h - 1);
      if (next <= 0) {
        setSessionStatus((st) => (st === "playing" ? "lost-hearts" : st));
      }
      return next;
    });
  }, []);

  const handleLevelCleared = useCallback(
    (coinsFromLevel: number) => {
      setTotalCoinsEarned((c) => c + coinsFromLevel);
      setLevelIndex((idx) => {
        const isLast = idx >= levels.length - 1;
        if (isLast) {
          setSessionStatus((st) => (st === "playing" ? "won" : st));
          return idx;
        }
        return idx + 1;
      });
    },
    [levels.length]
  );

  const handleArrowCleared = useCallback(() => {
    setTotalCoinsEarned((c) => c + 1);
  }, []);

  const resetSession = useCallback(() => {
    setLevelIndex(0);
    setHearts(totalHearts);
    setElapsedSeconds(0);
    setTotalCoinsEarned(0);
    setSessionStatus("playing");
  }, [totalHearts]);

  return {
    currentLevel,
    levelIndex,
    totalLevels: levels.length,
    hearts,
    maxHearts: totalHearts,
    elapsedSeconds,
    totalCoinsEarned,
    sessionStatus,
    handleBlocked,
    handleLevelCleared,
    handleArrowCleared,
    resetSession,
  };
}
