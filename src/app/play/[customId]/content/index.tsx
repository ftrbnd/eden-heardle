'use client';

import { GuessCard } from '@/components/GuessCard';
import Navbar from '@/app/play/content/Navbar';
import { GuessedSong } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { getUser } from '@/services/users';
import { AnimatePresence } from 'framer-motion';
import { correctlyGuessedHeardle, finishedHeardle } from '@/utils/userGuesses';
import WelcomeCard from '@/app/play/content/WelcomeCard';
import ResultCard from '../../content/ResultCard';
import AudioPlayer from '../../content/AudioPlayer';
import SongSelectInput from '../../content/SongSelectInput';
import { getOtherCustomHeardle } from '@/services/customHeardles';

interface PageProps {
  params: { customId: string };
  children: ReactNode;
}

export default function CustomHeardlePageContent({ params, children }: PageProps) {
  const [customGuesses, setCustomGuesses] = useState<GuessedSong[]>([]);

  const { data: customHeardleSong, isLoading: songLoading } = useQuery({
    queryKey: ['customHeardle', params.customId],
    queryFn: () => getOtherCustomHeardle(params.customId)
  });

  const { data: customHeardleCreator } = useQuery({
    queryKey: ['customHeardleCreator'],
    queryFn: () => getUser(customHeardleSong!.userId),
    enabled: !!customHeardleSong?.userId
  });

  return (
    <div className="flex flex-col items-center h-full">
      <Navbar onCustomHeardlePage={true}>{children}</Navbar>
      <div className="grid grid-rows-2-auto place-items-center gap-1 px-4 w-full h-full pt-4">
        <AnimatePresence>
          <div className={`grid ${customGuesses?.length === 0 ? 'grid-rows-1' : 'grid-rows-6'} w-4/5 md:w-3/5 xl:w-2/5 gap-2 place-self-center`}>
            {customGuesses.map((song, index) => (
              <GuessCard key={index} name={song.name} album={song.album || ''} cover={song.cover} correctStatus={song.correctStatus} showAnimation={true} />
            ))}
            {customGuesses.length === 0 && <WelcomeCard customHeardleCreator={customHeardleCreator?.name} />}
          </div>
        </AnimatePresence>

        {finishedHeardle(customGuesses) ? (
          <ResultCard
            song={customHeardleSong!}
            guessedSong={correctlyGuessedHeardle(customGuesses)}
            onCustomHeardlePage
            customHeardleCreator={customHeardleCreator!}
            customHeardleGuesses={customGuesses}
          />
        ) : (
          <div></div>
        )}
      </div>
      <div className="grid grid-rows-2-auto flex-col gap-2 items-center w-full card shadow-2xl px-4 pb-4">
        <SongSelectInput heardleSong={customHeardleSong!} guesses={customGuesses} setCustomGuesses={setCustomGuesses} />
        <AudioPlayer song={customHeardleSong!} songLoading={songLoading} guesses={customGuesses} />
      </div>
    </div>
  );
}
