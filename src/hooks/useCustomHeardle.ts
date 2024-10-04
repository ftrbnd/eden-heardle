import { createCustomHeardle, deleteCustomHeardle } from '@/services/customHeardles';
import { getUserCustomHeardle } from '@/services/users';
import { Song } from '@prisma/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

interface CreateFn {
  selectedSong: Song;
  startTime: number;
}

const useCustomHeardle = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['userCustomHeardle', session?.user.id],
    queryFn: () => getUserCustomHeardle(session?.user.id ?? 'fakeid'),
    enabled: session?.user.id !== null && session?.user.id !== undefined
  });

  const createHeardleMutation = useMutation({
    mutationFn: (variables: CreateFn) => createCustomHeardle(variables.selectedSong, variables.startTime, session?.user.id!),
    onError: (error: any) => {
      throw new Error(error.message);
    },
    onSuccess: (link) => {
      queryClient.invalidateQueries({ queryKey: ['userCustomHeardle', session?.user.id] });
      return link;
    }
  });

  const deleteHeardleMutation = useMutation({
    mutationFn: () => deleteCustomHeardle(data?.id ?? 'fakeheardleid', session?.user.id ?? 'fakeuserid'),
    onError: (error: any) => {
      throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCustomHeardle', session?.user.id] });
    }
  });

  const create = async (selectedSong: Song, startTime: number) => {
    const link = await createHeardleMutation.mutateAsync({ selectedSong, startTime });
    return link;
  };

  const remove = async () => {
    await deleteHeardleMutation.mutateAsync();
  };

  return { data, create, remove, createLoading: createHeardleMutation.isPending, deleteLoading: deleteHeardleMutation.isPending };
};

export default useCustomHeardle;
