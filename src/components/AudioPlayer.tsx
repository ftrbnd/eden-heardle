'use client';

import useLocalUser from '@/context/LocalUserProvider';
import { getDailySong, getGuessedSongs } from '@/lib/songsApi';
import { IconDefinition, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

export default function AudioPlayer() {
  const [second, setSecond] = useState(0);
  const [icon, setIcon] = useState<IconDefinition>(faPlay);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: session } = useSession();
  const { data: guesses } = useQuery({
    queryKey: ['guesses'],
    queryFn: getGuessedSongs,
    enabled: session !== null,
    refetchInterval: 30000, // 30 seconds,
    refetchIntervalInBackground: true
  });
  const localUser = useLocalUser();

  const { data: dailySong, isLoading: dailyLoading } = useQuery({
    queryKey: ['daily'],
    queryFn: getDailySong,
    staleTime: 1 * 60 * 1000
  });

  useEffect(() => {
    const handleTimeUpdate = () => {
      let currentSecond = 0;
      if (audioRef.current && dailySong?.startTime) {
        currentSecond = audioRef.current.currentTime - dailySong.startTime;

        setSecond(audioRef.current.currentTime - dailySong.startTime);
      }

      if (session && guesses?.length !== undefined) {
        if (currentSecond >= guesses.length + 1) {
          pauseSong();
        }
      } else {
        if (localUser.user?.guesses.length !== undefined) {
          if (currentSecond >= localUser.user.guesses.length + 1) {
            pauseSong();
          }
        }
      }
    };

    const currentAudio = audioRef.current;
    if (currentAudio) currentAudio.volume = 0.5;
    currentAudio?.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      if (currentAudio) {
        currentAudio.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  });

  const pauseSong = () => {
    if (audioRef.current && dailySong?.startTime) {
      audioRef.current.pause();
      setIcon(faPlay);

      audioRef.current.currentTime = dailySong.startTime;
    }
  };

  const playSong = () => {
    if (audioRef.current && dailySong?.startTime) {
      audioRef.current.currentTime = dailySong?.startTime;

      audioRef.current.play();
      setIcon(faPause);
    }
  };

  const togglePlayer = () => {
    icon === faPlay ? playSong() : pauseSong();
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <progress className="progress progress-primary w-full md:w-3/5 xl:w-2/5" value={second} max="6"></progress>

      <div className="flex justify-between pt-2 w-full md:w-3/5 xl:w-2/5">
        <kbd className="kbd">00:{String(Math.floor(second)).padStart(2, '0')}</kbd>
        {dailyLoading ? (
          <button className="btn btn-ghost btn-disabled">
            <span className="loading loading-ring loading-md"></span>
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={togglePlayer}>
            <FontAwesomeIcon icon={icon} className="w-6 h-6" />
          </button>
        )}
        <kbd className="kbd">00:06</kbd>
      </div>

      <audio ref={audioRef} className="hidden" src={dailySong?.link} />
    </div>
  );
}
