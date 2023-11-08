import AuthSessionProvider from '@/context/AuthSessionProvider';
import TanstackProvider from '@/context/TanstackProvider';
import NextThemesProvider from '@/context/NextThemesProvider';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LocalUserProvider } from '@/context/LocalUserProvider';
import { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EDEN Heardle',
  description: 'Get 6 chances to guess the EDEN song!',
  openGraph: {
    images: ['/icon.png']
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextThemesProvider>
          <AuthSessionProvider>
            <TanstackProvider>
              <LocalUserProvider>
                {children} <Analytics />
              </LocalUserProvider>
            </TanstackProvider>
          </AuthSessionProvider>
        </NextThemesProvider>
        <Analytics />
      </body>
    </html>
  );
}
