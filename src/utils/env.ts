import dotenv from 'dotenv';
dotenv.config();

import z from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),

  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),

  NEXT_PUBLIC_EXPRESS_URL: z.string().url()
});

export const env = envSchema.parse(process.env);
