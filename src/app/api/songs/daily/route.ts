import prisma from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const dailySong = await prisma.dailySong.findUnique({
      where: {
        id: '0'
      }
    });
    if (!dailySong) return NextResponse.json({ error: 'Daily song not found' }, { status: 404 });

    return NextResponse.json({ dailySong }, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 400 });
  }
}
