import useSWR from 'swr';
import { nextAuthApi } from '../lib/authApi';
import type { 
  IndividualLeaderboardResponse, 
  CampusLeaderboardResponse 
} from '../types/leaderboard';

export function useIndividualLeaderboard() {
  const { data, error, isLoading } = useSWR<IndividualLeaderboardResponse>(
    'individual-leaderboard',
    async () => {
      // Call local proxy route
      const res = await nextAuthApi.get('/api/articles/leaderboard');
      return res.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );
  return { data, error, isLoading };
}

export function useCampusLeaderboard() {
  const { data, error, isLoading } = useSWR<CampusLeaderboardResponse>(
    'campus-leaderboard',
    async () => {
      // Call local proxy route
      const res = await nextAuthApi.get('/api/articles/leaderboard/campuses');
      return res.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );
  return { data, error, isLoading };
}

export function useMyCampusLeaderboard(enabled: boolean = true) {
  const { data, error, isLoading } = useSWR<IndividualLeaderboardResponse>(
    enabled ? 'my-campus-leaderboard' : null,
    async () => {
      // Call local proxy route which handles authentication
      const res = await nextAuthApi.get('/api/articles/leaderboard/campus/mine');
      return res.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
      shouldRetryOnError: false, 
    }
  );
  return { data, error, isLoading };
}
