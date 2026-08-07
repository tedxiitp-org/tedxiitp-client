"use client";
import React, { useEffect, useState } from "react";
import { fetchLeaderboard, LeaderboardEntry } from "../lib/api";
import { Trophy, Loader2 } from "lucide-react";

interface LeaderboardProps {
  gameId: string;
}

export default function Leaderboard({ gameId }: LeaderboardProps) {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScores() {
      setLoading(true);
      try {
        const data = await fetchLeaderboard(gameId);
        setScores(data);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadScores();
  }, [gameId]);

  return (
    <div className="bg-black/80 border border-gray-800 rounded-xl overflow-hidden flex flex-col h-full shadow-[0_0_20px_rgba(220,38,38,0.1)]">
      <div className="p-4 border-b border-gray-800 flex items-center gap-3 bg-gray-900/50">
        <Trophy className="text-yellow-500 w-5 h-5" />
        <h3 className="text-lg font-bold text-white font-[family-name:var(--font-space)] uppercase tracking-wider">
          Top Players
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
          </div>
        ) : scores.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 font-[family-name:var(--font-inter)] text-sm">
            No scores yet. Be the first!
          </div>
        ) : (
          <div className="space-y-3">
            {scores.map((entry, index) => (
              <div 
                key={entry.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  index === 0 ? 'bg-yellow-500/10 border-yellow-500/30' : 
                  index === 1 ? 'bg-gray-300/10 border-gray-400/30' : 
                  index === 2 ? 'bg-amber-700/10 border-amber-700/30' : 
                  'bg-gray-900/50 border-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold font-[family-name:var(--font-space)] w-5 text-center ${
                    index === 0 ? 'text-yellow-500' : 
                    index === 1 ? 'text-gray-300' : 
                    index === 2 ? 'text-amber-600' : 
                    'text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-white font-[family-name:var(--font-inter)] font-medium">
                    {entry.playerName}
                  </span>
                </div>
                <span className="text-red-400 font-bold font-[family-name:var(--font-space)] tracking-wider">
                  {entry.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
