"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Lock, Trophy, X, Gamepad2, ArrowRight } from "lucide-react";
import GlobalLeaderboard from "../../components/GlobalLeaderboard";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const games = [
// ... (omitting games array changes)

  {
    id: "mario",
    title: "Super Mario",
    description: "Beyond the known kingdom, adventure calls — jump into the unmapped.",
    thumbnail: "/mario-thumbnail.png", // User needs to save the image here
    href: "/games/mario",
    active: true,
  },
  {
    id: "game2",
    title: "Coming Soon",
    description: "Another exciting game is on the way.",
    thumbnail: "/placeholder-game.jpg",
    href: "#",
    active: false,
  },
  {
    id: "game3",
    title: "Coming Soon",
    description: "More fun awaits.",
    thumbnail: "/placeholder-game.jpg",
    href: "#",
    active: false,
  },
  {
    id: "game4",
    title: "Coming Soon",
    description: "Stay tuned for updates.",
    thumbnail: "/placeholder-game.jpg",
    href: "#",
    active: false,
  },
];

export default function GamesPage() {
  const [activeTab, setActiveTab] = useState<'games' | 'leaderboard'>('games');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [pendingGameUrl, setPendingGameUrl] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const router = useRouter();

  // Check if username exists on mount
  useEffect(() => {
    const saved = localStorage.getItem('tedx_username');
    if (saved) {
      setUsernameInput(saved);
    }
  }, []);

  const handleGameClick = (href: string) => {
    const savedUsername = localStorage.getItem('tedx_username');
    if (!savedUsername) {
      setPendingGameUrl(href);
      setShowUsernameModal(true);
    } else {
      router.push(href);
    }
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = usernameInput.trim();
    if (!trimmed) return;
    
    localStorage.setItem('tedx_username', trimmed);
    setShowUsernameModal(false);
    if (pendingGameUrl) {
      router.push(pendingGameUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-start min-h-screen py-12 px-4 md:px-8"
    >
      <h1 className="text-4xl md:text-6xl font-bold mb-4 font-[family-name:var(--font-molend)] text-white tracking-wider text-center">
        TED<span className="text-[0.75em] lowercase">x</span><span className="text-red-600">IITPatna</span> Games
      </h1>
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl text-center mb-8 font-[family-name:var(--font-inter)]">
        Somewhere past the edge of the known world, adventure awaits. Select a game below and step into the unmapped
      </p>

      {/* Premium Tab Toggle */}
      <div className="mb-12 flex items-center bg-[#050505] border border-[#1a1a1a] rounded-full p-1.5 shadow-[0_0_20px_rgba(220,38,38,0.05)] relative w-full max-w-[400px]">
        <button
          onClick={() => setActiveTab('games')}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-all duration-300 ${
            activeTab === 'games' ? 'text-white' : 'text-[#666] hover:text-[#a0a0a0]'
          }`}
        >
          <Gamepad2 className={`w-4 h-4 ${activeTab === 'games' ? 'text-red-500' : ''}`} />
          <span className="font-bold tracking-[0.15em] uppercase font-[family-name:var(--font-space)] text-sm">Games</span>
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-all duration-300 ${
            activeTab === 'leaderboard' ? 'text-white' : 'text-[#666] hover:text-[#a0a0a0]'
          }`}
        >
          <Trophy className={`w-4 h-4 ${activeTab === 'leaderboard' ? 'text-red-500' : ''}`} />
          <span className="font-bold tracking-[0.15em] uppercase font-[family-name:var(--font-space)] text-sm">Leaderboard</span>
        </button>
        
        {/* Animated Background Pill */}
        <div 
          className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-red-600/10 border border-red-600/30 rounded-full transition-transform duration-500 ease-out shadow-[0_0_15px_rgba(220,38,38,0.2)] ${
            activeTab === 'games' ? 'left-1.5 translate-x-0' : 'left-1.5 translate-x-[calc(100%+6px)]'
          }`}
        />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'games' ? (
          <motion.div
            key="games-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl"
          >
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            {game.active ? (
              <div onClick={() => handleGameClick(game.href)} className="group block h-full cursor-pointer">
                <GameCard game={game} />
              </div>
            ) : (
              <div className="h-full opacity-60 grayscale cursor-not-allowed">
                <GameCard game={game} />
              </div>
            )}
          </motion.div>
        ))}
          </motion.div>
        ) : (
          <motion.div
            key="leaderboard-view"
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl"
          >
            <GlobalLeaderboard />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Username Modal */}
      <AnimatePresence>
        {showUsernameModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUsernameModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-red-600/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)] overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
              
              <button 
                onClick={() => setShowUsernameModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <Gamepad2 className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-white font-[family-name:var(--font-molend)] uppercase tracking-wider mb-2">
                  Enter Player ID
                </h3>
                <p className="text-gray-400 font-[family-name:var(--font-inter)] text-sm">
                  Forge a unique explorer's mark to chart your high scores on the global leaderboard.
                </p>
              </div>

              <form onSubmit={handleUsernameSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="E.g., Player π"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white font-[family-name:var(--font-inter)] focus:outline-none focus:border-red-500 transition-colors placeholder:text-gray-600"
                    autoFocus
                    maxLength={20}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!usernameInput.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-[family-name:var(--font-space)] font-bold tracking-widest uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  Start Playing
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function GameCard({ game }: { game: typeof games[0] }) {
  return (
    <div className={`bg-black/60 border rounded-xl overflow-hidden flex flex-col h-full transition-all duration-500 ease-out relative group/card ${game.active ? 'border-gray-800 hover:border-red-500 hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(220,38,38,0.4)]' : 'border-gray-900'}`}>
      
      {/* Dynamic Top Glow on Hover */}
      {game.active && (
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
      )}

      <div className="relative w-full aspect-video bg-[#0a0a0a] border-b border-gray-900 overflow-hidden group/image">
        {game.active ? (
          <>
            <img
              src={game.thumbnail}
              alt={game.title}
              className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-700 ease-in-out"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-red-950/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 flex items-center justify-center z-10 backdrop-blur-[2px]">
               <div className="bg-red-600 text-white px-6 py-2.5 rounded-full font-bold tracking-widest uppercase transform translate-y-8 group-hover/card:translate-y-0 transition-all duration-500 ease-out font-[family-name:var(--font-space)] shadow-[0_0_20px_rgba(220,38,38,0.6)] border border-red-400/50 flex items-center gap-2">
                 Play Now
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            {/* Cool geometric pattern for empty state */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600 via-transparent to-transparent"></div>
          </div>
        )}
        
        {!game.active && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
            <Lock className="text-gray-500 w-8 h-8" strokeWidth={1.5} />
            <span className="text-gray-400 font-bold tracking-[0.2em] uppercase font-[family-name:var(--font-space)] text-sm">Locked</span>
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col relative">
        <h3 className="text-2xl font-bold text-white mb-3 font-[family-name:var(--font-space)] group-hover/card:text-red-500 transition-colors duration-300">
          {game.title}
        </h3>
        <p className="text-sm text-gray-400 font-[family-name:var(--font-inter)] line-clamp-3 leading-relaxed">
          {game.description}
        </p>
        {game.active && (
          <div className="mt-auto pt-6 flex items-center text-red-500 text-sm font-bold uppercase tracking-widest font-[family-name:var(--font-inter)] opacity-70 group-hover/card:opacity-100 transition-opacity">
            <span className="relative">
              Launch Game
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover/card:w-full transition-all duration-300"></span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
