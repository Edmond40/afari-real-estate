import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { useAuth } from '../../hooks/useAuth';

export function useUserInteractions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get user stats with error handling
  const { data: stats = { likes: 0, saved: 0, views: 0, appointments: 0 }, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      if (!user) {
        return { likes: 0, saved: 0, views: 0, appointments: 0 };
      }
      try {
        const { data } = await api.get('/user-interactions/stats');
        return data;
      } catch (error) {
        console.error('Error fetching user stats:', error);
        return { likes: 0, saved: 0, views: 0, appointments: 0 };
      }
    },
    enabled: !!user,
  });

  // Get liked properties with error handling
  const { data: likedProperties = [], isLoading: likesLoading } = useQuery({
    queryKey: ['liked-properties'],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      try {
        const { data } = await api.get('/user-interactions/likes');
        return data.properties || [];
      } catch (error) {
        console.error('Error fetching liked properties:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Get saved properties with error handling
  const { data: savedProperties = [], isLoading: savedLoading } = useQuery({
    queryKey: ['saved-properties'],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      try {
        const { data } = await api.get('/user-interactions/saved');
        return data.properties || [];
      } catch (error) {
        console.error('Error fetching saved properties:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Get viewing history with error handling
  const useViewingHistory = (params = {}) => {
    const sanitized = useMemo(() => ({
      page: params.page || 1,
      limit: params.limit || 20,
    }), [params.page, params.limit]);

    return useQuery({
      queryKey: ['viewing-history', sanitized],
      queryFn: async () => {
        if (!user) {
          return { properties: [], total: 0, currentPage: 1, totalPages: 1 };
        }
        try {
          const sp = new URLSearchParams();
          if (sanitized.page) sp.append('page', String(sanitized.page));
          if (sanitized.limit) sp.append('limit', String(sanitized.limit));
          const { data } = await api.get(`/user-interactions/viewing-history?${sp.toString()}`);
          return data || { properties: [], total: 0, currentPage: 1, totalPages: 1 };
        } catch (error) {
          console.error('Error fetching viewing history:', error);
          return { properties: [], total: 0, currentPage: 1, totalPages: 1 };
        }
      },
      enabled: !!user,
      keepPreviousData: true,
    });
  };

  // Like/Unlike property with error handling
  const likeMutation = useMutation({
    mutationFn: async ({ listingId, action }) => {
      if (!user) {
        throw new Error('Please log in to like properties');
      }
      try {
        if (action === 'like') {
          await api.post(`/user-interactions/likes/${listingId}`);
        } else {
          await api.delete(`/user-interactions/likes/${listingId}`);
        }
        return { listingId, action };
      } catch (error) {
        console.error(`Error ${action === 'like' ? 'liking' : 'unliking'} property:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liked-properties'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });

  // Save/Unsave property with error handling
  const saveMutation = useMutation({
    mutationFn: async ({ listingId, action }) => {
      if (!user) {
        throw new Error('Please log in to save properties');
      }
      try {
        if (action === 'save') {
          await api.post(`/user-interactions/saved/${listingId}`);
        } else {
          await api.delete(`/user-interactions/saved/${listingId}`);
        }
        return { listingId, action };
      } catch (error) {
        console.error(`Error ${action === 'save' ? 'saving' : 'unsaving'} property:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-properties'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });

  // Record view with error handling
  const viewMutation = useMutation({
    mutationFn: async (listingId) => {
      if (!user) {
        // Allow anonymous views, just don't record them
        return listingId;
      }
      try {
        await api.post(`/user-interactions/views/${listingId}`);
        return listingId;
      } catch (error) {
        console.error('Error recording view:', error);
        // Don't throw error for view recording failures
        return listingId;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewing-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });

  // Remove from viewing history mutation
  const removeFromViewingHistory = useMutation({
    mutationFn: async (propertyId) => {
      if (!user) {
        throw new Error('Please log in to modify viewing history');
      }
      await api.delete(`/user-interactions/viewing-history/${propertyId}`);
      return propertyId;
    },
    onSuccess: () => {
      // Invalidate and refetch the viewing history
      queryClient.invalidateQueries({ 
        queryKey: ['viewing-history', { page: 1, limit: 50 }] 
      });
      
      // Also update the stats
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
    onError: (error) => {
      console.error('Failed to remove from viewing history:', error);
    }
  });

  return {
    stats: stats || { likes: 0, saved: 0, views: 0, appointments: 0 },
    statsLoading,
    likedProperties: likedProperties || [],
    likesLoading,
    savedProperties: savedProperties || [],
    savedLoading,
    useViewingHistory,
    // Actions
    toggleLike: likeMutation.mutateAsync,
    toggleSave: saveMutation.mutateAsync,
    recordView: viewMutation.mutateAsync,
    removeFromViewingHistory: removeFromViewingHistory.mutateAsync,
    // Loading states
    isLiking: likeMutation.isLoading,
    isSaving: saveMutation.isLoading,
    isRecordingView: viewMutation.isLoading,
    isRemovingFromHistory: removeFromViewingHistory.isLoading,
  };
}
