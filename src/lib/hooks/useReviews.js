import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';

// useReviews: list, create, delete reviews for a listing (React Query version)
// Backend: nested routes under /listings/:listingId/reviews (protected)
export function useReviews(listingId) {
  const queryClient = useQueryClient();

  const canPost = useMemo(() => !!localStorage.getItem('token'), []);

  const {
    data: reviewsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reviews', listingId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/listings/${listingId}/reviews`);
        return data?.data?.reviews || data?.reviews || [];
      } catch (err) {
        // If backend route is not implemented yet, gracefully degrade
        if (err?.response?.status === 404) return [];
        throw err;
      }
    },
    enabled: !!listingId,
  });

  const createMutation = useMutation({
    mutationFn: async ({ rating, comment }) => {
      try {
        const { data } = await api.post(`/listings/${listingId}/reviews`, { rating, comment });
        return data?.data?.review || data?.review;
      } catch (err) {
        if (err?.response?.status === 404) {
          // No backend yet: emulate saved review locally
          return {
            id: `temp-${Date.now()}`,
            rating,
            comment,
            user: { id: 'me', name: 'You' },
            createdAt: new Date().toISOString(),
          };
        }
        throw err;
      }
    },
    onMutate: async (variables) => {
      const temp = {
        id: `temp-${Date.now()}`,
        rating: variables.rating,
        comment: variables.comment,
        user: { id: 'me', name: 'You', photo: null },
        createdAt: new Date().toISOString(),
        _optimistic: true,
      };
      const key = ['reviews', listingId];
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData(key) || [];
      queryClient.setQueryData(key, (old = []) => [temp, ...old]);
      return { prev, tempId: temp.id };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      queryClient.setQueryData(['reviews', listingId], ctx.prev);
    },
    onSuccess: (saved, _vars, ctx) => {
      const key = ['reviews', listingId];
      queryClient.setQueryData(key, (old = []) => [saved, ...old.filter((r) => r.id !== ctx?.tempId)]);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', listingId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (reviewId) => {
      try {
        await api.delete(`/reviews/${reviewId}`);
      } catch (err) {
        // ignore when backend not present
      }
      return reviewId;
    },
    onMutate: async (reviewId) => {
      const key = ['reviews', listingId];
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData(key) || [];
      queryClient.setQueryData(key, (old = []) => old.filter((r) => r.id !== reviewId));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (!ctx) return;
      const key = ['reviews', listingId];
      queryClient.setQueryData(key, ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', listingId] });
    },
  });

  const reviews = reviewsData || [];
  const loading = isLoading; // keep the same name API as before

  return {
    reviews,
    loading,
    error,
    refetch,
    create: createMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    canPost,
  };
}
