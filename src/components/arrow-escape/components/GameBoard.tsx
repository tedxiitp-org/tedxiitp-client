"use client";

import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import { ALL_LEVELS } from "@/components/arrow-escape/levels";
import { calculateTotalPoints } from "@/components/arrow-escape/utils/points"; 
import { instantiateLevel } from "@/components/arrow-escape/engine/LevelLoader";
import { useGameSession } from "@/components/arrow-escape/hooks/useGameSession";
import { usePersistedProgress } from "@/components/arrow-escape/hooks/usePersistedProgress";
import LevelBoard from "@/components/arrow-escape/components/LevelBoard";
import GameOverModal from "@/components/arrow-escape/components/GameOverModal";
import SettingsPanel from "@/components/arrow-escape/components/SettingsPanel";
import * as sound from "@/components/arrow-escape/utils/sound";

const TOTAL_HEARTS = 3; // shared across ALL 17 levels combined, not per-level

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GameBoard() {
  const {
    persisted,
    isLoaded,
    addCoins,
    setHintCount: persistHintCount,
    setEraserCount: persistEraserCount,
    setSoundSetting,
    setMusicSetting,
  } = usePersistedProgress();

  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#14151f]">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </main>
    );
  }

  return (
    <GameBoardInner
      coinsBank={persisted.coins}
      initialHintCount={persisted.boosters.hintCount}
      initialEraserCount={persisted.boosters.eraserCount}
      soundEnabled={persisted.settings.soundEnabled}
      musicEnabled={persisted.settings.musicEnabled}
      onCoinsEarned={addCoins}
      onHintCountChange={persistHintCount}
      onEraserCountChange={persistEraserCount}
      onSoundSettingChange={setSoundSetting}
      onMusicSettingChange={setMusicSetting}
    />
  );
}

interface GameBoardInnerProps {
  coinsBank: number;
  initialHintCount: number;
  initialEraserCount: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onCoinsEarned: (amount: number) => void;
  onHintCountChange: (count: number) => void;
  onEraserCountChange: (count: number) => void;
  onSoundSettingChange: (enabled: boolean) => void;
  onMusicSettingChange: (enabled: boolean) => void;
}

