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

  // used to get rid of url created for showing rules modal
  useEffect(() => {
    router.replace('/play');
  }, [router]);

  return (
    <div className="flex flex-col items-center h-full justify-between">
      {announcement?.showBanner && showBanner && <AnnouncementBanner setShowBanner={setShowBanner} />}
      <Navbar>{children}</Navbar>
      <div className="flex-1 flex w-full justify-between items-center">
        <Banner desktopOnly data-ad-slot="7787337789" data-ad-format="autorelaxed" />
        <div className="grid grid-rows-2-auto place-items-center gap-1 px-4 flex-1 h-full pt-4">
          <AnimatePresence>
            <div className={`grid ${guesses?.length === 0 ? 'grid-rows-1' : 'grid-rows-6'} w-4/5 md:w-3/5 xl:w-2/5 gap-2 place-self-center`}>
              {loadingGuesses || !guesses ? (
                [1, 2, 3, 4, 5, 6].map((num) => <GuessCard key={num} name="" album="" cover="/default_song.png" showAnimation={false} />)
              ) : (
                <>
                  {guesses.map((song, index) => (
                    <GuessCard key={index} name={song.name} album={song.album || ''} cover={song.cover} correctStatus={song.correctStatus} showAnimation={true} />
                  ))}
                  {guesses.length === 0 && <WelcomeCard heardleDay={dailySong?.heardleDay} />}
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
