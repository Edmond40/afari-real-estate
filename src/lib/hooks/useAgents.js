import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export function useAgents(params = {}) {
  const queryClient = useQueryClient();

  const sanitized = useMemo(() => ({
    page: params.page || 1,
    limit: params.limit || 20,
    search: params.search || undefined,
  }), [params.page, params.limit, params.search]);

  const queryKey = ['agents', sanitized];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await api.get('/agents');
        const payload = response?.data?.data || {};
        
        // Get agents from the response - handle both direct array and nested data.agents
        let agents = [];
        if (Array.isArray(payload.agents)) {
          agents = payload.agents;
        } else if (Array.isArray(payload)) {
          agents = payload;
        } else if (Array.isArray(response?.data)) {
          agents = response.data;
        }
        
        // Format agents with default values
        const formattedAgents = agents.map(agent => ({
          id: agent.id,
          name: agent.name || '',
          email: agent.email || '',
          phone: agent.phone || '',
          address: agent.address || '',
          status: agent.status || 'ACTIVE',
          image: agent.image || null,
          description: agent.description || '',
          about: agent.about || agent.description || '',
          specialization: agent.specialization || null,
          propertyCount: agent.propertyCount || agent._count?.listings || 0,
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt,
          // Ensure _count exists for backward compatibility
          _count: {
            listings: agent.propertyCount || agent._count?.listings || 0
          }
        }));
        
        return {
          agents: formattedAgents,
          meta: {
            total: payload.total || formattedAgents.length,
            currentPage: payload.currentPage || 1,
            totalPages: payload.totalPages || 1
          }
        };
      } catch (err) {
        console.error('Error fetching agents:', err);
        // Return fallback data instead of throwing
        return { agents: [], meta: { total: 0, currentPage: 1, totalPages: 1 } };
      }
    },
    keepPreviousData: true,
    retry: 2,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      try {
        // Ensure description is set from about field
        const agentData = {
          ...payload,
          description: payload.about || payload.description || '',
          specialization: payload.specialization || null
        };
        
        const response = await api.post('/agents', agentData);
        const agent = response?.data?.data?.agent || response?.data?.agent || response?.data;
        
        if (!agent) {
          throw new Error('No agent data returned from server');
        }
        
        // Format the response to match our frontend expectations
        return {
          ...agent,
          about: agent.description || agent.about || '',
          propertyCount: agent.propertyCount || agent._count?.listings || 0,
          _count: {
            listings: agent.propertyCount || agent._count?.listings || 0
          }
        };
      } catch (error) {
        console.error('Create agent error:', error);
        throw new Error(error.response?.data?.message || 'Failed to create agent');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      try {
        // Map about to description for the backend
        const updateData = {
          ...updates,
          ...(updates.about !== undefined && { description: updates.about }),
          ...(updates.specialization !== undefined && { 
            specialization: updates.specialization || null 
          })
        };
        
        const response = await api.patch(`/agents/${id}`, updateData);
        const agent = response?.data?.data?.agent || response?.data?.agent || response?.data;
        
        if (!agent) {
          console.error('No agent data in response:', response);
          throw new Error('No agent data returned from server');
        }
        
        // Format the response to match our frontend expectations
        return {
          ...agent,
          about: agent.description || agent.about || '',
          propertyCount: agent.propertyCount || agent._count?.listings || 0,
          _count: {
            listings: agent.propertyCount || agent._count?.listings || 0
          }
        };
      } catch (error) {
        console.error('Update agent error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
          }
        });
        
        // Extract error message from different possible locations
        const errorMessage = 
          error.response?.data?.message || 
          error.response?.data?.error ||
          error.message || 
          'Failed to update agent';
          
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      try {
        await api.delete(`/agents/${id}`);
        return id;
      } catch (error) {
        console.error('Delete agent error:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete agent');
      }
    },
    onSuccess: () => {
      // Don't show toast here, let the component handle it
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  return {
    agents: data?.agents || [],
    meta: data?.meta,
    loading: isLoading,
    error: isError ? (error?.message || 'Failed to load agents') : null,
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
