"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import Leaderboard from "../../../components/Leaderboard";
import { registerUser, submitScore } from "../../../lib/api";

type Brick = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  hit: boolean;
};

type Ball = {
  x: number;
  y: number;
  dx: number;
  dy: number;
};

const BOARD_WIDTH = 700;
const BOARD_HEIGHT = 580;
const PADDLE_WIDTH = 140;
const PADDLE_HEIGHT = 22;
const BALL_SIZE = 22;
const BRICK_WIDTH = 98;
const BRICK_HEIGHT = 36;
const BRICK_GAP_X = 14;
const BRICK_GAP_Y = 14;
const BRICK_START_Y = 48;
const BRICK_ROW_STEP = BRICK_HEIGHT + BRICK_GAP_Y;

// Custom layout and clay-morphic colors matching the screenshot
const BRICK_SCHEME = [
  // Row 1 (5 bricks)
  [
    { color: "#FEE400" }, // Yellow
    { color: "#FA8F8F" }, // Pink
    { color: "#F97316" }, // Orange
    { color: "#FA8F8F" }, // Pink
    { color: "#FEE400" }, // Yellow
  ],
  // Row 2 (4 bricks centered)
  [
    { color: "#10B981" }, // Green
    { color: "#A87146" }, // Light Brown
    { color: "#A87146" }, // Light Brown
    { color: "#10B981" }, // Green
  ],
  // Row 3 (3 bricks centered)
  [
    { color: "#EAB308" }, // Olive Yellow
    { color: "#A3E635" }, // Light Green
    { color: "#EAB308" }, // Olive Yellow
  ],
  // Row 4 (2 bricks split with an arch space in between)
  [
    { color: "#818CF8", colIndex: 0.5 }, // Purple left
    { color: "#818CF8", colIndex: 2.5 }, // Purple right
  ],
];

function generatePyramidBricks(): Brick[] {
  const bricks: Brick[] = [];
  let counter = 0;

  // Row 0: 5 bricks
  const r0StartX = (BOARD_WIDTH - (5 * BRICK_WIDTH + 4 * BRICK_GAP_X)) / 2;
  for (let i = 0; i < 5; i++) {
    bricks.push({
      id: counter++,
      x: r0StartX + i * (BRICK_WIDTH + BRICK_GAP_X),
      y: BRICK_START_Y,
      width: BRICK_WIDTH,
      height: BRICK_HEIGHT,
      color: BRICK_SCHEME[0][i].color,
      hit: false,
    });
  }

  // Row 1: 4 bricks centered
  const r1StartX = (BOARD_WIDTH - (4 * BRICK_WIDTH + 3 * BRICK_GAP_X)) / 2;
  for (let i = 0; i < 4; i++) {
    bricks.push({
      id: counter++,
      x: r1StartX + i * (BRICK_WIDTH + BRICK_GAP_X),
      y: BRICK_START_Y + BRICK_ROW_STEP,
      width: BRICK_WIDTH,
      height: BRICK_HEIGHT,
      color: BRICK_SCHEME[1][i].color,
      hit: false,
    });
  }

  // Row 2: 3 bricks centered
  const r2StartX = (BOARD_WIDTH - (3 * BRICK_WIDTH + 2 * BRICK_GAP_X)) / 2;
  for (let i = 0; i < 3; i++) {
    bricks.push({
      id: counter++,
      x: r2StartX + i * (BRICK_WIDTH + BRICK_GAP_X),
      y: BRICK_START_Y + 2 * BRICK_ROW_STEP,
      width: BRICK_WIDTH,
      height: BRICK_HEIGHT,
      color: BRICK_SCHEME[2][i].color,
      hit: false,
    });
  }

  // Row 3: 2 bricks split to create the arch
  const leftX = r1StartX;
  const rightX = r1StartX + 3 * (BRICK_WIDTH + BRICK_GAP_X);
  bricks.push({
    id: counter++,
    x: leftX,
    y: BRICK_START_Y + 3 * BRICK_ROW_STEP,
    width: BRICK_WIDTH,
    height: BRICK_HEIGHT,
    color: "#94A3B8",
    hit: false,
  });
  bricks.push({
    id: counter++,
    x: rightX,
    y: BRICK_START_Y + 3 * BRICK_ROW_STEP,
    width: BRICK_WIDTH,
    height: BRICK_HEIGHT,
    color: "#94A3B8",
    hit: false,
  });

  return bricks;
}

