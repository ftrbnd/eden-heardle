import { ModalButton } from '@/components/buttons/RedirectButton';
import { statusSquares, onCustomHeardlePage } from '@/utils/helpers';
import { faArrowRotateRight, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CustomHeardle, DailySong, GuessedSong, UnlimitedHeardle, User } from '@prisma/client';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { CSSProperties, useState, useEffect, MouseEvent } from 'react';

interface ResultCardProps {
  song?: DailySong | CustomHeardle | UnlimitedHeardle;
  guessedSong: boolean;
  customHeardleCreator?: User;
  otherHeardleGuesses?: GuessedSong[];
  onUnlimitedHeardlePage?: boolean;
  getNewUnlimitedSong?: () => Promise<void>;
}

interface CSSPropertiesWithVars extends CSSProperties {
  '--value': number;
}

function Countdown() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const now = new Date();

    const currentUTCHours = now.getUTCHours();
    const currentUTCMinutes = now.getUTCMinutes();
    const currentUTCSeconds = now.getUTCSeconds();

    // 4am UTC
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
            console.log('Countdown to 4 AM UTC has reached 0!');
            router.replace('/');

            clearInterval(intervalId);
          }
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [router]);

  return (
    <div className="card-actions justify-center">
      <div className={`grid grid-flow-col gap-5 text-center auto-cols-max ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        <div className="flex flex-col p-2 rounded-box bg-base-100">
          <span className="countdown font-mono text-3xl sm:text-5xl">
            <span id="hours" style={{ '--value': hours } as CSSPropertiesWithVars}></span>
          </span>
          hours
        </div>
        <div className="flex flex-col p-2 rounded-box bg-base-100">
          <span className="countdown font-mono text-3xl sm:text-5xl">
            <span id="minutes" style={{ '--value': minutes } as CSSPropertiesWithVars}></span>
          </span>
          min
        </div>
        <div className="flex flex-col p-2 rounded-box bg-base-100">
          <span className="countdown font-mono text-3xl sm:text-5xl">
            <span id="seconds" style={{ '--value': seconds } as CSSPropertiesWithVars}></span>
          </span>
          sec
        </div>
      </div>
    </div>
  );
}

export default function ResultCard({ song, guessedSong, customHeardleCreator, otherHeardleGuesses, getNewUnlimitedSong }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  const copyToClipboard = async (e: MouseEvent) => {
    e.preventDefault();
    if (copied || !otherHeardleGuesses) return;

    setCopied(true);
    await navigator.clipboard.writeText(`EDEN Heardle #${customHeardleCreator?.name} ${statusSquares(otherHeardleGuesses.map((g) => g.correctStatus)).replace(/\s/g, '')}`);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <motion.div className="self-end card bg-base-100 shadow-xl image-full overflow-hidden mb-4 mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3 }}>
      <figure>
        <Image src={song?.cover ?? ''} alt={song?.name ?? 'Song name'} fill style={{ objectFit: 'cover' }} priority />
      </figure>
      <div className="card-body items-center">
        <h2 className="font-bold text-center text-lg sm:text-xl md:text-2xl">{guessedSong ? `Great job on ${pathname === '/play' ? "today's" : 'this'} puzzle!` : `The song was ${song?.name}`}</h2>
        {(onCustomHeardlePage(pathname) || pathname === '/play/unlimited') && otherHeardleGuesses ? (
          <>
            <kbd className="kbd">{statusSquares(otherHeardleGuesses.map((g) => g.correctStatus))}</kbd>
            {onCustomHeardlePage(pathname) && <p className="text-md">Created by {customHeardleCreator?.name}</p>}
            <div className="flex gap-2 list-none">
              {/* due to ModalButton being a list item */}
              {pathname !== '/play/unlimited' && (
                <button className={`btn ${copied ? 'btn-success' : 'btn-primary'}`} onClick={(e) => copyToClipboard(e)}>
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
                  <FontAwesomeIcon icon={faCopy} className="h-6 w-6" />
                </button>
              )}
              {onCustomHeardlePage(pathname) && <ModalButton title="Create your own" modalId="custom_heardle_modal" className="btn btn-outline" />}
              {pathname === '/play/unlimited' && (
                <button onClick={getNewUnlimitedSong} className="btn glass btn-ghost">
                  New Song
                  <FontAwesomeIcon icon={faArrowRotateRight} className="h-6 w-6" />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 list-none">
            <p className="text-md">{guessedSong ? 'Check back tomorrow for a new song.' : 'Try again tomorrow!'}</p>
            <Countdown />
            <ModalButton title="View Statistics" modalId="stats_modal" className="btn glass btn-ghost" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
