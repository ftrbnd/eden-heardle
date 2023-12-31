'use client';

import { useSession } from 'next-auth/react';
import AudioPlayer from '../../components/AudioPlayer';
import { useQuery } from '@tanstack/react-query';
import { getDailySong, getGuessedSongs } from '@/lib/songsApi';
import Navbar from '@/components/Navbar';
import { CSSProperties, Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GuessCard } from '@/components/GuessCard';
import SongSelectInput from '@/components/SongSelectInput';
import useLocalUser from '@/context/LocalUserProvider';
import { DailySong } from '@prisma/client';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import OpenModalButton from '@/components/modals/OpenModalButton';
import { motion, AnimatePresence } from 'framer-motion';
interface CountdownProps {
  song: DailySong;
  guessedSong: boolean;
}

interface CSSPropertiesWithVars extends CSSProperties {
  '--value': number;
}

function Countdown({ song, guessedSong }: CountdownProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const now = new Date();

    const currentUTCHours = now.getUTCHours();
    const currentUTCMinutes = now.getUTCMinutes();
    const currentUTCSeconds = now.getUTCSeconds();

    const targetHour = 3;
    const targetMinute = 0;
    const targetSecond = 0;

    let hoursRemaining = (targetHour - currentUTCHours + 24) % 24;
    let minutesRemaining = (targetMinute - currentUTCMinutes + 60) % 60;
    let secondsRemaining = (targetSecond - currentUTCSeconds + 60) % 60;

    const intervalId = setInterval(() => {
      secondsRemaining--;
      setSeconds(secondsRemaining);
      setMinutes(minutesRemaining);
      setHours(hoursRemaining);

      if (secondsRemaining < 0) {
        secondsRemaining = 59;
        minutesRemaining--;
        setSeconds(secondsRemaining);
        setMinutes(minutesRemaining);

        if (minutesRemaining < 0) {
          minutesRemaining = 59;
          hoursRemaining--;
          setMinutes(minutesRemaining);
          setHours(hoursRemaining);

          if (hoursRemaining < 0) {
            setHours(hoursRemaining);
            clearInterval(intervalId);
            console.log('Countdown to 4 AM UTC has reached 0!');
          }
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <motion.div
      className="self-end w-4/5 md:w-3/5 xl:w-2/5 card bg-base-100 shadow-xl image-full overflow-hidden mb-4 mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3 }}
    >
      <figure>
        <Image src={song?.cover ?? ''} alt={song?.name} fill style={{ objectFit: 'cover' }} priority />
      </figure>
      <div className="card-body items-center">
        <h2 className="font-bold text-center text-lg sm:text-xl md:text-2xl">{guessedSong ? "Great job on today's puzzle!" : `The song was ${song?.name}`}</h2>
        <p className="text-md">{guessedSong ? 'Check back tomorrow for a new song.' : 'Try again tomorrow!'}</p>
        <div className="card-actions justify-center">
          <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
            <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
              <span className="countdown font-mono text-3xl sm:text-5xl">
                <span id="hours" style={{ '--value': hours } as CSSPropertiesWithVars}></span>
              </span>
              hours
            </div>
            <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
              <span className="countdown font-mono text-3xl sm:text-5xl">
                <span id="minutes" style={{ '--value': minutes } as CSSPropertiesWithVars}></span>
              </span>
              min
            </div>
            <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
              <span className="countdown font-mono text-3xl sm:text-5xl">
                <span id="seconds" style={{ '--value': seconds } as CSSPropertiesWithVars}></span>
              </span>
              sec
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// function AnnouncementBanner({ setShowBanner }: { setShowBanner: Dispatch<SetStateAction<boolean>> }) {
//   return (
//     <div className="flex justify-center items-center bg-success text-success-content w-full h-min p-2">
//       <div className="btn btn-ghost px-1 sm:px-2">
//         <OpenModalButton modalId="custom_heardle_modal" modalTitle="NEW: Create your own custom Heardle!" />
//       </div>
//       <button className="btn btn-ghost px-1 sm:px-2" onClick={() => setShowBanner(false)}>
//         <FontAwesomeIcon icon={faClose} className="h-4 w-4" />
//       </button>
//     </div>
//   );
// }

export default function PlayContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const localUser = useLocalUser();
  // const [showBanner, setShowBanner] = useState(true);

  const { data: guesses, isFetched: guessesFetched } = useQuery({
    queryKey: ['guesses'],
    queryFn: getGuessedSongs,
    enabled: session !== null,
    refetchInterval: 30000, // 30 seconds,
    refetchIntervalInBackground: true
  });

  const { data: dailySong } = useQuery({
    queryKey: ['daily'],
    queryFn: getDailySong,
    refetchInterval: 30000, // 30 seconds,
    refetchIntervalInBackground: true
  });

  useEffect(() => {
    router.replace('/play');
  }, [router]);

  if (sessionStatus === 'loading') {
    return (
      <div className="flex flex-col items-center h-full justify-between">
        {/* {showBanner && <AnnouncementBanner setShowBanner={setShowBanner} />} */}
        <Navbar>{children}</Navbar>
        <div className="grid grid-rows-2-auto gap-1 px-4 w-full h-full pt-4">
          <AnimatePresence>
            <div className="grid grid-rows-6 w-4/5 md:w-3/5 xl:w-2/5 gap-2 place-self-center">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <GuessCard key={num} name="" album="" cover="/default_song.png" showAnimation={false} />
              ))}
            </div>
          </AnimatePresence>
          <div></div>
        </div>
        <div className="grid grid-rows-2-auto flex-col gap-2 items-center w-full card shadow-2xl px-4 pb-4">
          <SongSelectInput dailySong={dailySong} />
          <AudioPlayer />
        </div>
      </div>
    );
  } else if (sessionStatus === 'authenticated') {
    return (
      <div className="flex flex-col items-center h-full justify-between">
        {/* {showBanner && <AnnouncementBanner setShowBanner={setShowBanner} />} */}
        <Navbar>{children}</Navbar>
        <div className="grid grid-rows-2-auto place-items-center gap-1 px-4 w-full h-full pt-4">
          <AnimatePresence>
            <div className="grid grid-rows-6 w-4/5 md:w-3/5 xl:w-2/5 gap-2 place-self-center">
              {guessesFetched &&
                guesses?.map((song) => <GuessCard key={song.id} name={song.name} album={song.album || ''} cover={song.cover} correctStatus={song.correctStatus} showAnimation={true} />)}
              {guesses?.length === 0 && (
                <div className="row-span-full text-center">
                  <h1 className="text-5xl font-bold">Hello there</h1>
                  <p className="py-6">Press play and choose a song to get started!</p>
                </div>
              )}
            </div>
          </AnimatePresence>

          {guesses?.length === 6 || guesses?.at(-1)?.correctStatus === 'CORRECT' ? <Countdown song={dailySong!} guessedSong={guesses?.at(-1)?.correctStatus === 'CORRECT'} /> : <div></div>}
        </div>
        <div className="grid grid-rows-2-auto flex-col gap-2 items-center w-full card shadow-2xl px-4 pb-4">
          <SongSelectInput dailySong={dailySong} />
          <AudioPlayer />
        </div>
      </div>
    );
  } else if (sessionStatus === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center h-full justify-between">
        {/* {showBanner && <AnnouncementBanner setShowBanner={setShowBanner} />} */}
        <Navbar>{children}</Navbar>
        <div className="grid grid-rows-2-auto place-items-center gap-1 px-4 w-full h-full pt-4">
          <AnimatePresence>
            <div className="grid grid-rows-6 w-4/5 md:w-3/5 xl:w-2/5 gap-2 place-self-center">
              {localUser.user?.guesses.map((song, index) => (
                <GuessCard key={index} name={song.name} album={song.album || ''} cover={song.cover} correctStatus={song.correctStatus} showAnimation={true} />
              ))}
              {localUser.user?.guesses.length === 0 && (
                <div className="row-span-full text-center">
                  <h1 className="text-5xl font-bold">Hello there</h1>
                  <p className="py-6">Press play and choose a song to get started!</p>
                </div>
              )}
            </div>
          </AnimatePresence>

          {localUser.user?.guesses.length === 6 || localUser.user?.guesses.at(-1)?.correctStatus === 'CORRECT' ? (
            <Countdown song={dailySong!} guessedSong={localUser.user?.guesses?.at(-1)?.correctStatus === 'CORRECT'} />
          ) : (
            <div></div>
          )}
        </div>
        <div className="grid grid-rows-2-auto flex-col gap-2 items-center w-full card shadow-2xl px-4 pb-4">
          <SongSelectInput dailySong={dailySong} />
          <AudioPlayer />
        </div>
      </div>
    );
  }
}