function generateTopRow(startId: number): Brick[] {
  const colors = ["#FEE400", "#FA8F8F", "#F97316", "#FA8F8F", "#FEE400"];
  const startX = (BOARD_WIDTH - (5 * BRICK_WIDTH + 4 * BRICK_GAP_X)) / 2;

  return colors.map((color, index) => ({
    id: startId + index,
    x: startX + index * (BRICK_WIDTH + BRICK_GAP_X),
    y: BRICK_START_Y,
    width: BRICK_WIDTH,
    height: BRICK_HEIGHT,
    color,
    hit: false,
  }));
}

function makeInitialBall(): Ball {
  return {
    x: BOARD_WIDTH / 2 - BALL_SIZE / 2,
    y: BOARD_HEIGHT - 130,
    dx: 4.0,
    dy: -4.5,
  };
}

export default function BrickBreakerPage() {
  const [bricks, setBricks] = useState<Brick[]>(generatePyramidBricks);
  const [ball, setBall] = useState<Ball>(makeInitialBall);
  const [paddleX, setPaddleX] = useState((BOARD_WIDTH - PADDLE_WIDTH) / 2);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);

  const boardRef = useRef<HTMLDivElement>(null);
  const paddleRef = useRef(paddleX);
  const ballRef = useRef(ball);
  const bricksRef = useRef(bricks);
  const scoreRef = useRef(score);
  const animFrameId = useRef<number | null>(null);
  const submittedRef = useRef(false);
  const nextBrickIdRef = useRef(100);

  useEffect(() => {
    setBest(Number(localStorage.getItem("tedx_brick_breaker_highscore") || 0));
    const storedUsername = localStorage.getItem("tedx_username") || "";
    setUsername(storedUsername);
    setUsernameInput(storedUsername);
  }, []);

  const movePaddle = useCallback((clientX: number) => {
    const board = boardRef.current;
    if (!board) return;
    const bounds = board.getBoundingClientRect();
    const relativeX = ((clientX - bounds.left) / bounds.width) * BOARD_WIDTH;
    const nextX = Math.max(0, Math.min(BOARD_WIDTH - PADDLE_WIDTH, relativeX - PADDLE_WIDTH / 2));
    paddleRef.current = nextX;
    setPaddleX(nextX);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const delta = event.key === "ArrowLeft" ? -42 : 42;
      const nextX = Math.max(0, Math.min(BOARD_WIDTH - PADDLE_WIDTH, paddleRef.current + delta));
      paddleRef.current = nextX;
      setPaddleX(nextX);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const finishGame = useCallback(
    async (finalScore: number) => {
      setPlaying(false);
      setGameOver(true);
      const high = Math.max(best, finalScore);
      setBest(high);
      localStorage.setItem("tedx_brick_breaker_highscore", String(high));

      if (submittedRef.current || finalScore === 0) return;
      submittedRef.current = true;
      const userId = localStorage.getItem("tedx_userid");
      if (!userId) return;

      try {
        await submitScore("brick-breaker", userId, finalScore);
        setLeaderboardRefresh((v) => v + 1);
      } catch {
        submittedRef.current = false;
      }
    },
    [best]
  );

  // 60FPS Game Loop using requestAnimationFrame
  useEffect(() => {
    if (!playing) return;

    const tick = () => {
      const b = { ...ballRef.current };
      const curBricks = [...bricksRef.current];
      const pX = paddleRef.current;

      // Horizontal wall bounce
      if (b.x <= 0) {
        b.x = 0;
        b.dx = Math.abs(b.dx);
      } else if (b.x + BALL_SIZE >= BOARD_WIDTH) {
        b.x = BOARD_WIDTH - BALL_SIZE;
        b.dx = -Math.abs(b.dx);
      }

      // Ceiling bounce
      if (b.y <= 0) {
        b.y = 0;
        b.dy = Math.abs(b.dy);
      }

      b.x += b.dx;
      b.y += b.dy;

      // Paddle collision
      const paddleY = BOARD_HEIGHT - 38;
      if (
        b.dy > 0 &&
        b.y + BALL_SIZE >= paddleY &&
        b.y <= paddleY + PADDLE_HEIGHT &&
        b.x + BALL_SIZE >= pX &&
        b.x <= pX + PADDLE_WIDTH
      ) {
        b.dy = -Math.abs(b.dy);
        const hitOffset = (b.x + BALL_SIZE / 2 - (pX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        b.dx = hitOffset * 6.5;
        b.y = paddleY - BALL_SIZE;
      }

      // Brick collisions
      let brickHitIndex = -1;
      for (let i = 0; i < curBricks.length; i++) {
        const brick = curBricks[i];
        if (
          !brick.hit &&
          b.x + BALL_SIZE > brick.x &&
          b.x < brick.x + brick.width &&
          b.y + BALL_SIZE > brick.y &&
          b.y < brick.y + brick.height
        ) {
          brickHitIndex = i;
          break;
        }
      }

      if (brickHitIndex >= 0) {
        b.dy *= -1;
        curBricks[brickHitIndex].hit = true;

        scoreRef.current += 15;
        setScore(scoreRef.current);

        const completedRowY = curBricks[brickHitIndex].y;
        const completedRow = curBricks.filter((brick) => brick.y === completedRowY);
        if (completedRow.every((brick) => brick.hit)) {
          const shiftedBricks = curBricks
            .filter((brick) => brick.y !== completedRowY && !brick.hit)
            .map((brick) => ({ ...brick, y: brick.y + BRICK_ROW_STEP }));
          const newTopRow = generateTopRow(nextBrickIdRef.current);
          nextBrickIdRef.current += newTopRow.length;
          curBricks.splice(0, curBricks.length, ...shiftedBricks, ...newTopRow);

          if (shiftedBricks.some((brick) => brick.y + brick.height >= paddleY)) {
            bricksRef.current = curBricks;
            setBricks([...curBricks]);
            finishGame(scoreRef.current);
            return;
          }
        }

        bricksRef.current = curBricks;
        setBricks([...curBricks]);
      }

      // Floor collision (Game Over)
      if (b.y > BOARD_HEIGHT) {
        finishGame(scoreRef.current);
        return;
      }

      ballRef.current = b;
      setBall(b);
      animFrameId.current = requestAnimationFrame(tick);
    };

    animFrameId.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [finishGame, playing]);

  const startGame = () => {
    submittedRef.current = false;
    const initialBricks = generatePyramidBricks();
    const initialBall = makeInitialBall();
    const initialPaddleX = (BOARD_WIDTH - PADDLE_WIDTH) / 2;
    nextBrickIdRef.current = 100;

    bricksRef.current = initialBricks;
    ballRef.current = initialBall;
    paddleRef.current = initialPaddleX;
    scoreRef.current = 0;

    setBricks(initialBricks);
    setBall(initialBall);
    setPaddleX(initialPaddleX);
    setScore(0);
    setGameOver(false);
    setPlaying(true);
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    const clean = usernameInput.trim();
    if (!clean || authLoading) return;
    setAuthLoading(true);
    const response = await registerUser(clean);
    if (response.data?.userId) {
      localStorage.setItem("tedx_username", clean);
      localStorage.setItem("tedx_userid", String(response.data.userId));
      setUsername(clean);
    }
    setAuthLoading(false);
  };

  return (
    <main className="min-h-dvh bg-[#05060b] px-4 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Navigation Bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={17} /> Back to games
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-300">
            <Trophy size={16} /> Best: {best}
          </div>
        </div>

        {/* User Handle Form */}
        {!username && (
          <form
            onSubmit={handleRegister}
            className="mb-5 flex flex-col gap-2 rounded-xl border border-cyan-500/20 bg-[#091122]/70 p-3 backdrop-blur-sm sm:flex-row"
          >
            <input
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Set a handle for the leaderboard"
              maxLength={18}
              className="min-w-0 flex-1 rounded-lg bg-white px-3 py-2 text-sm text-black outline-none"
            />
            <button
              type="submit"
              disabled={authLoading || !usernameInput.trim()}
              className="rounded-lg bg-cyan-400 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {authLoading ? "Saving..." : "Save handle"}
            </button>
          </form>
        )}

        {/* Main Game & Sidebar Grid */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-400">
                  TEDx Arcade / Breakout
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                  Break The Signal
                </h1>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-slate-400">Score</p>
                <p className="text-3xl font-black text-cyan-400">{score}</p>
              </div>
            </div>

            {/* Game Canvas Container with deep navy background */}
            <div
              ref={boardRef}
              onPointerMove={(e) => movePaddle(e.clientX)}
              onTouchMove={(e) => movePaddle(e.touches[0].clientX)}
              className="touch-none relative mx-auto aspect-700/580 w-full max-w-175 overflow-hidden rounded-2xl border-2 border-slate-800 bg-[#070913] shadow-[0_12px_45px_rgba(0,0,0,0.85)] select-none"
            >
              {/* Render Bricks with Clay-morphic 3D Bevels */}
              {bricks.map(
                (brick) =>
                  !brick.hit && (
                    <div
                      key={brick.id}
                      className="absolute rounded-xl transition-transform"
                      style={{
                        left: `${(brick.x / BOARD_WIDTH) * 100}%`,
                        top: `${(brick.y / BOARD_HEIGHT) * 100}%`,
                        width: `${(brick.width / BOARD_WIDTH) * 100}%`,
                        height: `${(brick.height / BOARD_HEIGHT) * 100}%`,
                        backgroundColor: brick.color,
                        boxShadow:
                          "inset 0 4px 5px rgba(255, 255, 255, 0.45), inset 0 -4px 6px rgba(0, 0, 0, 0.35), 0 4px 8px rgba(0, 0, 0, 0.5)",
                      }}
                    />
                  )
              )}

              {/* Tapered Projection / Shadow Beam under the Ball */}
              {playing && (
                <div
                  className="pointer-events-none absolute"
                  style={{
                    left: `${((ball.x + BALL_SIZE / 2) / BOARD_WIDTH) * 100}%`,
                    top: `${((ball.y + BALL_SIZE) / BOARD_HEIGHT) * 100}%`,
                    width: "48px",
                    height: "100px",
                    transform: "translateX(-50%)",
                    background:
                      "linear-gradient(to bottom, rgba(148, 163, 184, 0.42) 0%, rgba(148, 163, 184, 0.02) 100%)",
                    clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
                  }}
                />
              )}

              {/* Pure White Ball with Specular Glow */}
              <div
                className="pointer-events-none absolute rounded-full bg-white"
                style={{
                  left: `${(ball.x / BOARD_WIDTH) * 100}%`,
                  top: `${(ball.y / BOARD_HEIGHT) * 100}%`,
                  width: `${(BALL_SIZE / BOARD_WIDTH) * 100}%`,
                  aspectRatio: "1",
                  boxShadow:
                    "inset -2px -2px 5px rgba(0, 0, 0, 0.2), 0 0 16px rgba(255, 255, 255, 0.85)",
                }}
              />

              {/* Vibrant Cyan Rounded Capsule Paddle */}
              <div
                className="pointer-events-none absolute rounded-full bg-[#00E5FF]"
                style={{
                  left: `${(paddleX / BOARD_WIDTH) * 100}%`,
                  bottom: "26px",
                  width: `${(PADDLE_WIDTH / BOARD_WIDTH) * 100}%`,
                  height: `${(PADDLE_HEIGHT / BOARD_HEIGHT) * 100}%`,
                  boxShadow:
                    "inset 0 4px 6px rgba(255, 255, 255, 0.6), inset 0 -3px 4px rgba(0, 0, 0, 0.25), 0 6px 16px rgba(0, 229, 255, 0.35)",
                }}
              />

              {/* Start & Game Over Screen Overlay */}
              {!playing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 px-4 text-center backdrop-blur-sm">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">
                    {gameOver ? "Session Over" : "Ready to Play"}
                  </p>
                  <p className="mb-6 text-3xl font-black tracking-tight text-white">
                    {gameOver ? `${score} Points Scored` : "Brick Breaker"}
                  </p>
                  <button
                    onClick={startGame}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-400/25 transition hover:scale-105 hover:bg-cyan-300"
                  >
                    <RotateCcw size={18} /> {gameOver ? "Play Again" : "Start Game"}
                  </button>
                </div>
              )}
            </div>

            <p className="mt-3 text-center text-xs tracking-wide text-slate-400">
              Drag finger or mouse to steer the paddle. Keys: <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">←</kbd> <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">→</kbd>
            </p>
          </section>

          {/* Leaderboard Column */}
          <div key={leaderboardRefresh} className="min-h-87.5">
            <Leaderboard gameId="brick-breaker" />
          </div>
        </div>
      </div>
    </main>
  );
}