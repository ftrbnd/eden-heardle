'use client';

import { getAnnouncement } from '@/services/announcements';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

interface AnnouncementProps {
  setShowBanner: Dispatch<SetStateAction<boolean>>;
}

export default function AnnouncementBanner({ setShowBanner }: AnnouncementProps) {
  const { data: announcement } = useQuery({
    queryKey: ['announcement'],
    queryFn: getAnnouncement
  });

  const router = useRouter();

  const handleBannerClick = () => {
    router.push(announcement?.link ?? '/');
  };

  const status =
    announcement?.status === 'success'
      ? ' bg-success text-success-content'
      : announcement?.status === 'error'
      ? 'bg-error text-error-content'
      : announcement?.status === 'info'
      ? 'bg-info text-info-content'
      : '';

  return (
    <div className={`flex items-center justify-between w-full h-min p-2 ${status}`}>
      <button onClick={handleBannerClick} className="flex-1 btn btn-ghost w-3/4 text-xs lg:text-lg">
        {announcement?.text}
      </button>
      <button className="btn btn-ghost px-1 sm:px-2" onClick={() => setShowBanner(false)}>
        <FontAwesomeIcon icon={faClose} className="h-4 w-4" />
      </button>
    </div>
  );
}
