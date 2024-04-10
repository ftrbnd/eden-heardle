import prisma from '@/utils/db';
import { Statistics } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id;
  if (!userId) return NextResponse.json({ error: 'User id is required' }, { status: 400 });

  try {
    const stats = await prisma.statistics.findUnique({
      where: {
        userId
      }
    });
    if (!stats) return NextResponse.json({ error: 'Failed to find user stats' }, { status: 404 });

    return NextResponse.json({ stats }, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 400 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id;
  if (!userId) return NextResponse.json({ error: 'User id is required' }, { status: 400 });

  try {
    const { guessedSong }: { guessedSong: boolean } = await req.json();

    const oldStats = await prisma.statistics.findUnique({
      where: {
        userId
      }
    });
    if (!oldStats) return NextResponse.json({ error: "Failed to find user's stats" }, { status: 404 });

    const guesses = await prisma.guesses.findUnique({
      where: {
        userId
      },
      include: {
        songs: true
      }
    });
    if (!guesses) return NextResponse.json({ error: "Failed to find user's guesses" }, { status: 404 });

    let gameAccuracy = 0;
    if (guesses?.songs) {
      // find index of first green square
      const greenSquareIndex = guesses.songs.findIndex((guess) => guess.correctStatus === 'CORRECT');

      // calculate accuracy for this game [0,6]
      gameAccuracy = greenSquareIndex === -1 ? 0 : 6 - greenSquareIndex;
    }

    const newStats: Statistics = {
      gamesPlayed: oldStats.gamesPlayed + 1,
      gamesWon: guessedSong ? oldStats.gamesWon + 1 : oldStats.gamesWon,
      currentStreak: guessedSong ? oldStats.currentStreak + 1 : 0,
      maxStreak: Math.max(oldStats.maxStreak, guessedSong ? oldStats.currentStreak + 1 : 0),
      accuracy: oldStats.accuracy + gameAccuracy,
      id: 'fakeid',
      userId: 'fakeuserid',
      firstStreak: oldStats.firstStreak // firstStreak is updated in dedicated route
    };

    const updatedStats = await prisma.statistics.update({
      where: {
        userId
      },
      data: {
        gamesPlayed: newStats.gamesPlayed,
        gamesWon: newStats.gamesWon,
        currentStreak: newStats.currentStreak,
        maxStreak: newStats.maxStreak,
        accuracy: newStats.accuracy
      }
    });

    return NextResponse.json({ stats: updatedStats }, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 400 });
  }
}
