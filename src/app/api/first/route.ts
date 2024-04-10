import prisma from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const first = await prisma.firstCompletedDaily.findMany({
      include: {
        user: {
          include: {
            statistics: true
          }
        }
      }
    });
    if (!first) return NextResponse.json({ error: 'Failed to find FirstCompletedDaily' }, { status: 404 });

    return NextResponse.json({ first: first[0] ?? null }, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId }: { userId: string } = await req.json();
    console.log({ userId });

    const firstAlreadyCompleted = await prisma.firstCompletedDaily.findFirst();
    console.log({ firstAlreadyCompleted });

    if (firstAlreadyCompleted) {
      await prisma.statistics.update({
        where: {
          userId
        },
        data: {
          firstStreak: 0
        }
      });

      return NextResponse.json({ first: firstAlreadyCompleted }, { status: 200 });
    }

    const today = await prisma.firstCompletedDaily.create({
      data: {
        userId
      },
      include: {
        user: {
          include: { statistics: true }
        }
      }
    });

    const prevStats = await prisma.statistics.findUnique({
      where: { userId }
    });
    if (!prevStats) return NextResponse.json({ error: 'Stats not found' }, { status: 404 });

    await prisma.statistics.update({
      where: {
        userId
      },
      data: {
        firstStreak: prevStats.firstStreak + 1
      }
    });

    return NextResponse.json({ first: today }, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 400 });
  }
}
