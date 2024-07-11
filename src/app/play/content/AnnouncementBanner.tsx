import { clientEnv } from '@/utils/env';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

interface AnnouncementProps {
  setShowBanner: Dispatch<SetStateAction<boolean>>;
}

export default function AnnouncementBanner({ setShowBanner }: AnnouncementProps) {
  const router = useRouter();

  const handleBannerClick = () => {
    router.push(clientEnv.NEXT_PUBLIC_ANNOUNCEMENT_LINK ?? '/');
  };

  const status =
    clientEnv.NEXT_PUBLIC_ANNOUNCEMENT_STATUS === 'success'
      ? ' bg-success text-success-content'
      : clientEnv.NEXT_PUBLIC_ANNOUNCEMENT_STATUS === 'error'
      ? 'bg-error text-error-content'
      : clientEnv.NEXT_PUBLIC_ANNOUNCEMENT_STATUS === 'info'
      ? 'bg-info text-info-content'
      : '';

  return (
    <div className={`flex items-center justify-between w-full h-min p-2 ${status}`}>
      <button onClick={handleBannerClick} className="flex-1 btn btn-ghost w-3/4 text-xs lg:text-lg">
        {clientEnv.NEXT_PUBLIC_ANNOUNCEMENT_TEXT}
      </button>
      <button className="btn btn-ghost px-1 sm:px-2" onClick={() => setShowBanner(false)}>
        <FontAwesomeIcon icon={faClose} className="h-4 w-4" />
      </button>
    </div>
  );
}
