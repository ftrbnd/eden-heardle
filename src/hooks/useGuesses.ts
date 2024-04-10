import { GuessedSong, Song, Statistics } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { createId } from '@paralleldrive/cuid2';
import { GuessType } from '@/utils/types';
import { correctlyGuessedHeardle } from '@/utils/userGuesses';
import useLocalUser from './useLocalUser';
import { getGuessedSongs, updateGuessedSongs, updateStats } from '@/services/users';
import { updateFirstCompletedDaily } from '@/services/leaderboard';

const useGuesses = () => {
  const { data: session, status: sessionStatus } = useSession();
  const localUser = useLocalUser();
  const queryClient = useQueryClient();

  const { data: sessionGuesses, isInitialLoading: initialLoadingSessionGuesses } = useQuery<GuessedSong[]>({
    queryKey: ['guesses'],
    queryFn: () => getGuessedSongs(session?.user.id),
    enabled: session?.user.id !== null && session?.user.id !== undefined,
    refetchInterval: 30000, // 30 seconds,
    refetchIntervalInBackground: true
  });

  const statsMutation = useMutation({
    mutationFn: (guessedSong: boolean) => updateStats(guessedSong, session?.user.id),
    onMutate: async (guessedSong: boolean) => {
      await queryClient.cancelQueries({ queryKey: ['stats'] });

      const prevStats = queryClient.getQueryData<Statistics>(['stats']);
      if (prevStats) {
        let gameAccuracy = 0;
        // find index of first green square
        const greenSquareIndex = sessionGuesses?.findIndex((guess) => guess.correctStatus === 'CORRECT');
        // calculate accuracy for this game [0,6]
        gameAccuracy = greenSquareIndex === -1 ? 0 : 6 - (greenSquareIndex ?? 6);

        queryClient.setQueryData<Statistics>(['stats'], {
          ...prevStats,
          gamesPlayed: prevStats.gamesPlayed + 1,
          gamesWon: guessedSong ? prevStats.gamesWon + 1 : prevStats.gamesWon,
          currentStreak: guessedSong ? prevStats.currentStreak + 1 : 0,
          maxStreak: Math.max(prevStats.maxStreak, guessedSong ? prevStats.currentStreak + 1 : 0),
          accuracy: prevStats.accuracy + gameAccuracy
        });
      }

      return { prevStats };
    },
    onError: (error, _variables, context) => {
      console.error('STATS MUTATION ERROR: ', error);
      queryClient.setQueryData(['guesses'], context?.prevStats);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['stats'] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    }
  });

  const firstMutation = useMutation({
    mutationFn: () => updateFirstCompletedDaily(session?.user.id),
    onError: (error, _variables, context) => {
      console.error('FIRSTCOMPLETED MUTATION ERROR: ', error);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['first'] });
    }
  });

  const guessMutation = useMutation({
    mutationFn: (newGuess: GuessedSong) => updateGuessedSongs(newGuess, session?.user.id),
    onMutate: async (newGuess: GuessedSong) => {
      await queryClient.cancelQueries({ queryKey: ['guesses'] });

      const prevGuesses = queryClient.getQueryData<GuessedSong[]>(['guesses']);
      if (prevGuesses) {
        queryClient.setQueryData<GuessedSong[]>(['guesses'], (oldGuesses) => (oldGuesses ? [...oldGuesses, newGuess] : oldGuesses));
      }

      return { prevGuesses };
    },
    onError: (error, _variables, context) => {
      console.log('GUESS MUTATION ERROR: ', error);
      queryClient.setQueryData(['guesses'], context?.prevGuesses);
    },
    onSuccess: async (newGuesses) => {
      if (correctlyGuessedHeardle(newGuesses)) {
        if (session?.user) await firstMutation.mutateAsync();
        await statsMutation.mutateAsync(true);
      } else if (newGuesses?.length === 6 && newGuesses.at(-1)?.correctStatus !== 'CORRECT') {
        await statsMutation.mutateAsync(false);
      }

      await queryClient.invalidateQueries({ queryKey: ['guesses'] });
    }
  });

  const submitGuess = async (guessedSong: Song, correctStatus: 'CORRECT' | 'WRONG' | 'ALBUM') => {
    if (session) {
      await guessMutation.mutateAsync({ ...guessedSong, id: createId(), guessListId: createId(), correctStatus });
    } else {
      localUser.updateGuesses({
        name: guessedSong.name,
        album: guessedSong.album ?? '',
        cover: guessedSong.cover,
        correctStatus
      });
    }
  };

  const getGuessType = (): GuessType => (session ? 'session' : 'local');

  return { guesses: session ? sessionGuesses : localUser?.guesses, loadingGuesses: sessionStatus === 'loading' || initialLoadingSessionGuesses, guessType: getGuessType(), submitGuess };
};

export default useGuesses;
