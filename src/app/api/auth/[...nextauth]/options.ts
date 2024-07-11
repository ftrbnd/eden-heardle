import prisma from '@/utils/db';
import { serverEnv } from '@/utils/env';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

export const options: NextAuthOptions = {
  // @ts-ignore Property 'id' is missing in type 'Omit<AdapterUser, "id">' but required in type 'AdapterUser'
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: serverEnv.DISCORD_CLIENT_ID,
      clientSecret: serverEnv.DISCORD_CLIENT_SECRET
    })
  ],
  pages: {
    signIn: '/',
    error: '/'
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    }
  },
  events: {
    async createUser(message) {
      await prisma.statistics.create({
        data: {
          currentStreak: 0,
          maxStreak: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          accuracy: 0,
          userId: message.user.id
        }
      });

      await prisma.guesses.create({
        data: {
          userId: message.user.id
        }
      });
    }
  }
};
