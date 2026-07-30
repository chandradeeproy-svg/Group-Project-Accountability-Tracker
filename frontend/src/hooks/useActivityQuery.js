import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext.jsx';

const ACTIVITY_QUERY_KEY = (projectId, filters) => [
  'activity',
  projectId,
  filters,
];

export function useProjectActivity(projectId, filters = {}) {
  const { token } = useAuth();

  const queryParams = new URLSearchParams({
    limit: filters.limit || 50,
    offset: filters.offset || 0,
    ...(filters.type && { type: filters.type }),
    ...(filters.userId && { userId: filters.userId }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  });

  return useQuery({
    queryKey: ACTIVITY_QUERY_KEY(projectId, filters),
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/activity?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch activity');
      }

      return response.json();
    },
    enabled: !!token && !!projectId,
    staleTime: 1 * 60 * 1000,
  });
}
