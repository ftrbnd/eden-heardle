'use client';

import AudioPlayer from './AudioPlayer';
import Navbar from '@/app/play/content/Navbar';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GuessCard } from '@/components/GuessCard';
import SongSelectInput from '@/app/play/content/SongSelectInput';
import { AnimatePresence } from 'framer-motion';
import useGuesses from '@/hooks/useGuesses';
import useDailySong from '@/hooks/useDailySong';
import { correctlyGuessedHeardle, finishedHeardle } from '@/utils/helpers';
import WelcomeCard from '@/app/play/content/WelcomeCard';
import ResultCard from './ResultCard';
import AnnouncementBanner from './AnnouncementBanner';
import { useQuery } from '@tanstack/react-query';
import { getAnnouncement } from '@/services/announcements';
import Banner from '@/components/ads/Banner';

export default function PlayContent({ children }: { children: ReactNode }) {
  const { data: announcement } = useQuery({
    queryKey: ['announcement'],
    queryFn: getAnnouncement
  });

  const [showBanner, setShowBanner] = useState(true);

  const { guesses, loadingGuesses } = useGuesses();
  const { dailySong, dailySongPending } = useDailySong();
  const router = useRouter();

  const remainingGuesses = new Array<string>(6 - guesses.length).fill('');

  // used to get rid of url created for showing rules modal
  useEffect(() => {
    router.replace('/play');
  }, [router]);

  return (
    <div className="flex flex-col items-center h-full justify-between">
      {announcement?.showBanner && showBanner && <AnnouncementBanner setShowBanner={setShowBanner} />}
      <Navbar>{children}</Navbar>
      <div className="flex-1 flex w-full justify-center items-center md:grid md:grid-cols-3 md:gap-16 md:place-items-center">
        <Banner desktopOnly data-ad-slot="7787337789" data-ad-format="autorelaxed" />
        <div className="grid grid-rows-2-auto place-items-center gap-1 px-4 h-full w-full md:max-w-md pt-4 md:col-start-2">
          <AnimatePresence>
            <div className={`grid ${guesses?.length === 0 ? 'grid-rows-1' : 'grid-rows-6'} w-full gap-2 place-self-center`}>
              {loadingGuesses || !guesses ? (
                [1, 2, 3, 4, 5, 6].map((num) => <GuessCard key={num} name="" album="" cover="/default_song.png" showAnimation={false} />)
              ) : (
                <>
                  {guesses.map((song, index) => (
                    <GuessCard key={index} name={song.name} album={song.album || ''} cover={song.cover} correctStatus={song.correctStatus} showAnimation={true} />
                  ))}
                  {guesses.length === 0 && <WelcomeCard heardleDay={dailySong?.heardleDay} />}
                  {finishedHeardle(guesses) && remainingGuesses.map(() => <Banner data-ad-slot="3330886325" data-ad-format="auto" data-full-width-responsive="true" className="rounded-2xl" />)}
                </>
              )}
            </div>
          </AnimatePresence>

          {finishedHeardle(guesses) ? <ResultCard song={dailySong} guessedSong={correctlyGuessedHeardle(guesses)} /> : <div></div>}
        </div>
        <Banner desktopOnly data-ad-slot="9451773241" data-ad-format="autorelaxed" />
      </div>
      <div className="grid grid-rows-2-auto flex-col gap-2 items-center w-full card shadow-2xl px-4 pb-4">
        <SongSelectInput heardleSong={dailySong} songPending={dailySongPending} guesses={guesses} />
        <AudioPlayer song={dailySong} songPending={dailySongPending || loadingGuesses || !guesses} guesses={guesses} />
      </div>
    </div>
  );
}
