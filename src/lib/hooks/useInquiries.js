import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export function useInquiries(params = {}) {
  const queryClient = useQueryClient();

  const sanitized = useMemo(() => ({
    page: params.page || 1,
    limit: params.limit || 10,
    search: params.search || '',
    status: params.status || ''
  }), [params.page, params.limit, params.search, params.status]);

  const queryKey = ['inquiries', sanitized];

  const { 
    data = { inquiries: [], meta: { total: 0, page: 1, totalPages: 1, limit: 10 } },
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const sp = new URLSearchParams();
        sp.append('page', String(sanitized.page));
        sp.append('limit', String(sanitized.limit));
        if (sanitized.search) sp.append('search', sanitized.search);
        if (sanitized.status) sp.append('status', sanitized.status);
        
        const { data } = await api.get(`/inquiries?${sp.toString()}`);
        
        // Handle both response formats for backward compatibility
        if (data.data && data.meta) {
          return {
            inquiries: data.data,
            meta: data.meta
          };
        }
        
        // Fallback to legacy format
        return {
          inquiries: data.inquiries || data.items || [],
          meta: data.meta || {
            total: data.total || 0,
            currentPage: sanitized.page,
            totalPages: data.totalPages || 1,
            limit: sanitized.limit
          }
        };
      } catch (error) {
        console.error('Error fetching inquiries:', error);
        // Return fallback data instead of throwing
        return {
          inquiries: [],
          meta: {
            total: 0,
            currentPage: sanitized.page,
            totalPages: 1,
            limit: sanitized.limit
          }
        };
      }
    },
    keepPreviousData: true,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const createInquiry = useMutation({
    mutationFn: async (inquiryData) => {
      try {
        const { data } = await api.post('/inquiries', inquiryData);
        return data;
      } catch (error) {
        console.error('Error creating inquiry:', error);
        throw new Error(error.response?.data?.message || 'Failed to create inquiry');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });

  const updateInquiryStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      try {
        const { data } = await api.patch(`/inquiries/${id}`, { status });
        return data;
      } catch (error) {
        console.error('Error updating inquiry status:', error);
        throw new Error(error.response?.data?.message || 'Failed to update inquiry status');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });

  const deleteInquiry = useMutation({
    mutationFn: async (id) => {
      try {
        await api.delete(`/inquiries/${id}`);
        return id;
      } catch (error) {
        console.error('Error deleting inquiry:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete inquiry');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });

  return {
    // Data
    inquiries: data.inquiries || [],
    meta: data.meta || { total: 0, page: 1, totalPages: 1, limit: 10 },
    loading: isLoading,
    error,
    refetch,
    
    // Mutations
    createInquiry: createInquiry.mutateAsync,
    isCreating: createInquiry.isLoading,
    
    updateInquiryStatus: updateInquiryStatus.mutateAsync,
    isUpdatingStatus: updateInquiryStatus.isLoading,
    
    deleteInquiry: deleteInquiry.mutateAsync,
    isDeleting: deleteInquiry.isLoading,
    
    // Pagination and filtering
    page: sanitized.page,
    limit: sanitized.limit,
    search: sanitized.search,
    status: sanitized.status,
  };
}
