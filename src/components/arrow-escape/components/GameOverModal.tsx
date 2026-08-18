"use client";

import type { SessionStatus } from "@/components/arrow-escape/hooks/useGameSession";

interface GameOverModalProps {
  status: Extract<SessionStatus, "won" | "lost-hearts">;
  levelsCleared: number;
  totalLevels: number;
  /** Total time for the whole run — only meaningful (and only shown) on a win. */
  elapsedSeconds: number;
  coinsEarned: number;
  totalPoints: number;
  bonusPoints: number;   
  onPlayAgain: () => void;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const COPY: Record<
  GameOverModalProps["status"],
  { title: string; subtitle: string; accent: string; buttonLabel: string }
> = {
  won: {
    title: "All Levels Cleared!",
    subtitle: "Every arrow across every level found its way out.",
    accent: "#3bff7a",
    buttonLabel: "Play Again from Level 1",
  },
  "lost-hearts": {
    title: "Out of Hearts",
    subtitle: "Too many blocked moves across the run — start again from level 1.",
    accent: "#ff3b3b",
    buttonLabel: "Try Again",
  },
};

/**
 * Shown once per SESSION, not per level — hearts and the timer are shared
 * across the whole run, so game-over only happens at the run level.
 *
 * On a win, "Time" is the single shared timer's final value — the total
 * time it took to clear every level, started once at level 1 and never
 * reset in between. On a loss, no time stat is shown: the run didn't
 * finish, so only a restart-from-level-1 action is offered.
 */
export default function GameOverModal({
  status,
  levelsCleared,
  totalLevels,
  elapsedSeconds,
  coinsEarned,
  totalPoints,
  bonusPoints,
  onPlayAgain,
}: GameOverModalProps) {
  const copy = COPY[status];
  const showTime = status === "won";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[min(90vw,360px)] rounded-3xl bg-[#1c1d30] border border-white/10 shadow-2xl p-6 text-center text-white">
        <div
          className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${copy.accent}22`, color: copy.accent }}
        >
          {status === "won" ? "★" : "♡"}
        </div>

        <h2 className="text-xl font-bold">{copy.title}</h2>
        <p className="text-sm text-white/50 mt-1">{copy.subtitle}</p>

        <div className={showTime ? "grid grid-cols-2 gap-3 mt-6 text-sm" : "grid grid-cols-1 gap-3 mt-6 text-sm"}>
          <div className="rounded-xl bg-white/5 py-3">
            <p className="text-white/40 text-xs mb-1">Levels</p>
            <p className="font-semibold">
              {levelsCleared}/{totalLevels}
            </p>
          </div>
          {showTime && (
            <div className="rounded-xl bg-white/5 py-3">
              <p className="text-white/40 text-xs mb-1">Total Time</p>
              <p className="font-semibold">{formatTime(elapsedSeconds)}</p>
            </div>
          )}
        </div>

        {coinsEarned > 0 && (
          <div className="mt-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 py-3 text-yellow-300 font-semibold text-sm">
            +{coinsEarned} coins
          </div>
        )}

        {totalPoints > 0 && (
          <div className="mt-3 rounded-xl bg-sky-400/10 border border-sky-400/20 py-3 text-sky-300 font-semibold text-sm">
            +{totalPoints} points
            {bonusPoints > 0 && (
              <span className="block text-xs font-normal text-sky-300/70 mt-0.5">
                (includes +{bonusPoints} speed bonus)
              </span>
            )}
          </div>
        )}

        <button
          onClick={onPlayAgain}
          className="mt-6 w-full rounded-2xl bg-white text-[#14151f] font-semibold py-3 hover:bg-white/90 transition-colors"
        >
          {copy.buttonLabel}
        </button>
      </div>
    </div>
  );
}
