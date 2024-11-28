import { GuessedSong } from '@prisma/client';
import { LocalGuessedSong } from './types';
import { twMerge } from 'tailwind-merge';
import { clsx, ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getStatusSquare(status: string) {
  switch (status) {
    case 'CORRECT':
      return '🟩';
    case 'ALBUM':
      return '🟧';
    case 'WRONG':
      return '🟥';
    default:
      return '⬜';
  }
}

const statusSquares = (guessStatuses: string[]): string => {
  let squares: string[] = [];

  guessStatuses.forEach((status) => {
    squares.push(getStatusSquare(status));
  });

  return squares.join(' ');
};

const correctlyGuessedHeardle = (guesses: GuessedSong[] | LocalGuessedSong[]) => guesses.some((guess) => guess.correctStatus === 'CORRECT');

const finishedHeardle = (guesses: GuessedSong[] | LocalGuessedSong[]) => guesses.length === 6 || correctlyGuessedHeardle(guesses);

const onCustomHeardlePage = (pathname: string): boolean => {
  return pathname.startsWith('/play/') && !pathname.endsWith('unlimited');
};

export { statusSquares, finishedHeardle, correctlyGuessedHeardle, onCustomHeardlePage };
