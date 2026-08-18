"use client";

import { useEffect, useState } from "react";
import type { Arrow, BoardDimensions } from "@/components/arrow-escape/types/game";
import { useGameEngine } from "@/components/arrow-escape/hooks/useGameEngine";
import { useZoomPan } from "@/components/arrow-escape/hooks/useZoomPan";
import ArrowShape from "@/components/arrow-escape/components/ArrowShape";
import BoosterBar from "@/components/arrow-escape/components/BoosterBar";
import ZoomControls from "@/components/arrow-escape/components/ZoomControls";
import * as sound from "@/components/arrow-escape/utils/sound";

export interface LevelBoardProps {
  arrows: Arrow[];
  dimensions: BoardDimensions;
  interactive: boolean;
  onBlocked: () => void;
  onAllCleared: () => void;
  initialHintCount: number;
  initialEraserCount: number;
  onHintCountChange: (count: number) => void;
  onEraserCountChange: (count: number) => void;
  onArrowTap?: () => void;
  onBoosterTap?: () => void;
}

/**
 * LevelBoard — everything specific to rendering and playing ONE level: the
 * SVG board, arrows, booster bar, and zoom/pan camera. Deliberately has no
 * concept of hearts, a timer, or session-wide win/lose; it just reports
 * onBlocked / onAllCleared upward and lets the caller (GameBoard, via
 * useGameSession) decide what those mean for the run as a whole.
 *
 * The parent mounts this with `key={levelIndex}` so a level transition is a
 * clean remount — a fresh useGameEngine instance for the new level's arrows
 * — rather than needing manual reset plumbing.
 */
export default function LevelBoard({
  arrows: initialArrows,
  dimensions,
  interactive,
  onBlocked,
  onAllCleared,
  initialHintCount,
  initialEraserCount,
  onHintCountChange,
  onEraserCountChange,
  onArrowTap,
  onBoosterTap,
}: LevelBoardProps) {
  const {
    arrows,
    flash,
    lastOutcome,
    exitingArrowIds,
    erasingArrowIds,
    handleArrowClick,
    handleExitAnimationComplete,
    hintCount,
    eraserCount,
    gridEnabled,
    activeBooster,
    hintedArrowId,
    useHintBooster,
    toggleEraserBooster,
    toggleGrid,
  } = useGameEngine(initialArrows, dimensions, {
    interactive,
    onBlocked,
    onAllCleared,
    initialHintCount,
    initialEraserCount,
  });

  const zoomPan = useZoomPan();
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    onHintCountChange(hintCount);
  }, [hintCount, onHintCountChange]);
  useEffect(() => {
    onEraserCountChange(eraserCount);
  }, [eraserCount, onEraserCountChange]);

  // Sound: outcome-based SFX (success / blocked click feedback).
  useEffect(() => {
    if (!lastOutcome) return;
    if (lastOutcome.kind === "moved") sound.playSuccess();
    else if (lastOutcome.kind === "blocked") sound.playBlocked();
    // Only fire when lastOutcome itself changes — lastOutcome is a fresh
    // object per move, so reference equality naturally gives one-shot firing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastOutcome]);

  useEffect(() => {
    if (!flash) return;
    setShowFlash(true);
    const t = setTimeout(() => setShowFlash(false), 350);
    return () => clearTimeout(t);
  }, [flash]);

  const onArrowClick = (arrowId: number) => {
    sound.playClick();
    onArrowTap?.();
    handleArrowClick(arrowId);
  };

  const onBoosterClick = (fn: () => void) => {
    sound.playClick();
    onBoosterTap?.();
    fn();
  };

  const blockedArrowId =
    showFlash && lastOutcome?.kind === "blocked" ? lastOutcome.arrowId : null;

  const eraserArmed = activeBooster === "eraser";

  const onBoardClickCapture = (e: React.MouseEvent) => {
    if (zoomPan.wasDragging()) {
      e.stopPropagation();
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        ref={zoomPan.containerRef}
        className={[
          "relative rounded-2xl border p-2 shadow-2xl overflow-hidden touch-none select-none",
          eraserArmed ? "border-red-400/60" : "border-board-line",
        ].join(" ")}
        style={{
          width: "min(90vw, 560px)",
          aspectRatio: `${dimensions.cols} / ${dimensions.rows}`,
          background: "#212233",
        }}
        onWheel={zoomPan.handlers.onWheel}
        onMouseDown={zoomPan.handlers.onMouseDown}
        onTouchStart={zoomPan.handlers.onTouchStart}
        onTouchMove={zoomPan.handlers.onTouchMove}
        onTouchEnd={zoomPan.handlers.onTouchEnd}
        onClickCapture={onBoardClickCapture}
      >
        <div
          style={{
            transform: zoomPan.transform,
            transformOrigin: "0 0",
            width: "100%",
            height: "100%",
            cursor: zoomPan.isZoomed ? "grab" : eraserArmed ? "crosshair" : "default",
          }}
        >
          <svg
            viewBox={`0 0 ${dimensions.cols} ${dimensions.rows}`}
            className="w-full h-full block"
          >
            {gridEnabled && (
              <g opacity={0.25} stroke="#3a3d63" strokeWidth={0.02}>
                {Array.from({ length: dimensions.cols + 1 }).map((_, i) => (
                  <line key={`v${i}`} x1={i} y1={0} x2={i} y2={dimensions.rows} />
                ))}
                {Array.from({ length: dimensions.rows + 1 }).map((_, i) => (
                  <line key={`h${i}`} x1={0} y1={i} x2={dimensions.cols} y2={i} />
                ))}
              </g>
            )}

            {arrows.map((arrow) => (
              <ArrowShape
                key={arrow.id}
                arrow={arrow}
                isBlockedFlash={blockedArrowId === arrow.id}
                isHinted={hintedArrowId === arrow.id}
                isErasing={arrow.id in erasingArrowIds}
                onClick={onArrowClick}
                isExiting={arrow.id in exitingArrowIds}
                onExitComplete={() => handleExitAnimationComplete(arrow.id)}
              />
            ))}
          </svg>
        </div>

        <ZoomControls
          onZoomIn={zoomPan.zoomIn}
          onZoomOut={zoomPan.zoomOut}
          onReset={zoomPan.resetZoom}
          isZoomed={zoomPan.isZoomed}
        />
      </div>

      <BoosterBar
        hintCount={hintCount}
        eraserCount={eraserCount}
        gridEnabled={gridEnabled}
        eraserActive={eraserArmed}
        disabled={!interactive}
        onHint={() => onBoosterClick(useHintBooster)}
        onToggleEraser={() => onBoosterClick(toggleEraserBooster)}
        onToggleGrid={() => onBoosterClick(toggleGrid)}
      />
    </div>
  );
}
