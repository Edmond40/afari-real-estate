import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';

// Backend routes (mounted under /api/users):
// - POST /signup (public) -> create user (expects name, email, password, passwordConfirm, role?)
// - GET /         (admin) -> list users
// - GET /:id      (admin) -> get user
// - PATCH /:id    (admin) -> update user
// - DELETE /:id   (admin) -> delete user

export function useUsers(params = {}) {
  const queryClient = useQueryClient();

  const sanitized = useMemo(() => ({
    page: params.page || 1,
    limit: params.limit || 20,
    search: params.search || undefined,
  }), [params.page, params.limit, params.search]);

  const queryKey = ['users', sanitized];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const sp = new URLSearchParams();
        if (sanitized.page) sp.append('page', String(sanitized.page));
        if (sanitized.limit) sp.append('limit', String(sanitized.limit));
        if (sanitized.search) sp.append('search', sanitized.search);
        const { data } = await api.get(`/users?${sp.toString()}`);
        // Compatible shapes: either { data: { users, total, ... } } or { users }
        const payload = data?.data || data || {};
        const users = payload.users || payload.items || [];
        const meta = payload.meta || {
          total: payload.total || users.length,
          currentPage: sanitized.page,
          totalPages: payload.totalPages || 1,
        };
        return { users, meta };
      } catch (err) {
        console.error('Error fetching users:', err);
        // Return fallback data instead of throwing
        return { users: [], meta: { total: 0, currentPage: sanitized.page, totalPages: 1 } };
      }
    },
    keepPreviousData: true,
    retry: 2,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      // Expect: { name, email, password, passwordConfirm, role }
      const { data } = await api.post('/users/signup', payload);
      return data?.data?.user || data?.user || data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.patch(`/users/${id}`, updates);
      return data?.data?.user || data?.user || data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/users/${id}`);
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return {
    users: data?.users || [],
    meta: data?.meta,
    loading: isLoading,
    error: isError ? (error?.message || 'Failed to load users') : null,
    refetch,
    params: sanitized,
    // mutations
    create: createMutation.mutateAsync,
    updating: updateMutation.isPending,
    update: updateMutation.mutateAsync,
    removing: deleteMutation.isPending,
    remove: deleteMutation.mutateAsync,
  };
}
