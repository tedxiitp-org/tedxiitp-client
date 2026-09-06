"use client";

import { Lightbulb, Eraser, Grid3x3 } from "lucide-react";

interface BoosterBarProps {
  hintCount: number;
  eraserCount: number;
  gridEnabled: boolean;
  eraserActive: boolean;
  disabled: boolean;
  onHint: () => void;
  onToggleEraser: () => void;
  onToggleGrid: () => void;
}

interface BoosterButtonProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function BoosterButton({ icon, label, count, active, disabled, onClick }: BoosterButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "relative flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-2xl transition-all",
        active
          ? "bg-white text-[#14151f] shadow-lg scale-105"
          : "bg-white/5 text-white hover:bg-white/10",
        disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      {icon}
      <span className="text-[11px] font-medium">{label}</span>
      {typeof count === "number" && (
        <span
          className={[
            "absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold flex items-center justify-center",
            active ? "bg-[#14151f] text-white" : "bg-white text-[#14151f]",
          ].join(" ")}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * The bottom booster bar — Hint / Eraser / Grid, per spec. Zoom controls are
 * a separate future step (camera/pan system), not bundled in here.
 *
 * Deliberately dumb: every button just calls the handler it's given. All
 * the "can I actually use this right now" logic (counts, game-over state,
 * single-use arming) lives in useGameEngine.
 */
export default function BoosterBar({
  hintCount,
  eraserCount,
  gridEnabled,
  eraserActive,
  disabled,
  onHint,
  onToggleEraser,
  onToggleGrid,
}: BoosterBarProps) {
  return (
    <div className="flex items-center gap-3 bg-white/5 rounded-3xl p-3">
      <BoosterButton
        icon={<Lightbulb size={22} />}
        label="Hint"
        count={hintCount}
        disabled={disabled || hintCount <= 0}
        onClick={onHint}
      />
      <BoosterButton
        icon={<Eraser size={22} />}
        label="Eraser"
        count={eraserCount}
        active={eraserActive}
        disabled={disabled || (eraserCount <= 0 && !eraserActive)}
        onClick={onToggleEraser}
      />
      <BoosterButton
        icon={<Grid3x3 size={22} />}
        label="Grid"
        active={gridEnabled}
        disabled={disabled}
        onClick={onToggleGrid}
      />
    </div>
  );
}
