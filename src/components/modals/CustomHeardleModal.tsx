'use client';

import { faCheck, faCloudArrowUp, faLink, faTrash, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Song } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { ChangeEvent, MouseEvent, useState } from 'react';
import { Session } from 'next-auth';
import SignInButton from '../buttons/SignInButton';
import { motion } from 'framer-motion';
import useCustomHeardle from '@/hooks/useCustomHeardle';
import useSongs from '@/hooks/useSongs';

interface SelectProps {
  onSongSelect: (song: Song) => void;
  session: Session | null;
}

function SelectSong({ onSongSelect, session }: SelectProps) {
  const { songs, songsPending } = useSongs();

  const handleSelection = (event: ChangeEvent<HTMLSelectElement>) => {
    const song = songs?.find((song) => song.name === event.target.value);
    if (!song) return;

    onSongSelect(song);
  };

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-semibold">Choose a song</span>
      </label>
      <select
        className="select select-primary w-full place-self-center"
        defaultValue={'Choose a Song'}
        disabled={songsPending || !session}
        // disabled
        onChange={handleSelection}
      >
        <option disabled>Choose a song</option>
        {songs?.map((song) => (
          <option
            key={song.id}
            value={song.name}
            disabled={!session}
            // disabled
          >
            {song.name}
          </option>
        ))}
      </select>
    </div>
  );
}

interface CardProps {
  selectedSong: Song | null;
}

function SelectedSongCard({ selectedSong }: CardProps) {
  return (
    <div className="card card-side bg-base-100 shadow-xl w-full">
      <figure>
        <Image src={selectedSong?.cover ?? '/default_song.png'} alt="Cover of selected song" height={500} width={500} />
      </figure>
      <div className="flex items-center w-full px-4">
        {selectedSong ? (
          <Link href={selectedSong.link} target="_blank" className="card-title text-left link link-primary w-full">
            {selectedSong?.name}
            <FontAwesomeIcon icon={faUpRightFromSquare} className="h-3 w-3" />
          </Link>
        ) : (
          <h2 className="card-title text-left">{'...'}</h2>
        )}
      </div>
    </div>
  );
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

  return `${formattedMinutes}:${formattedSeconds}`;
};

export default function CustomHeardleModal() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const { data: session } = useSession();
  const customHeardle = useCustomHeardle();

  const handleSelection = (song: Song) => {
    setSelectedSong(song);
    setStartTime(0);
  };

  const sendCreateRequest = async () => {
    if (!selectedSong) {
      return setError('Please select a song');
    }
    if (!session?.user.id) {
      return setError('Please sign in to create a Custom Heardle');
    }

    try {
      const newLink = await customHeardle.create(selectedSong, startTime);
      await navigator.clipboard.writeText(newLink);

      setSelectedSong(null);
      setError('');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const sendDeleteRequest = async () => {
    if (!customHeardle.data) {
      return setError('No custom Heardle found');
    }
    if (!session?.user.id) {
      return setError('Please sign in to delete this Custom Heardle');
    }

    try {
      await customHeardle.remove();

      setSelectedSong(null);
      setError('');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const copyToClipboard = async (e: MouseEvent) => {
    e.preventDefault();
    if (copied || !customHeardle.data) return;

    setCopied(true);

    await navigator.clipboard.writeText(`https://eden-heardle.io/play/${customHeardle.data?.id}`);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <dialog id="custom_heardle_modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box h-2/5 sm:h-min">
        <h3 className="font-bold text-lg">
          {'Custom Heardle '}
          {/* <span className="badge badge-md badge-warning">{'Temporarily disabled'}</span> */}
        </h3>
        {customHeardle.data ? (
          <div className="card sm:card-side bg-base-200 shadow-xl mt-4">
            <figure>
              <Image src={customHeardle.data.cover} alt="Album" width={500} height={500} />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{customHeardle.data.name}</h2>
              <h3 className="font-semibold">{`${formatTime(customHeardle.data.startTime)} - ${formatTime(customHeardle.data.startTime + 6)}`}</h3>
              <div className="card-actions justify-around md:justify-end">
                <div className="tooltip sm:tooltip-left" data-tip="Delete this Heardle to create a new one">
                  <motion.button
                    onClick={sendDeleteRequest}
                    className="btn btn-sm btn-error"
                    disabled={customHeardle.deleteLoading}
                    // disabled
                    whileHover={{
                      scale: 1.1,
                      transition: {
                        duration: 0.2
                      }
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    Delete
                    {customHeardle.deleteLoading ? <span className="loading loading-spinner"></span> : <FontAwesomeIcon icon={faTrash} />}
                  </motion.button>
                </div>
                <motion.button
                  onClick={(e) => copyToClipboard(e)}
                  className={`btn btn-sm ${copied ? 'btn-success' : 'btn-primary'}`}
                  whileHover={{
                    scale: 1.1,
                    transition: {
                      duration: 0.2
                    }
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  {copied ? 'Copied!' : 'Share'}
                  <FontAwesomeIcon icon={copied ? faCheck : faLink} />
                </motion.button>
              </div>
              <p className="text-xs text-center text-error">{error}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <SelectSong onSongSelect={handleSelection} session={session} />
            <SelectedSongCard selectedSong={selectedSong} />
            <div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Set song range</span>
                  {startTime === (selectedSong?.duration ?? 0) - 6 && <span className="label-text-alt">{'Song must be 6 seconds'}</span>}
                </label>
                <input
                  type="range"
                  className="range"
                  min={0}
                  max={(selectedSong?.duration ?? 0) - 6}
                  step="1"
                  value={startTime}
                  onChange={(e) => setStartTime(parseInt(e.target.value))}
                  disabled={!selectedSong}
                  // disabled
                />

                <div className="flex justify-between items-center">
                  <p>
                    Range: {formatTime(startTime)} - {formatTime(startTime + 6)}
                  </p>
                  <p>{formatTime(selectedSong?.duration ?? 0)}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-center text-error">{error}</p>
            <p className="text-xs text-center text-error">{!session && 'Sign in to create your own!'}</p>
            <div className="self-end flex gap-2 items-center">
              <motion.button
                onClick={sendCreateRequest}
                className="btn btn-primary"
                disabled={!selectedSong || customHeardle.createLoading}
                // disabled
                whileHover={{
                  scale: 1.1,
                  transition: {
                    duration: 0.2
                  }
                }}
                whileTap={{ scale: 0.9 }}
              >
                {customHeardle.createLoading ? 'Generating...' : 'Generate'}
                {customHeardle.createLoading ? <span className="loading loading-spinner"></span> : <FontAwesomeIcon icon={faCloudArrowUp} className="h-6 w-6" />}
              </motion.button>
              {!session && <SignInButton />}
            </div>
          </div>
        )}
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>Close</button>
      </form>
    </dialog>
  );
}
