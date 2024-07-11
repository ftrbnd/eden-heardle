'use client';

import useGuesses from '@/hooks/useGuesses';
import useSongs from '@/hooks/useSongs';
import { LocalGuessedSong } from '@/utils/types';
import { finishedHeardle } from '@/utils/helpers';
import { createId } from '@paralleldrive/cuid2';
import { Song, DailySong, CustomHeardle, GuessedSong, UnlimitedHeardle } from '@prisma/client';
import { useEffect, ChangeEvent, Dispatch, SetStateAction, useRef, forwardRef } from 'react';

interface SelectProps {
  heardleSong?: DailySong | CustomHeardle | UnlimitedHeardle;
  songLoading: boolean;
  guesses: GuessedSong[] | LocalGuessedSong[];
  setOtherGuesses?: Dispatch<SetStateAction<GuessedSong[]>>;
}

type Ref = HTMLSelectElement;

const MySongSelectInput = forwardRef<Ref, SelectProps>(function SongSelectInput({ heardleSong, songLoading, guesses, setOtherGuesses }, ref) {
  const { songs, songsLoading } = useSongs();
  const { submitGuess } = useGuesses();

  useEffect(() => {
    if (guesses && finishedHeardle(guesses) && !setOtherGuesses) {
      const modal = document.getElementById('stats_modal') as HTMLDialogElement;
      if (!modal.open) modal.showModal();
    }
  }, [guesses, setOtherGuesses]);

  const handleSelection = (event: ChangeEvent<HTMLSelectElement>) => {
    function getCorrectStatus(song: Song) {
      return song.name === heardleSong?.name ? 'CORRECT' : song?.album === heardleSong?.album ? 'ALBUM' : 'WRONG';
    }

    if (event.target.className === 'default_selection') return;

    // find song object that was selected
    const selectedSong = songs?.find((song) => song.name === event.target.value);
    if (!selectedSong) return;

    if (!setOtherGuesses) {
      submitGuess(selectedSong, getCorrectStatus(selectedSong));
    } else {
      setOtherGuesses((prev) => [...prev, { ...selectedSong, correctStatus: getCorrectStatus(selectedSong), id: createId(), guessListId: createId() }]);
    }
  };

  // disable the song if it has already been selected or the user has completed today's heardle
  const disableOption = (song: Song) => {
    return guesses.some((guess) => guess.name === song.name) || finishedHeardle(guesses);
  };

  return (
    <select
      ref={ref}
      className="select select-primary w-full md:w-3/5 xl:w-2/5 place-self-center"
      defaultValue={'Choose a song!'}
      onChange={handleSelection}
      disabled={songsLoading || songLoading || !heardleSong}
    >
      <option className="default_selection">Choose a song!</option>
      {songs?.map((song) => (
        <option key={song.id} value={song.name} disabled={disableOption(song)}>
          {song.name}
        </option>
      ))}
    </select>
  );
});

export default MySongSelectInput;
