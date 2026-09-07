"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Arrow, BoardDimensions, MoveOutcome, Position } from "@/components/arrow-escape/types/game";
import { BoardEngine, EMPTY_CELL } from "@/components/arrow-escape/engine/BoardEngine";
import { attemptMove, isBoardCleared } from "@/components/arrow-escape/engine/MovementEngine";
import { findHintArrow } from "@/components/arrow-escape/engine/HintEngine";

const HINT_HIGHLIGHT_MS = 2500;
const ERASE_FADE_MS = 240;

/** Transient visual feedback for the most recent move attempt. */
export interface FlashState {
  kind: "green" | "red";
  cells: Position[];
  token: number;
}

export type ActiveBooster = "hint" | "eraser" | null;

export interface UseGameEngineOptions {
  /** Whether clicks should be processed at all — false once the overall session is over. */
  interactive: boolean;
  /** Called once per blocked click (the caller owns hearts — this level doesn't). */
  onBlocked: () => void;
  /** Called exactly once, the moment every arrow on this level has been removed. */
  onAllCleared: () => void;
  onArrowCleared?: () => void;
  initialHintCount?: number;
  initialEraserCount?: number;
}

/**
 * useGameEngine — PURELY per-level logic: arrow state, moves, collision,
 * exit animations, and boosters. It has no concept of hearts, a timer, or
 * session-wide win/lose — those are owned by useGameSession, one level up.
 * This hook just reports what happened (onBlocked / onAllCleared) and lets
 * the caller decide what that means for the bigger picture.
 */