function GameBoardInner({
  coinsBank,
  initialHintCount,
  initialEraserCount,
  soundEnabled,
  musicEnabled,
  onCoinsEarned,
  onHintCountChange,
  onEraserCountChange,
  onSoundSettingChange,
  onMusicSettingChange,
}: GameBoardInnerProps) {
  const session = useGameSession(ALL_LEVELS, { totalHearts: TOTAL_HEARTS });

  const [showSettings, setShowSettings] = useState(false);

  const [liveHintCount, setLiveHintCount] = useState(initialHintCount);
  const [liveEraserCount, setLiveEraserCount] = useState(initialEraserCount);
  useEffect(() => {
    onHintCountChange(liveHintCount);
  }, [liveHintCount, onHintCountChange]);
  useEffect(() => {
    onEraserCountChange(liveEraserCount);
  }, [liveEraserCount, onEraserCountChange]);

  const coinsAwardedRef = useRef(false);
  useEffect(() => {
    if (session.sessionStatus === "won" && !coinsAwardedRef.current) {
      coinsAwardedRef.current = true;
      onCoinsEarned(session.totalCoinsEarned);
    }
  }, [session.sessionStatus, session.totalCoinsEarned, onCoinsEarned]);

  const gameOverSoundRef = useRef(false);
  useEffect(() => {
    if (session.sessionStatus === "playing") {
      gameOverSoundRef.current = false;
      return;
    }
    if (gameOverSoundRef.current) return;
    gameOverSoundRef.current = true;
    if (session.sessionStatus === "won") sound.playWin();
    else sound.playLose();
  }, [session.sessionStatus]);

  const musicStartedRef = useRef(false);
  const ensureMusicStarted = () => {
    if (musicEnabled && !musicStartedRef.current) {
      musicStartedRef.current = true;
      sound.startMusic();
    }
  };
  useEffect(() => {
    if (!musicEnabled) {
      sound.stopMusic();
      musicStartedRef.current = false;
    }
  }, [musicEnabled]);

  const handleReset = () => {
    sound.playClick();
    coinsAwardedRef.current = false;
    session.resetSession();
  };

  const isGameOver = session.sessionStatus !== "playing";
  const levelsCleared = isGameOver
    ? session.sessionStatus === "won"
      ? session.totalLevels
      : session.levelIndex
    : session.levelIndex;

   const pointsBreakdown = isGameOver
    ? calculateTotalPoints(levelsCleared, session.elapsedSeconds, session.sessionStatus === "won")
    : null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-5 p-6 bg-[#14151f] text-white font-sans">
      <div className="w-full max-w-[560px] flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Arrow Escape</h1>
          <p className="text-xs text-white/40 mt-0.5">
            Level {session.levelIndex + 1} of {session.totalLevels}
            {session.currentLevel ? ` · ${session.currentLevel.board.rows}×${session.currentLevel.board.cols}` : ""}
          </p>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            setShowSettings(true);
          }}
          aria-label="Settings"
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="flex items-center gap-5 text-sm bg-white/5 rounded-full px-5 py-2 flex-wrap justify-center">
        <span aria-label="hearts">
          {Array.from({ length: session.maxHearts }).map((_, i) => (
            <span
              key={i}
              className={i < session.hearts ? "text-red-500" : "text-white/15"}
              style={{ transition: "color 200ms" }}
            >
              ♥
            </span>
          ))}
        </span>
        <span className="text-white/70" title="Total time this run">
          {formatTime(session.elapsedSeconds)}
        </span>
        <span className="text-yellow-300 font-semibold">{coinsBank} coins</span>
      </div>

      {session.currentLevel &&
        (() => {
          const currentLevel = session.currentLevel;
          let validatedArrows;
          try {
            validatedArrows = instantiateLevel(currentLevel);
          } catch (err) {
            return (
              <div className="w-[min(90vw,560px)] rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                <p className="text-red-300 font-semibold mb-1">
                  {currentLevel.id} failed to load
                </p>
                <p className="text-red-200/70 text-sm">
                  {err instanceof Error ? err.message : String(err)}
                </p>
              </div>
            );
          }
          return (
            <LevelBoard
              key={session.levelIndex}
              arrows={validatedArrows}
              dimensions={currentLevel.board}
              interactive={session.sessionStatus === "playing"}
              onBlocked={session.handleBlocked}
              onAllCleared={() => session.handleLevelCleared(currentLevel.coinReward)}
              initialHintCount={liveHintCount}
              initialEraserCount={liveEraserCount}
              onHintCountChange={setLiveHintCount}
              onEraserCountChange={setLiveEraserCount}
              onArrowTap={ensureMusicStarted}
              onBoosterTap={ensureMusicStarted}
            />
          );
        })()}

      {isGameOver && (
        <GameOverModal
          status={session.sessionStatus as "won" | "lost-hearts"}
          levelsCleared={levelsCleared}
          totalLevels={session.totalLevels}
          elapsedSeconds={session.elapsedSeconds}
          coinsEarned={session.totalCoinsEarned}
          totalPoints={pointsBreakdown?.totalPoints ?? 0}
          bonusPoints={pointsBreakdown?.bonusPoints ?? 0}
          onPlayAgain={handleReset}
        />
      )}

      {showSettings && (
        <SettingsPanel
          soundEnabled={soundEnabled}
          musicEnabled={musicEnabled}
          coins={coinsBank}
          onToggleSound={() => onSoundSettingChange(!soundEnabled)}
          onToggleMusic={() => onMusicSettingChange(!musicEnabled)}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  );
}
