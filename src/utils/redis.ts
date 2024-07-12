import { Redis } from 'ioredis';
import { serverEnv } from './env';
import { z } from 'zod';

export const redis = new Redis(serverEnv.REDIS_URL);

export const redisSchema = z.object({
  showBanner: z.enum(['true', 'false']).transform((value) => value.toLowerCase() === 'true'),
  text: z.string(),
  link: z.string().optional(),
  status: z.enum(['success', 'info', 'error'])
});

export type Announcement = z.infer<typeof redisSchema>;
