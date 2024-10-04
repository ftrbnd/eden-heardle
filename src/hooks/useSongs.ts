import { getSongs } from '@/services/songs';
import { useQuery } from '@tanstack/react-query';

const useSongs = () => {
  const { data: songs, isPending: songsPending } = useQuery({
    queryKey: ['songs'],
    queryFn: getSongs,
    refetchInterval: 30000, // 30 seconds,
    refetchIntervalInBackground: true,
    gcTime: 1 * 1000 * 60 // 1 minute
  });

  return { songs, songsPending };
};

export default useSongs;
