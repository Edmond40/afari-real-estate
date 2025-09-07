import { useQuery } from '@tanstack/react-query';
import api from '../api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      try {
        const response = await api.get('/dashboard/stats');
        return response.data;
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return fallback data instead of throwing
        return {
          infoCards: [
            { Title: "Total Users", Users: "0" },
            { Title: "Total Properties", Users: "0" },
            { Title: "Active Listings", Users: "0" },
            { Title: "Total Agents", Users: "0" }
          ],
          userCardStat: [
            { Title: "Active Listings", Users: 0 },
            { Title: "Total Properties", Users: 0 },
            { Title: "Inquiries", Users: 0 },
            { Title: "Pending Inquiries", Users: 0 },
            { Title: "Total Agents", Users: 0 },
            { Title: "Total Users", Users: 0 }
          ]
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useSavedProperties() {
  return useQuery({
    queryKey: ['dashboard', 'saved-properties'],
    queryFn: async () => {
      try {
        const response = await api.get('/dashboard/saved-properties');
        return response.data;
      } catch (error) {
        console.error('Error fetching saved properties:', error);
        // Return fallback data instead of throwing
        return { savedProperties: [] };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
