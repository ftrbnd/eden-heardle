'use client';

import { IconDefinition, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CustomHeardle, GuessedSong } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';

interface CustomHeardleAudioProps {
  customSong?: CustomHeardle;
  songLoading: boolean;
  songSuccess: boolean;
  guessedSongs: GuessedSong[];
}

export default function AudioPlayer({ customSong, songLoading, songSuccess, guessedSongs }: CustomHeardleAudioProps) {
  const [second, setSecond] = useState(0);
  const [icon, setIcon] = useState<IconDefinition>(faPlay);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleTimeUpdate = () => {
      let currentSecond = 0;
      if (audioRef.current) {
        currentSecond = audioRef.current.currentTime;

        if (currentSecond >= 6) {
          pauseSong();
        }

        setSecond(audioRef.current.currentTime);
      }

      if (currentSecond >= guessedSongs.length + 1 && !finishedGame()) {
        pauseSong();
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
    if (audioRef.current) {
      audioRef.current.pause();
      setIcon(faPlay);

      audioRef.current.currentTime = 0;
    }
  };

  const playSong = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;

      audioRef.current.play();
      setIcon(faPause);
    }
  };

  const togglePlayer = () => {
    icon === faPlay ? playSong() : pauseSong();
  };

  const finishedGame = () => {
    return guessedSongs.at(-1)?.correctStatus === 'CORRECT' || guessedSongs.length === 6;
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <progress className="progress progress-primary w-full md:w-3/5 xl:w-2/5" value={second} max="6"></progress>

      <div className="flex justify-between pt-2 w-full md:w-3/5 xl:w-2/5">
        <kbd className="kbd">00:{String(Math.floor(second)).padStart(2, '0')}</kbd>
        {songLoading ? (
          <button className="btn btn-ghost btn-disabled">
            <span className="loading loading-ring loading-md"></span>
          </button>
        ) : (
          <button className={`btn btn-ghost ${!songSuccess && 'btn-disabled'}`} onClick={togglePlayer}>
            <FontAwesomeIcon icon={icon} className="w-6 h-6" />
          </button>
        )}
        <kbd className="kbd">00:06</kbd>
      </div>

      <audio ref={audioRef} className="hidden" src={customSong?.link} />
    </div>
  );
}
