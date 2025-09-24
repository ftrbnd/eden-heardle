'use client';

import SignInButton from '../buttons/SignInButton';
import { MouseEvent, useState } from 'react';
import { faCopy, faRankingStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import useGuesses from '@/hooks/useGuesses';
import useDailySong from '@/hooks/useDailySong';
import useStatistics from '@/hooks/useStatistics';
import StatsGrid from '../StatsGrid';
import { finishedHeardle, statusSquares } from '@/utils/helpers';
import { ModalButton } from '../buttons/RedirectButton';
import { useSession } from 'next-auth/react';
import { getFirstCompletedDaily } from '@/services/leaderboard';
import { useQuery } from '@tanstack/react-query';

export default function StatsModal() {
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: session } = useSession();
  const { guesses, guessType } = useGuesses();
  const { stats, loadingStats } = useStatistics();

  const { dailySong } = useDailySong();

  const { data: firstCompletedDaily } = useQuery({
    queryKey: ['first'],
    queryFn: getFirstCompletedDaily,
    refetchInterval: 30000,
    refetchIntervalInBackground: true
  });

  const userFirstCompletedDaily = session ? firstCompletedDaily?.user?.id === session?.user.id : false;

  const copyToClipboard = async (e: MouseEvent) => {
    e.preventDefault();
    if (showSuccess || !guesses) return;

    setShowSuccess(true);
    await navigator.clipboard.writeText(`EDEN Heardle #${dailySong?.heardleDay} ${statusSquares(guesses.map((g) => g.correctStatus)).replace(/\s/g, '')}${userFirstCompletedDaily ? `🥇` : ''}`);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <dialog id="stats_modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box min-w-min max-h-80 sm:max-h-max">
        <h3 className="font-bold text-lg">Statistics</h3>
        <StatsGrid stats={stats} userId={session?.user.id} loading={loadingStats} />

        {guesses && finishedHeardle(guesses) && (
          <div className="flex justify-center pb-4">
            <kbd className="kbd">{statusSquares(guesses?.map((g) => g.correctStatus))}</kbd>
          </div>
        )}

        <div className="flex justify-end gap-2 list-none">
          <ModalButton title="Leaderboard" modalId="leaderboard_modal" className="btn btn-outline btn-secondary">
            <FontAwesomeIcon icon={faRankingStar} className="h-6 w-6" />
          </ModalButton>

          {guessType === 'local' && <SignInButton />}
          {guesses && finishedHeardle(guesses) && (
            <motion.button
              className={`btn ${showSuccess ? 'btn-success' : 'btn-primary'}`}
              onClick={(e) => copyToClipboard(e)}
              whileHover={{
                scale: 1.1,
                transition: {
                  duration: 0.2
                }
              }}
              whileTap={{ scale: 0.9 }}
            >
              {showSuccess ? 'Copied!' : 'Share'}
              <FontAwesomeIcon icon={faCopy} className="h-6 w-6" />
            </motion.button>
          )}
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>Close</button>
      </form>
    </dialog>
  );
}
