import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';

// useListings with React Query: server-side pagination and filters + CRUD
// initialParams example: { page: 1, limit: 12, type: 'House', status: 'For Sale' }
export function useListings(initialParams = {}) {
  const [params] = useState({ page: 1, limit: 12, ...initialParams });
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['listings', params],
    queryFn: async () => {
      try {
        const { data } = await api.get('/listings', { params });
        // Accept multiple API shapes. Our server returns { items, total, page, limit }
        const items = data?.data?.listings || data?.listings || data?.items || [];
        const meta = {
          total: data?.total ?? data?.data?.total ?? items.length,
          totalPages: data?.totalPages ?? data?.data?.totalPages ?? 1,
          currentPage: data?.currentPage ?? data?.data?.currentPage ?? params.page ?? 1,
        };
        return { items, meta };
      } catch (err) {
        console.error('Error fetching listings:', err);
        // Return fallback data instead of throwing
        return { items: [], meta: { total: 0, totalPages: 1, currentPage: params.page ?? 1 } };
      }
    },
    retry: 2,
  });


  // CREATE
  // In useListings.js, update the create mutation to properly format the data
const createMutation = useMutation({
  mutationFn: async (payload) => {
    // Ensure proper data formatting
    const formattedPayload = {
      ...payload,
      // Convert string numbers to actual numbers
      price: Number(payload.price),
      bedrooms: Number(payload.bedrooms),
      bathrooms: Number(payload.bathrooms),
      area: Number(payload.area),
      // Ensure images is an array
      images: Array.isArray(payload.images) ? payload.images : [payload.images].filter(Boolean),
      // Ensure features is an array
      features: Array.isArray(payload.features) ? payload.features : [],
      // Ensure agentId is a number if it exists
      agentId: payload.agentId ? Number(payload.agentId) : undefined
    };

    const { data } = await api.post('/listings', formattedPayload);
    return data?.data?.listing || data?.listing || data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['listings'] });
  },
});

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.patch(`/listings/${id}`, payload);
      return data?.data?.listing || data?.listing || data;
    },
    onMutate: async () => {
      const key = ['listings'];
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData(key);
      // Best-effort optimistic update for any listings cache pages
      queryClient.setQueryData(key, (old) => {
        if (!old) return old;
        // old could be a map of queries; rely on invalidate if shape differs
        return old;
      });
      return { prev };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/listings/${id}`);
      return id;
    },
    onMutate: async (id) => {
      const key = ['listings', params];
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData(key);
      if (prev) {
        queryClient.setQueryData(key, (old) => {
          if (!old) return old;
          return { ...old, items: (old.items || []).filter((it) => it.id !== id) };
        });
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      const key = ['listings', params];
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });

  const memoizedReturn = useMemo(() => {
    const sanitized = { ...params };
    return {
      listings: data?.items || [],
      meta: data?.meta,
      loading: isLoading,
      error: isError ? error?.message || 'Failed to load listings' : null,
      refetch,
      params: sanitized,
      // mutations
      create: createMutation.mutateAsync,
      creating: createMutation.isPending,
      update: updateMutation.mutateAsync,
      updating: updateMutation.isPending,
      remove: deleteMutation.mutateAsync,
      removing: deleteMutation.isPending,
    };
  }, [data, isLoading, isError, error, refetch, params, createMutation, updateMutation, deleteMutation]);

  return memoizedReturn;
}
