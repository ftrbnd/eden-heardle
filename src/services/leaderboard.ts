import { LeaderboardStats } from '@/utils/types';
import { Prisma } from '@prisma/client';

const LEADERBOARD_ENDPOINT = '/api/leaderboard';
const FIRST_ENDPOINT = '/api/first';

type FirstCompletedWithUserStatistics = Prisma.FirstCompletedDailyGetPayload<{
  include: { user: { include: { statistics: true } } };
}>;

export const getLeaderboard = async () => {
  try {
    const response = await fetch(LEADERBOARD_ENDPOINT, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to get leaderboard');

    const { leaderboard }: { leaderboard: LeaderboardStats } = await response.json();
    return leaderboard;
  } catch (err) {
    throw new Error(`Failed to get leaderboard`);
  }
};

export const getFirstCompletedDaily = async () => {
  try {
    const response = await fetch(FIRST_ENDPOINT, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to get FirstCompletedDaily');

    const { first }: { first: FirstCompletedWithUserStatistics } = await response.json();
    return first;
  } catch (err) {
    throw new Error(`Failed to get FirstCompletedDaily`);
  }
};

export const updateFirstCompletedDaily = async (userId: string | undefined) => {
  try {
    if (!userId) throw new Error('User id required');

    const response = await fetch(FIRST_ENDPOINT, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to update FirstCompletedDaily');

    const { first }: { first: FirstCompletedWithUserStatistics } = await response.json();
    return first;
  } catch (error) {
    console.log(error);

    throw new Error('Failed to update FirstCompletedDaily table');
  }
};
