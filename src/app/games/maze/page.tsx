"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Maximize2, RotateCcw, Home, Trophy, Gamepad2 } from "lucide-react";
import { submitScore } from "../../../lib/api";
import { useRouter } from "next/navigation";
import Leaderboard from "../../../components/Leaderboard";

export default function MazeGamePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [gameOverData, setGameOverData] = useState<{ score: number; show: boolean; timeTaken?: number } | null>(null);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => {
        iframeRef.current?.focus();
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('tedx_userid');
    if (!userId) {
      router.push('/games');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'GAME_OVER' && event.data.game === 'maze') {
        const score = event.data.score || 0;
        const timeTaken = event.data.timeTaken || 0;
        const userId = localStorage.getItem('tedx_userid');
        const playerName = localStorage.getItem('tedx_username') || "Anonymous";

        if (userId) {
          try {
            await submitScore('maze', userId, score);
            console.log(`Score of ${score} submitted for ${playerName}`);
            setLeaderboardRefresh(prev => prev + 1);
          } catch (err) {
            console.error("Failed to submit maze score", err);
          }
        }
        setGameOverData({ score, show: true, timeTaken });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-start min-h-screen py-8 px-4 w-full max-w-7xl mx-auto"
    >
      {/* Top Header Navigation */}
      <div className="w-full mb-6 flex items-center justify-between">
        <Link
          href="/games"
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-[family-name:var(--font-inter)]"
        >
          &larr; Back to Games
        </Link>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-molend)] text-white">
          3D <span className="text-red-600">Maze Escape</span>
        </h1>
        <button
          onClick={toggleFullScreen}
          className="flex items-center gap-2 bg-red-600/20 text-red-500 hover:bg-red-600/40 hover:text-white border border-red-600/50 px-4 py-2 rounded-full font-medium transition-all font-[family-name:var(--font-inter)]"
        >
          <Maximize2 size={18} />
          <span className="hidden sm:inline">Fullscreen</span>
        </button>
      </div>

      {/* Game Frame Container */}
      <div
        ref={containerRef}
        className="w-full bg-black border border-gray-800 rounded-xl flex flex-col items-center justify-center h-[550px] sm:h-[650px] max-h-[80vh] shadow-[0_0_30px_rgba(220,38,38,0.25)] relative overflow-hidden group mb-10"
      >
        <iframe
          ref={iframeRef}
          src="/games/maze/index.html"
          className="w-full h-full border-none z-10 bg-black"
          title="3D Maze Escape Game"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>

      {/* Leaderboard Component Section */}
      <div className="w-full max-w-4xl">
        <Leaderboard key={leaderboardRefresh} gameId="maze" />
      </div>

      {/* Game Over / Victory Modal */}
      <AnimatePresence>
        {gameOverData && gameOverData.show && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0a0a0a] bg-[url('/bg1.png')] bg-repeat bg-top bg-left"
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(rgba(220,38,38,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.06) 1px, transparent 1px)`,
                  backgroundSize: '60px 60px'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-red-600/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)] overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>

              <div className="text-center mb-8">
                <div className="w-12 h-12 mx-auto mb-4 border border-red-600/30 rounded-xl flex items-center justify-center bg-red-600/10">
                  <Trophy className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-2xl font-black text-white font-[family-name:var(--font-molend)] uppercase tracking-wider mb-2">
                  Portal <span className="text-red-600">Reached!</span>
                </h3>
                <p className="text-gray-400 font-[family-name:var(--font-inter)] text-sm">
                  You successfully escaped the multi-floor 3D maze.
                </p>
              </div>

              {/* Score Display */}
              <div className="relative bg-black/50 border border-white/10 rounded-xl px-4 py-6 mb-6">
                <span className="block text-center text-gray-500 font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.2em] mb-2">Score Achieved</span>
                <span className="block text-center text-5xl font-black text-white font-[family-name:var(--font-space)] tracking-wider">
                  {gameOverData.score.toLocaleString()}
                </span>
                {gameOverData.timeTaken !== undefined && (
                  <span className="block text-center text-gray-400 font-[family-name:var(--font-inter)] text-xs mt-2">
                    Time: {gameOverData.timeTaken} seconds
                  </span>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setGameOverData(null);
                    if (iframeRef.current) {
                      iframeRef.current.src = iframeRef.current.src;
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-[family-name:var(--font-space)] font-bold tracking-widest uppercase transition-colors group"
                >
                  <RotateCcw className="w-5 h-5 group-hover:-rotate-90 transition-transform duration-500" />
                  Play Again
                </button>
                <Link
                  href="/games"
                  className="w-full flex items-center justify-center gap-2 bg-transparent border border-white/10 hover:border-red-600/30 text-gray-400 hover:text-white py-4 rounded-xl font-[family-name:var(--font-space)] font-bold tracking-widest uppercase transition-all group"
                >
                  <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                  Back to Games
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
