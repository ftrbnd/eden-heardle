import { faGem } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useEffect, useRef, MouseEvent } from 'react';
import StatsGrid from '../StatsGrid';
import { getStats } from '@/services/users';

export default function ProfileModal({ user, showProfile, setShowProfile }: { user: User; showProfile: boolean; setShowProfile: (show: boolean) => void }) {
  const modalRef = useRef<HTMLDialogElement | null>(null);

  const { data: userStats, isPending } = useQuery({
    queryKey: ['stats', user.id],
    queryFn: () => getStats(user.id)
  });

  useEffect(() => {
    if (showProfile) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [showProfile, user.id]);

  const closeModal = (e: MouseEvent) => {
    e.preventDefault();
    setShowProfile(false);
  };

  return (
    <dialog ref={modalRef} id={`profile_${user.id}_modal`} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box min-w-min max-h-80 sm:max-h-max">
        <div className="grid grid-cols-2">
          <div className="flex justify-start items-center gap-2">
            <h3 className="font-bold text-2xl place-self-start self-center">{user.name}</h3>
            {user.earlySupporter && (
              <div className="tooltip" data-tip="Early Supporter">
                <FontAwesomeIcon className="w-6 h-6 text-accent" icon={faGem} />
              </div>
            )}
          </div>
          <div className="avatar place-self-end">
            <div className="w-16 rounded-full">
              <Image src={user.image || '/default.png'} alt={`${user.name}'s Avatar`} height={100} width={100} />
            </div>
          </div>
        </div>
        {!isPending && userStats && <StatsGrid stats={userStats} userId={user.id} />}
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={(e) => closeModal(e)}>Close</button>
      </form>
    </dialog>
  );
}
