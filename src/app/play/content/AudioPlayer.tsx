'use client';

import { LocalGuessedSong } from '@/utils/types';
import { finishedHeardle } from '@/utils/helpers';
import { IconDefinition, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CustomHeardle, DailySong, GuessedSong, UnlimitedHeardle } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';

interface AudioProps {
  song?: DailySong | CustomHeardle | UnlimitedHeardle;
  songPending: boolean;
  guesses?: GuessedSong[] | LocalGuessedSong[] | null;
}

export default function AudioPlayer({ song, songPending, guesses }: AudioProps) {
  const [second, setSecond] = useState(0);
  const [icon, setIcon] = useState<IconDefinition>(faPlay);
  const [error, setError] = useState('');
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

      if (guesses && currentSecond >= guesses?.length + 1 && !finishedHeardle(guesses)) {
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
      audioRef.current.currentTime = 0;

      setIcon(faPlay);
    }
  };

  const playSong = async () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;

      await audioRef.current.play();
      setIcon(faPause);
    }
  };

  const togglePlayer = async () => {
    try {
      icon === faPlay ? await playSong() : pauseSong();
      setError('');
    } catch (err) {
      setError('Failed to use audio player');
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <progress className="progress progress-primary w-full md:w-3/5 xl:w-2/5" value={second} max="6"></progress>
      {error && <p className="text-error">{error}</p>}

      <div className="flex justify-between pt-2 w-full md:w-3/5 xl:w-2/5">
        <kbd className="kbd">00:{String(Math.floor(second)).padStart(2, '0')}</kbd>
        {songPending ? (
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

      <audio ref={audioRef} className="hidden" src={song?.link} />
    </div>
  );
}
