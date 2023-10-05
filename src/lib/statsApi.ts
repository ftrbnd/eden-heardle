import { LeaderboardStats } from '@/app/api/stats/all/route';
import { Statistics } from '@prisma/client';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export const statsUrlEndpoint = '/stats';

export const getStats = async () => {
  const response = await api.get(statsUrlEndpoint);
  if (!response.data) return null;

  const { stats }: { stats: Statistics } = response.data;

  return stats;
};

export const updateStats = async (guessedSong: boolean) => {
  const response = await api.patch(statsUrlEndpoint, { guessedSong });

  const { stats }: { stats: Statistics } = response.data;

  return stats;
};

export const getLeaderboard = async () => {
  const response = await api.get(`${statsUrlEndpoint}/all`);

  const { leaderboard }: { leaderboard: LeaderboardStats } = response.data;

  return leaderboard;
};