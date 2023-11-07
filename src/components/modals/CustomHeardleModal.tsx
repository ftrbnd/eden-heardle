'use client';

import { checkUserCustomHeardle, createCustomHeardle, deleteCustomHeardle } from '@/lib/customHeardleApi';
import { getSongs } from '@/lib/songsApi';
import { faCheck, faCloudArrowUp, faLink, faTrash, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Song } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, MouseEvent, useState } from 'react';
import { createId } from '@paralleldrive/cuid2';

interface SelectProps {
  onSongSelect: (song: Song) => void;
}

function SelectSong({ onSongSelect }: SelectProps) {
  const { data: songs, isLoading: songsLoading } = useQuery({
    queryKey: ['songs'],
    queryFn: getSongs
  });

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
      <select className="select select-primary w-full place-self-center" defaultValue={'Choose a Song'} disabled={songsLoading} onChange={handleSelection}>
        <option disabled>Choose a song</option>
        {songs?.map((song) => (
          <option key={song.id} value={song.name}>
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
        <Image src={selectedSong?.cover ?? '/default_song.png'} alt="Cover of selected song" height={50} width={50} />
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
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: userCustomHeardle } = useQuery({
    queryFn: () => checkUserCustomHeardle(session?.user.id ?? 'fakeid'),
    queryKey: ['userCustomHeardle', session?.user.id],
    enabled: !!session?.user.id
  });

  const deleteHeardleMutation = useMutation({
    mutationFn: () => deleteCustomHeardle(userCustomHeardle?.id ?? 'fakeid'),
    onSettled: (_data, err: any) => {
      if (err) {
        return setError(err.message);
      }

      queryClient.invalidateQueries({ queryKey: ['userCustomHeardle', session?.user.id] });
    }
  });

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
      const customHeardleId = createId();
      await createCustomHeardle(selectedSong, startTime, session.user.id, customHeardleId);

      router.push(`/play/${customHeardleId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const sendDeleteRequest = async () => {
    if (!userCustomHeardle) {
      return setError('No custom Heardle found');
    }
    if (!session?.user.id) {
      return setError('Please sign in to delete this Custom Heardle');
    }

    await deleteHeardleMutation.mutateAsync();
  };

  const copyToClipboard = async (e: MouseEvent) => {
    e.preventDefault();
    if (copied) return;

    setCopied(true);
    await navigator.clipboard.writeText(`https://eden-heardle.io/play/${userCustomHeardle?.id}`);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <dialog id="custom_heardle_modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box h-2/5 sm:h-min">
        <h3 className="font-bold text-lg">
          Custom Heardle <span className="badge badge-lg badge-success">NEW</span>
        </h3>
        {userCustomHeardle ? (
          <div className="card sm:card-side bg-base-200 shadow-xl">
            <figure>
              <Image src={userCustomHeardle.cover} alt="Album" width={500} height={500} />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{`${userCustomHeardle.name} (${formatTime(userCustomHeardle.startTime)} - ${formatTime(userCustomHeardle.startTime + 6)})`}</h2>
              <p className="text-sm">Delete this Heardle to create a new one.</p>
              <div className="card-actions justify-end">
                <button onClick={sendDeleteRequest} className="btn btn-error" disabled={deleteHeardleMutation.isLoading}>
                  <FontAwesomeIcon icon={faTrash} className="h-6 w-6" />
                </button>
                <button onClick={(e) => copyToClipboard(e)} className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}>
                  <FontAwesomeIcon icon={copied ? faCheck : faLink} className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <SelectSong onSongSelect={handleSelection} />
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
            <button className="btn btn-primary self-end" disabled={!selectedSong} onClick={sendCreateRequest}>
              Generate
              <FontAwesomeIcon icon={faCloudArrowUp} className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>Close</button>
      </form>
    </dialog>
  );
}
