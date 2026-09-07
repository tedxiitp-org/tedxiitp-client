"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Maximize2, Volume2, X, Gauge } from "lucide-react";
import Leaderboard from "../../../components/Leaderboard";
import { registerUser, submitScore } from "../../../lib/api";

type Point = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";
type Difficulty = "easy" | "medium" | "hard";

const SPEEDS: Record<Difficulty, number> = {
  easy: 180,    // Slow & relaxed
  medium: 120,  // Standard Google Snake pace
  hard: 75,     // Fast arcade pace
};

const COLS = 20;
const ROWS = 15;

const START: Point[] = [
  { x: 5, y: 7 },
  { x: 4, y: 7 },
  { x: 3, y: 7 },
];

function nextPoint(head: Point, direction: Direction): Point {
  switch (direction) {
    case "up":
      return { x: head.x, y: head.y - 1 };
    case "down":
      return { x: head.x, y: head.y + 1 };
    case "left":
      return { x: head.x - 1, y: head.y };
    case "right":
      return { x: head.x + 1, y: head.y };
  }
}

function randomFood(snake: Point[]): Point {
  const available: Point[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!snake.some((part) => part.x === x && part.y === y)) {
        available.push({ x, y });
      }
    }
  }
  return available[Math.floor(Math.random() * available.length)] ?? { x: 14, y: 7 };
}