export function useGameEngine(
  initialArrows: Arrow[],
  dimensions: BoardDimensions,
  options: UseGameEngineOptions
) {
  const { interactive, onBlocked, onAllCleared, onArrowCleared, initialHintCount = 3, initialEraserCount = 3 } = options;

  const [arrows, setArrows] = useState<Arrow[]>(initialArrows);
  const [flash, setFlash] = useState<FlashState | null>(null);
  const [lastOutcome, setLastOutcome] = useState<MoveOutcome | null>(null);
  // Arrow ids currently mid "pulled out like a thread" exit animation. The
  // arrow's own geometry (via ArrowShape) drives how it erases — this hook
  // only needs to know WHICH ids are exiting, nothing about direction/distance.
  const [exitingArrowIds, setExitingArrowIds] = useState<Record<number, true>>({});

  // --- Boosters ---
  const [hintCount, setHintCount] = useState(initialHintCount);
  const [eraserCount, setEraserCount] = useState(initialEraserCount);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [activeBooster, setActiveBooster] = useState<ActiveBooster>(null);
  const [hintedArrowId, setHintedArrowId] = useState<number | null>(null);
  const [erasingArrowIds, setErasingArrowIds] = useState<Record<number, true>>({});

  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eraseTimeoutsRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      Object.values(eraseTimeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  const board = useMemo(() => new BoardEngine(dimensions, arrows), [arrows, dimensions]);

  const total = initialArrows.length;
  const cleared = arrows.filter((a) => a.removed).length;

  const interactiveRef = useRef(interactive);
  interactiveRef.current = interactive;

  // Fire onAllCleared exactly once, the instant this level's board empties.
  const clearedFiredRef = useRef(false);
  useEffect(() => {
    if (isBoardCleared(arrows) && !clearedFiredRef.current) {
      clearedFiredRef.current = true;
      onAllCleared();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrows]);

  const performMove = useCallback(
    (arrowId: number) => {
      const { outcome, nextArrows } = attemptMove(arrowId, arrows, board);
      setLastOutcome(outcome);

      if (outcome.kind === "already-removed") return;

      if (outcome.kind === "moved") {
        const previouslyRemoved = arrows.filter(a => a.removed).length;
        const nowRemoved = nextArrows.filter(a => a.removed).length;
        if (nowRemoved > previouslyRemoved) {
          onArrowCleared?.();
        }

        setArrows(nextArrows);
        setFlash((prev) => ({
          kind: "green",
          cells: outcome.sweptCells,
          token: (prev?.token ?? 0) + 1,
        }));
        setExitingArrowIds((prev) => ({ ...prev, [arrowId]: true }));
        return;
      }

      // blocked
      onBlocked();
      setFlash((prev) => ({
        kind: "red",
        cells: outcome.blockedAtCells,
        token: (prev?.token ?? 0) + 1,
      }));
    },
    [arrows, board, onBlocked, onArrowCleared]
  );

  const performErase = useCallback(
    (arrowId: number) => {
      const target = arrows.find((a) => a.id === arrowId);
      if (!target || target.removed) return;

      setArrows((prev) => prev.map((a) => (a.id === arrowId ? { ...a, removed: true } : a)));
      onArrowCleared?.();
      setEraserCount((n) => Math.max(0, n - 1));
      setActiveBooster(null);
      setLastOutcome({
        kind: "moved",
        arrowId,
        direction: target.headDirection,
        exitCellCount: 0,
        sweptCells: [],
      });

      setErasingArrowIds((prev) => ({ ...prev, [arrowId]: true }));
      const timeoutId = setTimeout(() => {
        setErasingArrowIds((prev) => {
          if (!(arrowId in prev)) return prev;
          const next = { ...prev };
          delete next[arrowId];
          return next;
        });
        delete eraseTimeoutsRef.current[arrowId];
      }, ERASE_FADE_MS);
      eraseTimeoutsRef.current[arrowId] = timeoutId;
    },
    [arrows, onArrowCleared]
  );

  const handleArrowClick = useCallback(
    (arrowId: number) => {
      if (!interactiveRef.current) return;

      if (activeBooster === "eraser") {
        performErase(arrowId);
        return;
      }

      performMove(arrowId);
    },
    [activeBooster, performErase, performMove]
  );

  const handleExitAnimationComplete = useCallback((arrowId: number) => {
    setExitingArrowIds((prev) => {
      if (!(arrowId in prev)) return prev;
      const next = { ...prev };
      delete next[arrowId];
      return next;
    });
  }, []);

  const handleCellClick = useCallback(
    (pos: Position) => {
      const arrowId = board.getArrowIdAt(pos);
      if (arrowId === EMPTY_CELL) return;
      handleArrowClick(arrowId);
    },
    [board, handleArrowClick]
  );

  const useHintBooster = useCallback(() => {
    if (!interactiveRef.current) return;
    if (hintCount <= 0) return;

    const candidate = findHintArrow(arrows, board);
    if (!candidate) return;

    setHintCount((n) => Math.max(0, n - 1));
    setHintedArrowId(candidate.id);

    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = setTimeout(() => {
      setHintedArrowId(null);
    }, HINT_HIGHLIGHT_MS);
  }, [arrows, board, hintCount]);

  const toggleEraserBooster = useCallback(() => {
    if (!interactiveRef.current) return;
    if (eraserCount <= 0 && activeBooster !== "eraser") return;
    setActiveBooster((prev) => (prev === "eraser" ? null : "eraser"));
  }, [activeBooster, eraserCount]);

  const toggleGrid = useCallback(() => {
    setGridEnabled((g) => !g);
  }, []);

  const renderableArrows = useMemo(
    () =>
      arrows.filter((a) => !a.removed || a.id in exitingArrowIds || a.id in erasingArrowIds),
    [arrows, exitingArrowIds, erasingArrowIds]
  );

  return {
    arrows: renderableArrows,
    board,
    cleared,
    total,
    flash,
    lastOutcome,
    exitingArrowIds,
    erasingArrowIds,
    handleArrowClick,
    handleCellClick,
    handleExitAnimationComplete,
    // boosters
    hintCount,
    eraserCount,
    gridEnabled,
    activeBooster,
    hintedArrowId,
    useHintBooster,
    toggleEraserBooster,
    toggleGrid,
  };
}
