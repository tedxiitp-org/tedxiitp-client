import {api} from "@/lib/axios";

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  date?: string;
}

const GAME_IDS: Record<string, string> = {
  'mario': process.env.NEXT_PUBLIC_MARIO_GAME_ID || '6a75e32948da39ed1933ac59'
};

export async function fetchLeaderboard(gameId: string): Promise<LeaderboardEntry[]> {
  try {
    const actualGameId = GAME_IDS[gameId] || gameId;
    const res = await api.get(`/api/v1/leaderboard/${actualGameId}`);
    return res.data.data.map((item: any) => ({
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
    const res = await api.get(`/api/v1/leaderboard/global?limit=${limit}`);
    const formattedData = res.data.data.map((item: any) => ({
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
    const res = await api.post(`/api/v1/users/identity`, { username });
    return {
      data: {
        userId: res.data.userId,
        username: res.data.username
      }
    };
  } catch (error: any) {
    console.error(error);
    return { error: error.response?.data?.error || 'Network error occurred' };
  }
}

export async function submitScore(gameId: string, userId: string, score: number): Promise<boolean> {
  try {
    const actualGameId = GAME_IDS[gameId] || gameId;
    await api.post(`/api/v1/games/${actualGameId}/submit-stats`, { 
      userId, 
      rawScore: score 
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
