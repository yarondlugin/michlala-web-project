import { useQuery } from '@tanstack/react-query';
import { fetchUserById } from '../queries/users';

export const useMyDetails = (userId?: string) => {
    const { isFetching, data: userResult } = useQuery({
        queryKey: ['users', userId],
        queryFn: ({ queryKey }) => fetchUserById(queryKey[1] as string),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled: !!userId,
    });

    return { userResult, isFetching };
};
