"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Maximize2 } from "lucide-react";
import Leaderboard from "../../../components/Leaderboard";
import { submitScore } from "../../../lib/api";

export default function MarioGamePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // A simple hacky way to force the leaderboard to refresh
  const [refreshKey, setRefreshKey] = useState(0);

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
    const handleMessage = async (event: MessageEvent) => {
      // Security: You might want to verify origin here
      if (event.data && event.data.type === 'GAME_OVER' && event.data.game === 'mario') {
        const score = event.data.score;
        // Get username from localStorage (set in the /games page modal)
        const playerName = localStorage.getItem('tedx_username') || "Anonymous";
        
        if (playerName) {
          await submitScore('mario', playerName, score);
          // Trigger a refresh of the leaderboard component
          setRefreshKey(prev => prev + 1);
          console.log(`Score of ${score} submitted for ${playerName}`);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-start min-h-screen py-8 px-4"
    >
      <div className="w-full max-w-5xl mb-6 flex items-center justify-between">
        <Link 
          href="/games" 
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-[family-name:var(--font-inter)]"
        >
          &larr; Back to Games
        </Link>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-molend)] text-white">
          Super <span className="text-red-600">Mario</span>
        </h1>
        <button 
          onClick={toggleFullScreen}
          className="flex items-center gap-2 bg-red-600/20 text-red-500 hover:bg-red-600/40 hover:text-white border border-red-600/50 px-4 py-2 rounded-full font-medium transition-all font-[family-name:var(--font-inter)]"
        >
          <Maximize2 size={18} />
          <span className="hidden sm:inline">Fullscreen</span>
        </button>
      </div>

      <div 
        ref={containerRef}
        className="w-full max-w-5xl bg-black border border-gray-800 rounded-xl flex flex-col items-center justify-center h-[500px] sm:h-[600px] max-h-[75vh] shadow-[0_0_20px_rgba(220,38,38,0.2)] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-red-600/5 group-hover:bg-red-600/10 transition-colors duration-500 pointer-events-none"></div>
        <iframe
          ref={iframeRef}
          src="/games/mario/index.html"
          className="w-full h-full border-none z-10 bg-black"
          title="Super Mario Game"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    </motion.div>
  );
}
