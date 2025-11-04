import { useQuery } from '@tanstack/react-query';
import { getCompanyRelationships, checkHealth } from '@/services/api';
import type { CompanyRelationshipsResponse } from '@/services/api';

/**
 * Hook to fetch company relationships from the backend
 */
export const useCompanyRelationships = (companyName: string | undefined) => {
  return useQuery<CompanyRelationshipsResponse>({
    queryKey: ['company-relationships', companyName],
    queryFn: () => {
      if (!companyName) {
        throw new Error('Company name is required');
      }
      return getCompanyRelationships(companyName);
    },
    enabled: !!companyName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to check API health
 */
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  });
};
