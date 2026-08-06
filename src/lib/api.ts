export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  date: string;
}

/**
 * MOCK API wrappers for the Leaderboard.
 * Replace the fetch logic inside these functions to point to your actual backend API.
 */

// Simulating some mock data to show before the API is hooked up
let mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', playerName: 'MarioPro', score: 450, date: new Date().toISOString() },
  { id: '2', playerName: 'LuigiFan', score: 320, date: new Date().toISOString() },
  { id: '3', playerName: 'PeachRules', score: 280, date: new Date().toISOString() },
  { id: '4', playerName: 'Toad', score: 150, date: new Date().toISOString() },
];

export async function fetchLeaderboard(gameId: string): Promise<LeaderboardEntry[]> {
  // TODO: Replace with actual API call to fetch game-specific leaderboard
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockLeaderboard].sort((a, b) => b.score - a.score));
    }, 500);
  });
}

export interface GlobalLeaderboardResponse {
  data: LeaderboardEntry[];
  page: number;
  limit: number;
  totalPages: number;
  totalUsers: number;
}

// Simulating global leaderboard data
let mockGlobalLeaderboard: LeaderboardEntry[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `user-${i}`,
  playerName: `Player ${i + 1}`,
  score: Math.floor(Math.random() * 5000),
  date: new Date().toISOString()
})).sort((a, b) => b.score - a.score);

export async function fetchGlobalLeaderboard(page: number = 1, limit: number = 10): Promise<GlobalLeaderboardResponse> {
  // TODO: Replace with actual API call to your Anwesha/TEDx backend
  // const res = await fetch(`https://your-api.com/api/leaderboard?page=${page}&limit=${limit}`);
  // return res.json();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock pagination
      const sorted = [...mockGlobalLeaderboard].sort((a, b) => b.score - a.score);
      const startIndex = (page - 1) * limit;
      const paginatedData = sorted.slice(startIndex, startIndex + limit);
      
      resolve({
        data: paginatedData,
        page,
        limit,
        totalPages: Math.ceil(sorted.length / limit),
        totalUsers: sorted.length
      });
    }, 500); // Simulate network delay
  });
}

export async function submitScore(gameId: string, playerName: string, score: number): Promise<boolean> {
  // TODO: Replace with actual API call
  // await fetch('https://your-api.com/api/leaderboard', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ gameId, playerName, score })
  // });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real global leaderboard, you'd add this score to the user's existing total.
      // For the mock, we'll just push a new entry or update if name exists.
      const existing = mockGlobalLeaderboard.find(p => p.playerName === playerName);
      if (existing) {
        existing.score += score;
      } else {
        mockGlobalLeaderboard.push({
          id: Math.random().toString(36).substr(2, 9),
          playerName,
          score,
          date: new Date().toISOString()
        });
      }
      resolve(true);
    }, 500);
  });
}
