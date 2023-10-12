import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const songs = await prisma.song.findMany();

    const sortedSongs = songs.sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      return 0;
    });

    return NextResponse.json({ songs: sortedSongs }, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 400 });
  }
}
