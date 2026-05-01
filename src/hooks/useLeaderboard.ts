import useSWR from 'swr';
import axios from 'axios';
import { API_BASE } from '../lib/apiBase';
import { api } from '../lib/authApi';
import type { 
  IndividualLeaderboardResponse, 
  CampusLeaderboardResponse 
} from '../types/leaderboard';

const fetcher = async (url: string) => {
  const res = await api.get(url, { withCredentials: true });
  return res.data;
};

export function useIndividualLeaderboard() {
  const { data, error, isLoading } = useSWR<IndividualLeaderboardResponse>(
    'individual-leaderboard',
    async () => {
      // Use absolute URL to be 100% sure of the path
      const url = `${API_BASE}/api/articles/leaderboard/`;
      const res = await axios.get(url, { withCredentials: true });
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
      const url = `${API_BASE}/api/articles/leaderboard/campuses/`;
      const res = await axios.get(url, { withCredentials: true });
      return res.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );
  return { data, error, isLoading };
}

export function useCampuses() {
  const { data, error, isLoading } = useSWR<any>(
    'campuses-list',
    async () => {
      const url = `${API_BASE}/api/campuses/`;
      const res = await axios.get(url, { withCredentials: true });
      return res.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 86400_000, // Revalidate daily
    }
  );
  
  const campuses = Array.isArray(data) ? data : (data?.results ?? []);
  return { data: campuses, error, isLoading };
}

export function useMyCampusLeaderboard(enabled: boolean = true) {
  const { data, error, isLoading } = useSWR<IndividualLeaderboardResponse>(
    enabled ? 'my-campus-leaderboard' : null,
    async () => {
      const url = `${API_BASE}/api/articles/leaderboard/campus/mine/`;
      const res = await axios.get(url, { withCredentials: true });
      return res.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );
  return { data, error, isLoading };
}
