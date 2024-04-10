import { getFirstCompletedDaily } from '@/services/leaderboard';
import { LocalStatistics } from '@/utils/types';
import { IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { faCalendarDays, faPercent, faBullseye, faArrowTrendUp, faTrophy, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

function StatBox({ stat, title, icon, tooltip, loading, isFirst }: { stat: any; title: string; icon: IconDefinition; tooltip?: string; loading?: boolean; isFirst?: boolean }) {
  return (
    <div className={`stat shadow ${isFirst ? 'bg-accent' : 'bg-base-200'} rounded-box`}>
      <div className={`stat-figure ${isFirst ? 'text-accent-content' : 'text-secondary'}`}>
        <FontAwesomeIcon icon={icon} className="w-8 h-8" />
      </div>
      <div className={`stat-title ${isFirst ? 'text-accent-content' : ''}`}>{title}</div>
      <div className="tooltip" data-tip={tooltip}>
        {loading || stat === undefined ? <div className="skeleton h-8 w-16"></div> : <div className={`stat-value text-left ${isFirst ? 'text-sm text-accent-content' : ''}`}>{stat}</div>}
      </div>
    </div>
  );
}

function StatsGrid({ stats, loading }: { stats: LocalStatistics | null | undefined; loading?: boolean }) {
  const { data: session } = useSession();

  const { data: firstCompletedDaily } = useQuery({
    queryKey: ['first'],
    queryFn: getFirstCompletedDaily,
    refetchInterval: 30000, // 30 seconds,
    refetchIntervalInBackground: true
  });

  return (
    <div className="grid grid-rows-3 sm:grid-cols-2 gap-2 py-4">
      <StatBox loading={loading} stat={stats?.gamesPlayed ?? 0} title={'Games Played'} icon={faCalendarDays} />
      <StatBox
        loading={loading}
        stat={Math.round(((stats?.gamesWon ?? 0) / (stats?.gamesPlayed || 1)) * 100)}
        title={'Win Percentage'}
        icon={faPercent}
        tooltip={`${stats?.gamesWon ?? 0} games won`}
      />
      <StatBox
        loading={loading}
        stat={Math.round(((stats?.accuracy ?? 0) / ((stats?.gamesPlayed || 1) * 6)) * 100)}
        title={'Accuracy'}
        icon={faBullseye}
        tooltip={`${(stats?.gamesPlayed ?? 0) * 6 - (stats?.accuracy ?? 0)} incorrect guesses overall`}
      />
      <StatBox loading={loading} stat={stats?.currentStreak ?? 0} title={'Current Streak'} icon={faArrowTrendUp} />
      <StatBox loading={loading} stat={stats?.maxStreak ?? 0} title={'Max Streak'} icon={faTrophy} />
      {session && session.user.id === firstCompletedDaily?.userId && (
        <StatBox loading={loading} stat={`Streak: ${firstCompletedDaily?.user?.statistics?.firstStreak}`} title="You were first today!" icon={faStar} isFirst />
      )}
    </div>
  );
}

export default StatsGrid;
