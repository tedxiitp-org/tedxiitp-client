"use client";
import React, { useEffect, useState } from "react";
import { fetchGlobalLeaderboard, GlobalLeaderboardResponse } from "../lib/api";
import { Trophy, Loader2, ChevronLeft, ChevronRight, Medal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalLeaderboard() {
  const [data, setData] = useState<GlobalLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    async function loadScores() {
      setLoading(true);
      try {
        const response = await fetchGlobalLeaderboard(page, limit);
        setData(response);
      } catch (err) {
        console.error("Failed to load global leaderboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadScores();
  }, [page]);

  const handleNext = () => {
    if (data && page < data.totalPages) setPage(p => p + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage(p => p - 1);
  };

  return (
    <div className="w-full relative group/leaderboard">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center mb-10 gap-4 text-center relative">
        {/* Decorative Red Accent Line */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-1 bg-red-600"></div>

        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 text-red-600 font-[family-name:var(--font-space)] tracking-widest text-sm font-bold uppercase mb-4">
            <Trophy className="w-5 h-5" />
            Global Ranking
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white font-[family-name:var(--font-molend)] uppercase tracking-wider leading-none">
            Hall of <span className="text-red-600">Fame</span>
          </h2>
          <p className="text-gray-400 text-sm mt-4 font-[family-name:var(--font-space)] tracking-[0.2em] uppercase">
            Champions charted across every unmapped realm.
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative">

        {/* Table Headers */}
        <div className="grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-6 py-4 border-b border-white/10 bg-white/5 text-gray-400 font-[family-name:var(--font-inter)] text-[10px] sm:text-xs font-bold tracking-widest sm:tracking-[0.2em] uppercase">
          <div className="col-span-3 sm:col-span-2 text-center">Rank</div>
          <div className="col-span-5 sm:col-span-7">Player ID</div>
          <div className="col-span-4 sm:col-span-3 text-right">Total Score</div>
        </div>

        {/* List */}
        <div className="min-h-[300px] sm:min-h-[400px] relative flex flex-col justify-center">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
              <span className="text-gray-300 font-[family-name:var(--font-space)] tracking-widest text-xs uppercase">Fetching Data...</span>
            </div>
          )}

          {!loading && (!data || data.data.length === 0) ? (
            <div className="flex flex-col items-center justify-center bg-transparent z-0 w-full py-12">
              <div className="w-16 h-16 mb-4 rounded-full border border-red-600/20 flex items-center justify-center bg-red-600/5 shadow-[0_0_15px_rgba(220,38,38,0.05)]">
                <Trophy className="w-8 h-8 text-gray-600" />
              </div>
              <span className="text-gray-400 font-[family-name:var(--font-space)] tracking-widest text-sm uppercase font-bold text-center px-4">
                No records found.
              </span>
              <span className="text-gray-600 font-[family-name:var(--font-inter)] text-xs mt-2 text-center px-4">
                Be the first to claim a spot on the leaderboard!
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {(data?.data ?? []).map((entry, index) => {
                    const globalRank = (page - 1) * limit + index + 1;
                    const isTop3 = globalRank <= 3;

                    return (
                      <div
                        key={entry.userId}
                        className={`group grid grid-cols-12 gap-2 sm:gap-4 items-center px-3 sm:px-6 py-4 border-b border-white/5 transition-all duration-300 relative overflow-hidden cursor-default ${globalRank === 1 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' :
                          globalRank === 2 ? 'bg-gradient-to-r from-gray-300/10 to-transparent' :
                            globalRank === 3 ? 'bg-gradient-to-r from-amber-600/10 to-transparent' :
                              'hover:bg-white/5'
                          }`}
                      >
                        {/* Hover Accent Line */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>

                        {/* Rank Number */}
                        <div className="col-span-3 sm:col-span-2 flex justify-center items-center">
                          {isTop3 ? (
                            <div className={`relative flex items-center justify-center w-8 h-8 rounded-sm transform rotate-45 border ${globalRank === 1 ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                              globalRank === 2 ? 'bg-gray-300/10 border-gray-400 shadow-[0_0_15px_rgba(156,163,175,0.2)]' :
                                'bg-amber-600/10 border-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                              }`}>
                              <span className={`transform -rotate-45 font-black font-[family-name:var(--font-space)] text-sm ${globalRank === 1 ? 'text-yellow-500' :
                                globalRank === 2 ? 'text-gray-300' :
                                  'text-amber-500'
                                }`}>
                                {globalRank}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500 font-bold font-[family-name:var(--font-space)] text-lg group-hover:text-white transition-colors duration-300">
                              {globalRank < 10 ? `0${globalRank}` : globalRank}
                            </span>
                          )}
                        </div>

                        {/* Player Name */}
                        <div className="col-span-5 sm:col-span-7 truncate pr-2">
                          <span className={`font-[family-name:var(--font-inter)] text-sm sm:text-lg tracking-wide transition-transform duration-300 inline-block sm:group-hover:translate-x-2 truncate w-full ${isTop3 ? 'font-bold text-white' : 'font-medium text-gray-300 group-hover:text-white'
                            }`}>
                            {entry.username}
                          </span>
                        </div>

                        {/* Score */}
                        <div className="col-span-4 sm:col-span-3 text-right">
                          <span className="text-red-500 font-bold font-[family-name:var(--font-space)] text-sm sm:text-xl tracking-widest">
                            {Number(entry.cumulativeScore ?? 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={page === 1 || loading}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 bg-transparent text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-[family-name:var(--font-space)] text-[10px] sm:text-xs font-bold tracking-widest sm:tracking-[0.2em] uppercase group"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" /> Prev
          </button>

          <div className="flex gap-1">
            {/* {[...Array(data?.totalPages || 1)].map((_, i) => ( */}
            {Array.from({ length: Number(data?.totalPages ?? 1) }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-1 transition-colors duration-300 ${page === i + 1 ? 'bg-red-600' : 'bg-white/10'}`}
              ></div>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!data || page >= data.totalPages || loading}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 bg-transparent text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-[family-name:var(--font-space)] text-[10px] sm:text-xs font-bold tracking-widest sm:tracking-[0.2em] uppercase group"
          >
            Next <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