export default function GoogleSnakeWithLevels() {
  const [snake, setSnake] = useState<Point[]>(START);
  const [food, setFood] = useState<Point>({ x: 14, y: 7 });
  const [direction, setDirection] = useState<Direction>("right");
  const directionRef = useRef<Direction>("right");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const music = new Audio(
      "/diogodasilvasimoes-snake-moombahton-energetic-dance-reggaeton-like-dj-snake-beat-435620.mp3"
    );
    music.loop = true;
    music.volume = 0.45;
    musicRef.current = music;

    return () => {
      music.pause();
      music.currentTime = 0;
      musicRef.current = null;
    };
  }, []);

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;

    if (playing) {
      void music.play().catch(() => {
        // Playback can be blocked until the browser receives a user gesture.
      });
    } else {
      music.pause();
      music.currentTime = 0;
    }
  }, [playing]);

  // Load high score per difficulty
  useEffect(() => {
    const storedBest = Number(
      localStorage.getItem(`tedx_snake_highscore_${difficulty}`) || 0
    );
    setBest(storedBest);

    const storedUsername = localStorage.getItem("tedx_username") || "";
    if (storedUsername) {
      setUsername(storedUsername);
      setUsernameInput(storedUsername);
    }
  }, [difficulty]);

  const changeDirection = useCallback((next: Direction) => {
    const current = directionRef.current;
    const opposite =
      (current === "up" && next === "down") ||
      (current === "down" && next === "up") ||
      (current === "left" && next === "right") ||
      (current === "right" && next === "left");
    if (!opposite) {
      directionRef.current = next;
      setDirection(next);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      const map: Record<string, Direction> = {
        ArrowUp: "up",
        w: "up",
        W: "up",
        ArrowDown: "down",
        s: "down",
        S: "down",
        ArrowLeft: "left",
        a: "left",
        A: "left",
        ArrowRight: "right",
        d: "right",
        D: "right",
      };

      if (map[e.key]) {
        e.preventDefault();
        changeDirection(map[e.key]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [changeDirection]);

  // Touch Swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 20) {
      if (absX > absY) {
        changeDirection(dx > 0 ? "right" : "left");
      } else {
        changeDirection(dy > 0 ? "down" : "up");
      }
    }
    touchStartRef.current = null;
  };

  // Main game tick (frequency depends on difficulty speed)
  useEffect(() => {
    if (!playing) return;

    const tickMs = SPEEDS[difficulty];
    const timer = setInterval(() => {
      setSnake((current) => {
        const head = nextPoint(current[0], directionRef.current);

        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
          setPlaying(false);
          setGameOver(true);
          return current;
        }

        if (current.some((part) => part.x === head.x && part.y === head.y)) {
          setPlaying(false);
          setGameOver(true);
          return current;
        }

        const ate = head.x === food.x && head.y === food.y;
        const updated = [head, ...current];

        if (ate) {
          setScore((s) => {
            const nextScore = s + 1;
            setBest((b) => {
              const high = Math.max(b, nextScore);
              localStorage.setItem(`tedx_snake_highscore_${difficulty}`, String(high));
              return high;
            });
            return nextScore;
          });
          setFood(randomFood(updated));
        } else {
          updated.pop();
        }

        return updated;
      });
    }, tickMs);

    return () => clearInterval(timer);
  }, [food, playing, difficulty]);

  // Submit high score to backend
  useEffect(() => {
    if (playing || score === 0) return;
    const userId = localStorage.getItem("tedx_userid");
    if (!userId) return;

    submitScore("snake", userId, score)
      .then(() => setLeaderboardRefresh((value) => value + 1))
      .catch(() => {});
  }, [playing, score]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = usernameInput.trim();
    if (!clean || authLoading) return;

    setAuthLoading(true);
    const res = await registerUser(clean);
    if (res.data?.userId) {
      localStorage.setItem("tedx_username", clean);
      localStorage.setItem("tedx_userid", String(res.data.userId));
      setUsername(clean);
    }
    setAuthLoading(false);
  };

  const resetGame = () => {
    directionRef.current = "right";
    setDirection("right");
    setSnake(START);
    setFood(randomFood(START));
    setScore(0);
    setGameOver(false);
    setPlaying(true);
  };

  const renderEyes = () => {
    let eyeStyles = "flex-row justify-end pr-1 items-center";
    let pupilStyles = "translate-x-[2px]";

    if (direction === "left") {
      eyeStyles = "flex-row justify-start pl-1 items-center";
      pupilStyles = "-translate-x-[2px]";
    } else if (direction === "up") {
      eyeStyles = "flex-col justify-start pt-1 items-center";
      pupilStyles = "-translate-y-[2px]";
    } else if (direction === "down") {
      eyeStyles = "flex-col justify-end pb-1 items-center";
      pupilStyles = "translate-y-[2px]";
    }

    return (
      <div className={`absolute inset-0 flex gap-0.5 sm:gap-1 ${eyeStyles}`}>
        <div className="w-1.25 h-1.25 sm:w-2 sm:h-2 rounded-full bg-white flex items-center justify-center shadow-xs">
          <div className={`w-0.5 h-0.5 sm:w-[3.5px] sm:h-[3.5px] rounded-full bg-black ${pupilStyles}`} />
        </div>
        <div className="w-1.25 h-1.25 sm:w-2 sm:h-2 rounded-full bg-white flex items-center justify-center shadow-xs">
          <div className={`w-0.5 h-0.5 sm:w-[3.5px] sm:h-[3.5px] rounded-full bg-black ${pupilStyles}`} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-dvh w-full bg-[#1e1e1e] text-white flex flex-col items-center px-2 sm:px-6 py-2 sm:py-4 overflow-x-hidden overflow-y-auto select-none touch-none">
      {/* Registration Ribbon (if needed) */}
      {!username && (
        <form
          onSubmit={handleRegister}
          className="w-full max-w-5xl flex items-center gap-2 bg-[#38591f] px-3 py-1.5 rounded-lg shrink-0 mb-1 text-xs"
        >
          <input
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Set handle for official leaderboard"
            maxLength={18}
            className="flex-1 rounded bg-white/90 px-2 py-1 text-black font-semibold outline-none"
          />
          <button
            type="submit"
            disabled={authLoading || !usernameInput.trim()}
            className="bg-[#2a4319] hover:bg-[#203313] px-3 py-1 rounded text-white font-bold uppercase transition"
          >
            {authLoading ? "..." : "Save"}
          </button>
        </form>
      )}

      {/* Main Container */}
      <div className="flex flex-col items-center justify-center w-full max-w-5xl my-auto">
        <div
          className="flex flex-col rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden border border-white/5"
          style={{ width: "min(96vw, 1000px)" }}
        >
          {/* Top Google Header Bar */}
          <div className="flex h-12 sm:h-14 items-center justify-between bg-[#4a752c] px-3 sm:px-6 text-white shrink-0">
            <div className="flex items-center gap-3 sm:gap-6">
              <Link
                href="/games"
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white text-black shadow hover:bg-gray-100 transition"
              >
                <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
              </Link>

              {/* Apple Score */}
              <div className="flex items-center gap-1.5 font-bold text-base sm:text-2xl">
                <span>🍎</span>
                <span>{score}</span>
              </div>

              {/* Trophy & Level Indicator */}
              <div className="flex items-center gap-1.5 font-bold text-base sm:text-2xl">
                <span>🏆</span>
                <span className="text-white/90">{best}</span>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-black/25 px-2.5 py-1 rounded-full text-white/80">
                <Gauge className="w-3.5 h-3.5 text-yellow-300" />
                <span>{difficulty}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                className="text-white/80 hover:text-white transition"
                aria-label="Sound"
              >
                <Volume2 className="h-5 w-5" />
              </button>
              <Link href="/games" className="text-white/80 hover:text-white transition">
                <X className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Lawn Board Canvas */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative flex max-h-[calc(100dvh-300px)] w-full items-center justify-center bg-[#578a34] p-2 sm:p-4 lg:max-h-[calc(100dvh-190px)]"
            style={{
              aspectRatio: `${COLS} / ${ROWS}`,
            }}
          >
            {/* Checkerboard Cells */}
            <div
              className="grid h-full w-full rounded-xl overflow-hidden shadow-inner"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: ROWS * COLS }).map((_, i) => {
                const x = i % COLS;
                const y = Math.floor(i / COLS);

                const isEven = (x + y) % 2 === 0;
                const cellBg = isEven ? "bg-[#aad751]" : "bg-[#a2d149]";

                const headIndex = snake.findIndex((s) => s.x === x && s.y === y);
                const isHead = headIndex === 0;
                const isBody = headIndex > 0;
                const isFood = food.x === x && food.y === y;

                return (
                  <div key={i} className={`relative h-full w-full ${cellBg}`}>
                    {/* Apple */}
                    {isFood && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative h-[82%] w-[82%] max-h-8 max-w-8 rounded-full bg-[#e7471d] shadow-sm flex items-center justify-center">
                          <div className="absolute top-[-15%] right-[20%] h-[30%] w-[25%] rounded-full bg-[#3fa734] rotate-45" />
                          <div className="absolute top-[18%] left-[18%] h-[20%] w-[20%] rounded-full bg-white/40" />
                        </div>
                      </div>
                    )}

                    {/* Snake Head */}
                    {isHead && (
                      <div className="absolute inset-0 z-10 m-[0.5px] sm:m-px rounded-full bg-[#4e7cf6] shadow-sm">
                        {renderEyes()}
                      </div>
                    )}

                    {/* Snake Body */}
                    {isBody && (
                      <div className="absolute inset-0 m-[0.5px] sm:m-px rounded-[3px] sm:rounded-[6px] bg-[#4e7cf6]" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Fullscreen & Reset Buttons */}
            <div className="hidden sm:flex absolute bottom-6 right-6 z-20 flex-col gap-2">
              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    document.documentElement.requestFullscreen();
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/85 text-black shadow-md hover:bg-white transition"
                aria-label="Fullscreen"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
              <button
                onClick={resetGame}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/85 text-black shadow-md hover:bg-white transition"
                aria-label="Restart"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>

            {/* Start & Game Over Screen Overlay */}
            {(!playing || gameOver) && (
              <div className="absolute inset-2 sm:inset-4 z-30 flex flex-col items-center justify-center rounded-xl bg-black/50 backdrop-blur-[3px] text-white p-4">
                {gameOver ? (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-5xl font-black drop-shadow mb-1">
                      GAME OVER
                    </span>
                    <p className="text-xs sm:text-base font-semibold mb-3 sm:mb-4 text-white/95">
                      Apples: {score} · Best ({difficulty}): {best}
                    </p>

                    {/* Level Selector */}
                    <div className="mb-4 flex items-center bg-black/40 border border-white/10 rounded-full p-1 shadow-inner">
                      {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={`px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition ${
                            difficulty === level
                              ? "bg-[#4e7cf6] text-white shadow"
                              : "text-white/60 hover:text-white"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={resetGame}
                      className="flex items-center gap-2 rounded-full bg-[#4e7cf6] px-6 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold shadow-lg hover:bg-[#3b6ae4] active:scale-95 transition"
                    >
                      <RotateCcw className="h-4 w-4" /> Play Again
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-3xl sm:text-6xl mb-1 sm:mb-2">🍎</span>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-wide mb-1 drop-shadow">
                      TEDx SNAKE
                    </h2>
                    <p className="text-xs sm:text-sm text-white/80 mb-3 text-center max-w-65">
                      Choose your speed level & engage.
                    </p>
                    <p className="mb-3 hidden text-xs font-semibold tracking-wide text-white/90 lg:block">
                      Use ↑ ↓ ← → to move your snake
                    </p>

                    {/* Difficulty Pill Toggle */}
                    <div className="mb-4 sm:mb-6 flex items-center bg-black/40 border border-white/10 rounded-full p-1 shadow-inner">
                      {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={`px-3.5 sm:px-5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition ${
                            difficulty === level
                              ? "bg-[#4e7cf6] text-white shadow-[0_0_12px_rgba(78,124,246,0.6)]"
                              : "text-white/60 hover:text-white"
                          }`}
                        >
                          {level === "easy" ? "🐢 Easy" : level === "medium" ? "⚡ Medium" : "🔥 Hard"}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={resetGame}
                      className="rounded-full bg-[#4e7cf6] px-8 sm:px-10 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:bg-[#3b6ae4] active:scale-95 transition"
                    >
                      Start Game
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="order-2 mt-4 w-full max-w-5xl shrink-0">
        <Leaderboard key={leaderboardRefresh} gameId="snake" />
      </div>

      <p className="hidden text-sm font-semibold tracking-wide text-white/70 lg:block">
        Use ↑ ↓ ← → to move your snake
      </p>

      {/* Mobile D-Pad (Anchored at the bottom without scrolling) */}
      <div className="order-1 flex flex-col items-center gap-1 shrink-0 pb-1 pt-1 lg:hidden">
        <button
          type="button"
          onClick={() => changeDirection("up")}
          className="flex h-11 w-14 items-center justify-center rounded-xl bg-[#4a752c] text-lg font-bold text-white shadow-md active:bg-[#3b5e23] active:scale-95"
          aria-label="Up"
        >
          ▲
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => changeDirection("left")}
            className="flex h-11 w-14 items-center justify-center rounded-xl bg-[#4a752c] text-lg font-bold text-white shadow-md active:bg-[#3b5e23] active:scale-95"
            aria-label="Left"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={resetGame}
            className="flex h-11 w-14 items-center justify-center rounded-xl bg-[#578a34] text-xs font-bold uppercase text-white shadow-md active:scale-95"
            aria-label="Restart"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => changeDirection("right")}
            className="flex h-11 w-14 items-center justify-center rounded-xl bg-[#4a752c] text-lg font-bold text-white shadow-md active:bg-[#3b5e23] active:scale-95"
            aria-label="Right"
          >
            ▶
          </button>
        </div>
        <button
          type="button"
          onClick={() => changeDirection("down")}
          className="flex h-11 w-14 items-center justify-center rounded-xl bg-[#4a752c] text-lg font-bold text-white shadow-md active:bg-[#3b5e23] active:scale-95"
          aria-label="Down"
        >
          ▼
        </button>
      </div>
    </div>
  );
}