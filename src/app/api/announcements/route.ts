import { redis, redisSchema } from '@/utils/redis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const showBanner = await redis.get('show_banner');
    const text = await redis.get('text');
    const link = await redis.get('link');
    const status = await redis.get('status');

    const announcement = redisSchema.parse({ showBanner, text, link, status });

    return NextResponse.json({ announcements: [announcement] }, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 400 });
  }
}
