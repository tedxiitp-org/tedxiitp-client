export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  date?: string;
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '');

const GAME_IDS: Record<string, string> = {
  'mario': process.env.NEXT_PUBLIC_MARIO_GAME_ID || '6a75e32948da39ed1933ac59'
};

export async function fetchLeaderboard(gameId: string): Promise<LeaderboardEntry[]> {
  try {
    const actualGameId = GAME_IDS[gameId] || gameId;
    const res = await fetch(`${API_BASE_URL}/leaderboard/${actualGameId}`);
    if (!res.ok) throw new Error('Failed to fetch game leaderboard');
    const json = await res.json();
    return json.data.map((item: any) => ({
      id: item.userId,
      playerName: item.username,
      score: item.finalScore,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export interface GlobalLeaderboardResponse {
  data: LeaderboardEntry[];
  page: number;
  limit: number;
  totalPages: number;
  totalUsers: number;
}

export async function fetchGlobalLeaderboard(page: number = 1, limit: number = 10): Promise<GlobalLeaderboardResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/leaderboard/global?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch global leaderboard');
    const json = await res.json();
    const formattedData = json.data.map((item: any) => ({
      id: item.userId,
      playerName: item.username,
      score: item.cumulativeScore,
    }));
    
    // The backend doesn't seem to support pagination yet, so we mock the pagination metadata
    return {
      data: formattedData,
      page,
      limit,
      totalPages: 1,
      totalUsers: formattedData.length
    };
  } catch (error) {
    console.error(error);
    return {
      data: [],
      page,
      limit,
      totalPages: 0,
      totalUsers: 0
    };
  }
}

export async function registerUser(username: string): Promise<{ error?: string, data?: { userId: string; username: string } }> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/identity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const json = await res.json();
    if (!res.ok) {
      return { error: json.error || 'Failed to register' };
    }
    return {
      data: {
        userId: json.userId,
        username: json.username
      }
    };
  } catch (error) {
    console.error(error);
    return { error: 'Network error occurred' };
  }
}

export async function submitScore(gameId: string, userId: string, score: number): Promise<boolean> {
  try {
    const actualGameId = GAME_IDS[gameId] || gameId;
    const res = await fetch(`${API_BASE_URL}/games/${actualGameId}/submit-stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, rawScore: score })
    });
    return res.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}
